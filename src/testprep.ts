import type { ExerciseLanguage, ExerciseTarget, PracticeCard } from './data/types.ts'
import { activityTypesForTarget, buildSessionQuestions, shuffle, type PracticeQuestion } from './leitner.ts'
import { answerDisplayFor, choicesFor, exerciseLabel } from './question-choices.ts'
import { buildSprintQuestions, sprintCategoryOptions, type SprintCategory } from './sprint.ts'

export const TEST_PREP_STORAGE_KEY = 'leitner-boxes:testprep:v1'
export const DEFAULT_TEST_UNIT_IDS = ['a-01', 'a-02', 'a-03', 'a-04', 'a-05', 'a-06']

export const RECALL_ROUND_SIZE = 20
export const MOCK_TEST_SIZE = 40
export const MAX_MOCK_EXERCISES_PER_UNIT = 3
export const REQUEUE_GAP = 3
export const READINESS_WINDOW = 30
export const READINESS_MIN_ANSWERS = 5
export const READINESS_WARN_PERCENT = 60
const PERCENT = 100
const MIN_CHOICES = 2

/** Exercise kinds that read as plain multiple choice. Ordered and typed need tiles or a keyboard. */
export const MOCK_EXERCISE_TYPES = ['best-response', 'contextual-cloze', 'correction', 'reading', 'transformation', 'scenario'] as const
type MockExerciseType = typeof MOCK_EXERCISE_TYPES[number]

export type TestChoice = { value: string; label: string }

export type TestQuestion = {
  id: string
  unitId: string
  label: string
  prompt: string
  promptLanguage: ExerciseLanguage
  promptNote?: string
  answer: string
  answerLanguage: ExerciseLanguage
  choices: TestChoice[]
  progressId?: string
  recallable: boolean
  source?: PracticeQuestion
  feedback?: string
}

export type TestPrepState = {
  unitIds: string[]
  recent: Record<string, boolean[]>
  lastMock?: { score: number; total: number; date: string }
}

export type TestPrepStorage = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

function browserStorage(): TestPrepStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

function defaultTestPrepState(): TestPrepState {
  return { unitIds: [...DEFAULT_TEST_UNIT_IDS], recent: {} }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

export function loadTestPrep(storage: TestPrepStorage | undefined = browserStorage()): TestPrepState {
  const fallback = defaultTestPrepState()
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(TEST_PREP_STORAGE_KEY) ?? 'null')
    if (!parsed || typeof parsed !== 'object') return fallback
    const record = parsed as Record<string, unknown>
    const unitIds = isStringArray(record.unitIds) && record.unitIds.length > 0 ? record.unitIds : fallback.unitIds
    const recent: Record<string, boolean[]> = {}
    if (record.recent && typeof record.recent === 'object') {
      Object.entries(record.recent).forEach(([unitId, answers]) => {
        if (Array.isArray(answers) && answers.every((item) => typeof item === 'boolean')) recent[unitId] = answers.slice(-READINESS_WINDOW)
      })
    }
    const mock = record.lastMock as Record<string, unknown> | undefined
    const lastMock = mock && typeof mock.score === 'number' && typeof mock.total === 'number' && typeof mock.date === 'string'
      ? { score: mock.score, total: mock.total, date: mock.date }
      : undefined
    return { unitIds, recent, ...(lastMock ? { lastMock } : {}) }
  } catch {
    return fallback
  }
}

export function saveTestPrep(state: TestPrepState, storage: TestPrepStorage | undefined = browserStorage()): void {
  try {
    storage?.setItem(TEST_PREP_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ponytail: storage full or blocked; readiness is a nicety, not data
  }
}

/** Appends first-attempt answers per unit and keeps only the latest READINESS_WINDOW. */
export function recordAnswers(state: TestPrepState, answers: readonly { unitId: string; correct: boolean }[]): TestPrepState {
  const recent = { ...state.recent }
  answers.forEach(({ unitId, correct }) => {
    recent[unitId] = [...(recent[unitId] ?? []), correct].slice(-READINESS_WINDOW)
  })
  return { ...state, recent }
}

/** Percent correct over the recent answers, or undefined until there are enough to mean something. */
export function readiness(state: TestPrepState, unitId: string): number | undefined {
  const answers = state.recent[unitId] ?? []
  if (answers.length < READINESS_MIN_ANSWERS) return undefined
  return Math.round((answers.filter(Boolean).length / answers.length) * PERCENT)
}

/** Lowest readiness first; units with no readiness yet come before all of them. */
export function unitsWeakestFirst(state: TestPrepState, unitIds: readonly string[]): string[] {
  const rank = (unitId: string) => readiness(state, unitId) ?? -1
  return unitIds.map((unitId, index) => ({ unitId, index })).sort((a, b) => rank(a.unitId) - rank(b.unitId) || a.index - b.index).map((item) => item.unitId)
}

const CARD_CATEGORIES: readonly SprintCategory[] = ['french-to-english', 'english-to-french', 'verb-forms', 'noun-gender', 'numbers']
const categoryLabel = (category: SprintCategory) => sprintCategoryOptions.find((option) => option.id === category)?.label ?? category

/** Hands out card questions for one unit, rotating through the categories, one question per card. */
function unitCardSource(unitId: string, cards: readonly PracticeCard[], used: Set<string>, random: () => number): () => TestQuestion | undefined {
  const unitCards = cards.filter((card) => card.lessonId === unitId)
  const categories = CARD_CATEGORIES.filter((category) => category !== 'numbers' || unitCards.some((card) => card.kind === 'number'))
  const pools = categories.map((category) => buildSprintQuestions(category, unitCards, random).map((question) => ({ category, question })))
  // One from each category in turn, so a round mixes kinds instead of draining one.
  const interleaved = Array.from({ length: Math.max(...pools.map((pool) => pool.length), 0) }, (_, index) => pools.flatMap((pool) => pool[index] ?? [])).flat()
  return () => {
    const index = interleaved.findIndex((item) => !used.has(item.question.id))
    if (index < 0) return undefined
    const [{ category, question }] = interleaved.splice(index, 1)
    used.add(question.id)
    const note = question.promptNote
    return {
      id: question.id,
      unitId,
      label: categoryLabel(category),
      prompt: question.prompt,
      promptLanguage: question.promptLanguage,
      ...(note ? { promptNote: note } : {}),
      answer: question.answer,
      answerLanguage: question.answerLanguage,
      choices: question.choices.map((value) => ({ value, label: value })),
      ...(question.id.startsWith('n-') ? {} : { progressId: question.id }),
      recallable: true,
    }
  }
}

/** Takes one question per unit in turn (weakest first) until the round is full or every unit runs dry. */
function dealRoundRobin(unitIds: readonly string[], sources: Map<string, () => TestQuestion | undefined>, size: number): TestQuestion[] {
  const turns = Array.from({ length: size * unitIds.length }, (_, index) => unitIds[index % unitIds.length])
  return turns.reduce<TestQuestion[]>((dealt, unitId) => {
    const question = dealt.length < size ? sources.get(unitId)?.() : undefined
    return question ? [...dealt, question] : dealt
  }, [])
}

export function buildRecallRound(unitIds: readonly string[], cards: readonly PracticeCard[], state: TestPrepState, random: () => number = Math.random, size: number = RECALL_ROUND_SIZE): TestQuestion[] {
  const ordered = unitsWeakestFirst(state, unitIds)
  const used = new Set<string>()
  const sources = new Map(ordered.map((unitId) => [unitId, unitCardSource(unitId, cards, used, random)] as const))
  return dealRoundRobin(ordered, sources, size)
}

export type RoundRun = { queue: TestQuestion[]; done: number; firstTry: number; missed: TestQuestion[]; repeated: string[] }

export function startRound(questions: readonly TestQuestion[]): RoundRun {
  return { queue: [...questions], done: 0, firstTry: 0, missed: [], repeated: [] }
}

/** Pops the head. A first-attempt miss goes back REQUEUE_GAP places later (or last), once per question. */
export function advanceRound(run: RoundRun, correct: boolean): RoundRun {
  const [head, ...rest] = run.queue
  if (!head) return run
  const firstAttempt = !run.repeated.includes(head.id)
  if (correct) return { ...run, queue: rest, done: run.done + 1, firstTry: run.firstTry + (firstAttempt ? 1 : 0) }
  if (!firstAttempt) return { ...run, queue: rest, done: run.done + 1 }
  const at = Math.min(REQUEUE_GAP, rest.length)
  return { ...run, queue: [...rest.slice(0, at), head, ...rest.slice(at)], missed: [...run.missed, head], repeated: [...run.repeated, head.id] }
}

function exerciseQuestion(target: ExerciseTarget, type: MockExerciseType): TestQuestion | undefined {
  const [question] = buildSessionQuestions([target], {}, [type])
  if (!question?.exercise || !question.prompt) return undefined
  const values = [...new Set(choicesFor(question))]
  if (values.length < MIN_CHOICES || !values.includes(question.answer)) return undefined
  return {
    id: `ex-${target.id}`,
    unitId: target.lessonId,
    label: exerciseLabel(question) ?? type,
    prompt: question.prompt,
    promptLanguage: question.promptLanguage,
    answer: question.answer,
    answerLanguage: question.answerLanguage,
    choices: values.map((value) => ({ value, label: question.choiceLabels?.[value] ?? value })),
    progressId: target.id,
    recallable: false,
    source: question,
    feedback: question.exercise.feedback,
  }
}

/** Up to `limit` exercise questions for a unit, one kind each where the unit has them. */
function unitExerciseQuestions(unitId: string, targets: readonly ExerciseTarget[], limit: number, random: () => number): TestQuestion[] {
  const unitTargets = shuffle(targets.filter((target) => target.lessonId === unitId), random)
  const kindsOf = (target: ExerciseTarget) => activityTypesForTarget(target).filter((type): type is MockExerciseType => (MOCK_EXERCISE_TYPES as readonly string[]).includes(type))
  // First pass wants a new kind each time; the second tops up from the targets left.
  const attempts = [true, false].flatMap((distinctKinds) => unitTargets.map((target) => ({ target, distinctKinds })))
  const { picked } = attempts.reduce((state, { target, distinctKinds }) => {
    if (state.picked.length >= limit || state.usedTargets.has(target.id)) return state
    const kind = shuffle(kindsOf(target), random).find((candidate) => !distinctKinds || !state.usedKinds.has(candidate))
    const question = kind ? exerciseQuestion(target, kind) : undefined
    if (!kind || !question) return state
    return { picked: [...state.picked, question], usedTargets: new Set(state.usedTargets).add(target.id), usedKinds: new Set(state.usedKinds).add(kind) }
  }, { picked: [] as TestQuestion[], usedTargets: new Set<string>(), usedKinds: new Set<MockExerciseType>() })
  return picked
}

export function buildMockTest(unitIds: readonly string[], cards: readonly PracticeCard[], exerciseTargets: readonly ExerciseTarget[], state: TestPrepState, random: () => number = Math.random, size: number = MOCK_TEST_SIZE): TestQuestion[] {
  const ordered = unitsWeakestFirst(state, unitIds)
  if (ordered.length === 0) return []
  const used = new Set<string>()
  const questions = ordered.flatMap((unitId, rank) => {
    const quota = Math.floor(size / ordered.length) + (rank < size % ordered.length ? 1 : 0)
    const exercises = unitExerciseQuestions(unitId, exerciseTargets, Math.min(MAX_MOCK_EXERCISES_PER_UNIT, quota), random)
    const next = unitCardSource(unitId, cards, used, random)
    const cardQuestions = Array.from({ length: quota - exercises.length }, next).filter((question): question is TestQuestion => question !== undefined)
    return [...exercises, ...cardQuestions]
  })
  return shuffle(questions, random)
}

export type MockScore = {
  score: number
  total: number
  byUnit: Record<string, { score: number; total: number }>
  missed: TestQuestion[]
}

/** Unanswered (null) questions count toward the total but never toward the misses. */
export function scoreMockTest(questions: readonly TestQuestion[], answers: readonly (string | null)[]): MockScore {
  const result: MockScore = { score: 0, total: questions.length, byUnit: {}, missed: [] }
  questions.forEach((question, index) => {
    const unit = result.byUnit[question.unitId] ?? { score: 0, total: 0 }
    unit.total += 1
    const answer = answers[index] ?? null
    if (answer === question.answer) {
      unit.score += 1
      result.score += 1
    } else if (answer !== null) {
      result.missed.push(question)
    }
    result.byUnit[question.unitId] = unit
  })
  return result
}

/** What to show as the right answer: the corrected sentence for a spot-the-mistake question, else the answer choice. */
export function answerText(question: TestQuestion): string {
  return question.source ? answerDisplayFor(question.source) : question.answer
}
