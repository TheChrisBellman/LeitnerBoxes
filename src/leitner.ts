import { conjugationCatches } from './data/conjugation-catches.ts'
import { allExercises, dialoguesById, exercisesByTargetId, passagesById, scenariosById } from './data/pilot-exercises.ts'
import { ACTIVITY_TYPES, type ActivityType, type AuthoredExercise, type CardKind, type CardTier, type ConjugationCard, type ExerciseLanguage, type ExerciseTarget, type PracticeCard, type PracticeTarget, type QuestionHelp, type VocabularyCard } from './data/types.ts'

export type Box = 1 | 2 | 3 | 4 | 5
export type PracticeMode = 'mixed' | 'vocabulary' | 'conjugation'
export type MissMode = 'step-back' | 'full-reset'
export const MAX_NEW_CARDS_PER_SESSION = 4

export type MaintenanceStep = 0 | 1 | 2

export type CardProgress = {
  box: Box
  due: string
  maintenanceStep?: MaintenanceStep
  lastMissedDate?: string
}

export type SchedulableCard = {
  id: string
  lessonId: string
  kind?: CardKind | 'exercise'
  tier?: CardTier
  order?: number
  targetType?: 'card' | 'exercise'
  queuePriority?: number
}

export const BOX_INTERVALS = [1, 2, 4, 14] as const
export const MAINTENANCE_INTERVALS = [14, 30, 60] as const
export const BOXES: Box[] = [1, 2, 3, 4, 5]

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

export function dateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const parsed = new Date(year, month - 1, day, 12)
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day
}

export function addDays(value: string, days: number): string {
  const [year, month, day] = value.split('-').map(Number)
  const result = new Date(year, month - 1, day, 12)
  result.setDate(result.getDate() + days)
  return dateKey(result)
}

export function compareDateKeys(left: string, right: string): number {
  return left.localeCompare(right)
}

export function createNewProgress(today = dateKey()): CardProgress {
  return { box: 1, due: today }
}

export function isDue(progress: CardProgress, today = dateKey()): boolean {
  return compareDateKeys(progress.due, today) <= 0
}

export function isBeyondBoxFive(progress: CardProgress | undefined): boolean {
  return progress?.box === 5 && (progress.maintenanceStep ?? 0) >= 1
}

export function getMasteredLessonIds<T extends SchedulableCard>(
  cards: readonly T[],
  progress: Record<string, CardProgress>,
): Set<string> {
  const itemsByLesson = new Map<string, T[]>()
  cards.forEach((card) => {
    const items = itemsByLesson.get(card.lessonId) ?? []
    items.push(card)
    itemsByLesson.set(card.lessonId, items)
  })
  return new Set([...itemsByLesson].filter(([, items]) => items.every((card) => isBeyondBoxFive(progress[card.id]))).map(([lessonId]) => lessonId))
}

export type ScheduleResult = {
  progress: CardProgress
  previousBox: Box
  nextBox: Box
  correct: boolean
  promoted: boolean
  missed: boolean
}

export function scheduleAnswer(
  current: CardProgress | undefined,
  correct: boolean,
  today = dateKey(),
  missMode: MissMode = 'step-back',
): ScheduleResult {
  const previousBox = current?.box ?? 1
  const nextBox = correct
    ? Math.min(5, previousBox + 1) as Box
    : missMode === 'full-reset' ? 1 : Math.max(1, previousBox - 1) as Box
  let progress: CardProgress

  if (!correct) {
    progress = { box: nextBox, due: today, lastMissedDate: today }
  } else if (previousBox === 5) {
    const maintenanceStep = Math.min(
      MAINTENANCE_INTERVALS.length - 1,
      (current?.maintenanceStep ?? 0) + 1,
    ) as MaintenanceStep
    progress = {
      box: 5,
      due: addDays(today, MAINTENANCE_INTERVALS[maintenanceStep]),
      maintenanceStep,
    }
  } else {
    progress = {
      box: nextBox,
      due: addDays(today, BOX_INTERVALS[previousBox - 1]),
      ...(nextBox === 5 ? { maintenanceStep: 0 as const } : {}),
    }
  }

  return {
    progress,
    previousBox,
    nextBox,
    correct,
    promoted: correct && nextBox > previousBox,
    missed: !correct,
  }
}

export type QueueCounts = {
  overdue: number
  due: number
  newCards: number
  future: number
}

export type QueueOptions = {
  mode?: PracticeMode
  maxNewCards?: number
  maxImmediateMisses?: number
  activityTypes?: readonly ActivityType[]
  masteredLessonIds?: Iterable<string>
  random?: () => number
}

export type QuestionDirection = 'french-to-english' | 'english-to-french' | 'conjugation' | 'exercise'
export type ExerciseFormat = 'choice' | 'cloze' | 'arrange' | 'typed' | 'correction'
export type QuestionContextKind = 'passage' | 'dialogue' | 'situation'

export type PracticeQuestion = {
  card: PracticeTarget
  kind: CardKind | 'exercise'
  direction: QuestionDirection
  format: ExerciseFormat
  prompt: string
  promptLanguage: ExerciseLanguage
  answer: string
  answerLanguage: 'fr' | 'en'
  distractors: string[]
  tokens?: string[]
  acceptedAnswers?: string[]
  exercise?: AuthoredExercise
  vocabularyPractice?: 'recognition'
  answerExplanation?: string
  answerDisplay?: string
  choiceLabels?: Record<string, string>
  help?: QuestionHelp
  context?: string
  contextTitle?: string
  contextLabel?: string
  contextKind?: QuestionContextKind
  contextLanguage?: ExerciseLanguage
}

const frenchTypedAnswer = /^\p{L}+(?:[- '’]\p{L}+)*$/u

export function isFrenchTypedAnswer(value: string): boolean {
  return frenchTypedAnswer.test(value.trim())
}

export const isKeyboardSafeTypedAnswer = isFrenchTypedAnswer

function normalizeTypedAnswer(value: string): string {
  return value.trim().toLocaleLowerCase('fr').replace(/’/g, "'").replace(/\s+/g, ' ')
}

export function responseIsCorrect(question: PracticeQuestion, value: string): boolean {
  const acceptedAnswers = [question.answer, ...(question.acceptedAnswers ?? [])]
  const normalize = question.kind === 'conjugation'
    ? normalizeConjugationResponse
    : question.format === 'typed'
      ? normalizeTypedAnswer
      : undefined
  return normalize
    ? acceptedAnswers.some((answer) => normalize(value) === normalize(answer))
    : acceptedAnswers.includes(value)
}

export type VocabularyResponseForm = 'question' | 'full-sentence' | 'infinitive' | 'fragment'

export function isQuestionForm(value: string): boolean {
  return value.trim().endsWith('?')
}

export function vocabularyResponseForm(value: string): VocabularyResponseForm {
  const trimmed = value.trim()
  if (isQuestionForm(trimmed)) return 'question'
  if (/^to(?:\s|$)/.test(trimmed)) return 'infinitive'
  if (/^[A-ZÀ-ÖØ-Þ]/u.test(trimmed) || /[.!…]$/.test(trimmed)) return 'full-sentence'
  return 'fragment'
}

const conjugationSubjectPrefix = /^(?:j['’]\s*|je\s+|tu\s+|il\/elle\s+|ils\/elles\s+|il\s+|elle\s+|nous\s+|vous\s+|ils\s+|elles\s+|on\s+)/iu

function normalizeConjugationPart(value: string): string {
  return value.trim()
    .replace(conjugationSubjectPrefix, '')
    .trim()
}

export function normalizeConjugationForm(value: string): string {
  const combinedSubject = value.trim().replace(/^(?:il|ils)\/(?:elle|elles)\s+/iu, '')
  return [...new Set(combinedSubject
    .split(/\s*\/\s*/)
    .map(normalizeConjugationPart)
    .filter(Boolean))].join(' / ')
}

function normalizeConjugationResponse(value: string): string {
  return normalizeTypedAnswer(value).replace(/\b([jmst])'\s+/g, "$1'")
}

const conjugationSubjectAliases: Record<ConjugationCard['person'], readonly string[]> = {
  je: ['je'],
  tu: ['tu'],
  'il/elle': ['il', 'elle', 'il/elle'],
  nous: ['nous'],
  vous: ['vous'],
  'ils/elles': ['ils', 'elles', 'ils/elles'],
}

function conjugationAnswerVariants(card: ConjugationCard): string[] {
  const authoredForms = card.answer.split(/\s*\/\s*/).map((form) => form.trim()).filter(Boolean)
  const variants = new Set([card.answer, ...authoredForms])
  authoredForms.forEach((form) => {
    const subjectless = form.replace(conjugationSubjectPrefix, '').trim()
    if (!subjectless) return
    if (card.person === 'je') {
      const subject = /^[aeiouyàâäéèêëîïôöùûüœh]/iu.test(subjectless) ? "j'" : 'je '
      variants.add(`${subject}${subjectless}`)
      return
    }
    const subjects = conjugationSubjectAliases[card.person]
    subjects.forEach((subject) => variants.add(`${subject} ${subjectless}`))
  })
  return [...variants]
}

function conjugationDistractors(
  card: PracticeCard & { kind: 'conjugation' },
  questionPool: readonly PracticeCard[],
): string[] {
  const sameVerb = questionPool.filter((item): item is PracticeCard & { kind: 'conjugation' } =>
    item.kind === 'conjugation' && item.id !== card.id && item.infinitive === card.infinitive,
  )
  const sameLesson = questionPool.filter((item): item is PracticeCard & { kind: 'conjugation' } =>
    item.kind === 'conjugation' && item.id !== card.id && item.lessonId === card.lessonId,
  )
  const allConjugations = questionPool.filter((item): item is PracticeCard & { kind: 'conjugation' } =>
    item.kind === 'conjugation' && item.id !== card.id,
  )
  const answer = normalizeConjugationForm(card.answer)
  const conjugationCatch = conjugationCatches[`${card.infinitive}|${card.person}`]
  const candidates = [
    ...(conjugationCatch ? [conjugationCatch] : []),
    ...card.distractors,
    ...sameVerb.flatMap((item) => [item.answer, ...item.distractors]),
    ...sameLesson.flatMap((item) => [item.answer, ...item.distractors]),
    ...allConjugations.flatMap((item) => [item.answer, ...item.distractors]),
  ]

  return [...new Set(candidates
    .map(normalizeConjugationForm)
    .filter((item) => item && item !== answer))].slice(0, 3)
}

function normalizeResponse(value: string): string {
  return value.trim().toLocaleLowerCase('fr').replace(/’/g, "'").replace(/\s+/g, ' ')
}

function vocabularyQuestionHelp(card: VocabularyCard, reverse: boolean): QuestionHelp {
  if (card.practice) {
    const answer = normalizeResponse(card.practice.answer)
    const sourceTerm = normalizeResponse(card.french)
    return {
      label: 'Term help',
      ...(answer !== sourceTerm && !sourceTerm.includes(answer) ? { phrase: card.french } : {}),
      text: card.practice.help,
    }
  }
  const french = card.french.trim()
  if (/^(?:le|la|l['’]|les|un|une|des|du|de la|de l['’])(?:\s|$)/iu.test(french)) {
    return { label: 'Grammar help', text: 'Keep the article with the noun; it carries useful gender and number information.' }
  }
  if (/^(?:j['’]|je|tu|il|elle|on|nous|vous|ils|elles)\b/iu.test(french)) {
    return { label: 'Form help', text: 'Keep the subject and the French verb form together.' }
  }
  if (/^(?:[a-zà-öø-ÿ]+er|[a-zà-öø-ÿ]+ir|[a-zà-öø-ÿ]+re)\b/iu.test(french)) {
    return { label: 'Word-form help', text: 'This is an infinitive: the dictionary form of a French verb.' }
  }
  return {
    label: 'Recall help',
    text: reverse ? 'Recall the complete French form, including any article or preposition.' : 'Connect the complete French term to its meaning; do not drop its small function words.',
  }
}

function exerciseQuestionHelp(kind: AuthoredExercise['kind']): QuestionHelp {
  const text = kind === 'contextual-cloze'
    ? 'Use the surrounding sentence to choose the form that fits.'
    : kind === 'best-response'
      ? 'Choose the response that best fits the situation and moves the conversation forward.'
      : kind === 'reading'
        ? 'Use the passage as evidence; do not rely on a single familiar word.'
        : kind === 'transformation'
          ? 'Keep the original meaning, even when the French structure changes.'
          : kind === 'ordered'
            ? 'Build the complete French phrase in a natural word order.'
            : kind === 'correction'
              ? 'Read the whole sentence before choosing the segment that needs attention.'
              : kind === 'scenario'
                ? 'Choose the response that is both appropriate and useful in this situation.'
                : 'Use the context to recall the French answer.'
  return { label: 'Activity help', text }
}

export function buildVocabularyQuestion(
  card: VocabularyCard,
  reverse: boolean,
  vocabularyPool: readonly PracticeCard[] = [],
): PracticeQuestion {
  if (card.practice) {
    return {
      card,
      kind: card.kind,
      direction: 'exercise',
      format: 'choice',
      prompt: card.practice.prompt,
      promptLanguage: card.practice.promptLanguage,
      answer: card.practice.answer,
      answerLanguage: card.practice.answerLanguage,
      distractors: [...card.practice.distractors],
      context: card.practice.context,
      contextKind: card.practice.context ? 'situation' : undefined,
      contextLanguage: card.practice.contextLanguage,
      vocabularyPractice: card.practice.kind,
      answerExplanation: card.practice.feedback,
      help: vocabularyQuestionHelp(card, reverse),
    }
  }
  const acceptedAnswers = reverse
    ? [...new Set(vocabularyPool
      .filter((candidate): candidate is VocabularyCard => candidate.kind === 'vocabulary' && candidate.lessonId === card.lessonId && normalizeResponse(candidate.answer) === normalizeResponse(card.answer))
      .map((candidate) => candidate.french)
      .filter((french) => french !== card.french))]
    : []
  return {
    card,
    kind: card.kind,
    direction: reverse ? 'english-to-french' : 'french-to-english',
    format: 'choice',
    prompt: reverse ? card.answer : card.french,
    promptLanguage: reverse ? 'en' : 'fr',
    answer: reverse ? card.french : card.answer,
    answerLanguage: reverse ? 'fr' : 'en',
    distractors: reverse ? [...card.reverseDistractors] : [...card.distractors],
    ...(acceptedAnswers.length > 0 ? { acceptedAnswers } : {}),
    help: vocabularyQuestionHelp(card, reverse),
  }
}

function arrangementTokens(value: string): string[] | undefined {
  const tokens = value.trim().split(/\s+/)
  return tokens.length >= 2 && tokens.length <= 8 ? tokens : undefined
}

function conjugationClozePrompt(answer: string, normalizedAnswer: string): string {
  return normalizedAnswer.split(/\s*\/\s*/).reduce((prompt, form) => prompt.split(form).join('_____'), answer)
}

function exerciseVariants(targetId: string, exercises: readonly AuthoredExercise[]): AuthoredExercise[] {
  return exercises === allExercises
    ? exercisesByTargetId.get(targetId) ?? []
    : exercises.filter((exercise) => exercise.targetId === targetId)
}

function dialogueText(dialogueId: string): { text: string; title: string } | undefined {
  const dialogue = dialoguesById.get(dialogueId)
  if (!dialogue) return undefined
  return {
    title: dialogue.title,
    text: dialogue.turns.map((turn) => `${turn.speaker}: ${turn.text}`).join('\n'),
  }
}

function buildExerciseQuestion(
  card: ExerciseTarget,
  exercise: AuthoredExercise,
): PracticeQuestion {
  const base = {
    card,
    kind: card.kind,
    direction: 'exercise' as const,
    promptLanguage: exercise.promptLanguage ?? 'fr',
    answerLanguage: 'fr' as const,
    contextLanguage: exercise.contextLanguage ?? 'fr',
    exercise,
    help: exerciseQuestionHelp(exercise.kind),
  }

  if (exercise.kind === 'contextual-cloze') {
    return {
      ...base,
      format: 'cloze',
      prompt: exercise.prompt,
      answer: exercise.answer,
      distractors: [...exercise.distractors],
      context: exercise.context,
      contextKind: exercise.context ? 'situation' : undefined,
    }
  }

  if (exercise.kind === 'best-response') {
    const dialogue = exercise.dialogueId ? dialogueText(exercise.dialogueId) : undefined
    return {
      ...base,
      format: 'choice',
      prompt: exercise.prompt,
      answer: exercise.answer,
      distractors: [...exercise.distractors],
      context: dialogue ? `${dialogue.text}\n\n${exercise.situation}` : exercise.situation,
      contextTitle: dialogue?.title,
      contextKind: dialogue ? 'dialogue' : 'situation',
    }
  }

  if (exercise.kind === 'reading') {
    const passage = passagesById.get(exercise.passageId)
    return {
      ...base,
      format: 'choice',
      prompt: exercise.prompt,
      answer: exercise.answer,
      distractors: [...exercise.distractors],
      context: passage?.text,
      contextTitle: passage?.title,
      contextLabel: passage?.genre,
      contextKind: passage ? 'passage' : undefined,
    }
  }

  if (exercise.kind === 'transformation') {
    return {
      ...base,
      format: 'choice',
      prompt: exercise.prompt,
      answer: exercise.answer,
      distractors: [...exercise.distractors],
      context: exercise.source,
      contextLabel: 'Phrase de départ',
      contextKind: 'situation',
    }
  }

  if (exercise.kind === 'ordered') {
    return {
      ...base,
      format: 'arrange',
      prompt: exercise.prompt,
      answer: exercise.answer,
      distractors: [],
      tokens: [...exercise.tokens],
      acceptedAnswers: exercise.acceptedAnswers ? [...exercise.acceptedAnswers] : undefined,
      context: exercise.context,
      contextKind: exercise.context ? 'situation' : undefined,
    }
  }

  if (exercise.kind === 'correction') {
    const choices = exercise.segments.map((segment) => segment.id)
    if (exercise.allowNoCorrection) choices.push('none')
    const choiceLabels = Object.fromEntries(exercise.segments.map((segment) => [
      segment.id,
      segment.text,
    ]))
    if (exercise.allowNoCorrection) choiceLabels.none = 'Aucune erreur'
    return {
      ...base,
      format: 'correction',
      prompt: exercise.prompt,
      answer: exercise.answerSegmentId,
      answerDisplay: exercise.correction,
      distractors: choices.filter((choice) => choice !== exercise.answerSegmentId),
      choiceLabels,
      context: exercise.segments.map((segment) => segment.text).join(' '),
      contextLabel: 'Texte à relire',
      contextKind: 'situation',
    }
  }

  if (exercise.kind === 'typed') {
    return {
      ...base,
      format: 'typed',
      prompt: exercise.prompt,
      answer: exercise.answer,
      distractors: [],
      acceptedAnswers: exercise.acceptedAnswers ? [...exercise.acceptedAnswers] : undefined,
      context: exercise.context,
      contextKind: exercise.context ? 'situation' : undefined,
    }
  }

  const scenario = scenariosById.get(exercise.scenarioId)
  const node = scenario?.nodes.find((candidate) => candidate.id === exercise.nodeId)
  const choices = node?.choices ?? []
  return {
    ...base,
    format: 'choice',
    prompt: node?.prompt ?? '',
    answer: node?.answer ?? '',
    distractors: choices.filter((choice) => choice !== node?.answer),
    context: scenario?.setup,
    contextTitle: scenario?.title,
    contextLabel: scenario ? 'Situation' : undefined,
    contextKind: scenario ? 'situation' : undefined,
  }
}

export function buildSessionQuestions(
  cards: readonly PracticeTarget[],
  progress: Record<string, CardProgress> = {},
  enabledActivityTypes: readonly ActivityType[] = ACTIVITY_TYPES,
  vocabularyPool: readonly PracticeCard[] = cards.filter((card): card is PracticeCard => card.kind !== 'exercise'),
  exercises: readonly AuthoredExercise[] = allExercises,
  randomActivity?: () => number,
): PracticeQuestion[] {
  let vocabularyOrdinal = 0

  let activityOrdinal = 0

  return cards.map((card) => {
    if (card.kind === 'exercise') {
      const variants = exerciseVariants(card.id, exercises).filter((exercise) => enabledActivityTypes.includes(exercise.kind))
      const box = progress[card.id]?.box ?? 1
      const exercise = variants.length > 0 ? variants[(box - 1) % variants.length] : undefined
      return exercise ? buildExerciseQuestion(card, exercise) : {
        card,
        kind: card.kind,
        direction: 'exercise',
        format: 'choice',
        prompt: '',
        promptLanguage: 'fr',
        answer: '',
        answerLanguage: 'fr',
        distractors: [],
        help: { label: 'Activity help', text: 'This activity is not available for the current selection.' },
      }
    }

    const box = progress[card.id]?.box ?? 1
    const selectedActivity = chooseActivityType(card, enabledActivityTypes, box, activityOrdinal++, randomActivity)
    if (card.kind === 'conjugation') {
      const answer = normalizeConjugationForm(card.answer)
      return {
        card,
        kind: card.kind,
        direction: 'conjugation',
        format: selectedActivity === 'typed' ? 'typed' : 'cloze',
        prompt: selectedActivity === 'typed' ? card.infinitive : conjugationClozePrompt(card.answer, answer),
        promptLanguage: 'fr',
        answer,
        answerLanguage: 'fr',
        distractors: conjugationDistractors(card, vocabularyPool),
        acceptedAnswers: conjugationAnswerVariants(card),
        help: { label: 'Form help', text: `Match the present-tense form to the ${card.person} subject; keep any reflexive pronoun.` },
      }
    }

    const reverse = vocabularyOrdinal++ % 2 === 1 || box >= 3
    if (selectedActivity === 'typed') {
      const question = buildVocabularyQuestion(card, true, vocabularyPool)
      return { ...question, format: 'typed' }
    }
    if (selectedActivity === 'ordered') {
      const question = buildVocabularyQuestion(card, true, vocabularyPool)
      const tokens = arrangementTokens(question.answer)
      return tokens ? { ...question, format: 'arrange', tokens } : question
    }
    return buildVocabularyQuestion(card, reverse, vocabularyPool)
  })
}

function matchesMode(card: SchedulableCard, mode: PracticeMode): boolean {
  if (card.kind === 'exercise' || card.targetType === 'exercise') return mode === 'mixed'
  if (mode === 'mixed') return true
  return mode === 'vocabulary' ? card.kind !== 'conjugation' : card.kind === 'conjugation'
}

function chooseActivityType(
  card: PracticeCard,
  enabledActivityTypes: readonly ActivityType[],
  box: Box,
  ordinal: number,
  random?: () => number,
): ActivityType | undefined {
  const supported = enabledActivityTypes.filter((type) => activityTypesForTarget(card).includes(type))
  if (supported.length === 0) return undefined
  if (supported.length === 1) return supported[0]
  if (random) return supported[Math.floor(random() * supported.length)] ?? supported[0]
  if (card.kind === 'vocabulary' && supported.includes('vocabulary')) {
    if (box >= 3 && supported.includes('typed')) return 'typed'
    if (box >= 2 && supported.includes('ordered')) return 'ordered'
    return 'vocabulary'
  }
  return supported[ordinal % supported.length]
}

export function activityTypesForTarget(card: SchedulableCard): ActivityType[] {
  if (card.kind === 'exercise' || card.targetType === 'exercise') {
    return [...new Set((exercisesByTargetId.get(card.id) ?? []).map((exercise) => exercise.kind))]
  }
  if (card.kind === 'conjugation') {
    const answer = 'answer' in card && typeof card.answer === 'string' ? card.answer : undefined
    return ['conjugation', ...(answer && isFrenchTypedAnswer(normalizeConjugationForm(answer)) ? ['typed' as const] : [])]
  }
  if (card.kind === 'vocabulary' && 'practice' in card && card.practice) return ['vocabulary']
  const types: ActivityType[] = ['vocabulary']
  const french = 'french' in card && typeof card.french === 'string' ? card.french : undefined
  if (!french) return types
  if (isFrenchTypedAnswer(french)) types.push('typed')
  if (arrangementTokens(french)) types.push('ordered')
  return types
}

export type ActivityAvailability = Record<ActivityType, number>

export function activityAvailability(
  cards: readonly SchedulableCard[],
  selectedLessonIds: readonly string[],
  mode: PracticeMode = 'mixed',
): ActivityAvailability {
  const selected = new Set(selectedLessonIds)
  return ACTIVITY_TYPES.reduce((counts, type) => {
    counts[type] = cards.filter((card) => selected.has(card.lessonId) && matchesMode(card, mode) && activityTypesForTarget(card).includes(type)).length
    return counts
  }, {} as ActivityAvailability)
}

export function matchesActivityTypes(card: SchedulableCard, activityTypes?: readonly ActivityType[]): boolean {
  if (!activityTypes) return true
  const enabled = new Set(activityTypes)
  return activityTypesForTarget(card).some((type) => enabled.has(type))
}

function tierRank(tier: CardTier | undefined): number {
  return tier === 'expansion' ? 1 : tier === 'applied' ? 2 : 0
}

function cardKind(card: SchedulableCard): CardKind | 'exercise' {
  return card.kind ?? 'vocabulary'
}

function interleaveKinds<T extends SchedulableCard>(items: T[], mode: PracticeMode): T[] {
  if (mode !== 'mixed' || items.length < 2) return items
  const kinds = [...new Set(items.map(cardKind))]
  const buckets = new Map(kinds.map((kind) => [kind, items.filter((item) => cardKind(item) === kind)]))
  const result: T[] = []
  let kindIndex = kinds.indexOf(cardKind(items[0]))
  while (result.length < items.length) {
    const bucket = buckets.get(kinds[kindIndex]) ?? []
    if (bucket.length > 0) result.push(bucket.shift() as T)
    kindIndex = (kindIndex + 1) % kinds.length
    if ((buckets.get(kinds[kindIndex])?.length ?? 0) === 0 && result.length < items.length) {
      const nextIndex = kinds.findIndex((kind) => (buckets.get(kind)?.length ?? 0) > 0)
      if (nextIndex >= 0) kindIndex = nextIndex
    }
  }
  return result
}

export function getQueueCounts<T extends SchedulableCard>(
  cards: readonly T[],
  progress: Record<string, CardProgress>,
  selectedLessonIds: readonly string[],
  today = dateKey(),
  mode: PracticeMode = 'mixed',
  activityTypes?: readonly ActivityType[],
  masteredLessonIds?: Iterable<string>,
): QueueCounts {
  const selected = new Set(selectedLessonIds)
  const counts = cards.reduce<QueueCounts>((current, card) => {
    if (!selected.has(card.lessonId) || !matchesMode(card, mode) || !matchesActivityTypes(card, activityTypes)) return current
    const item = progress[card.id]
    if (!item) current.newCards += 1
    else if (compareDateKeys(item.due, today) < 0) current.overdue += 1
    else if (item.due === today) current.due += 1
    else current.future += 1
    return current
  }, { overdue: 0, due: 0, newCards: 0, future: 0 })
  const refresh = masteredRefreshCandidates(cards, progress, selectedLessonIds, masteredLessonIds, today, mode, activityTypes, false)[0]
  if (refresh) {
    if (compareDateKeys(refresh.progress.due, today) < 0) counts.overdue += 1
    else if (refresh.progress.due === today) counts.due += 1
    else counts.future += 1
  }
  return counts
}

function orderReviews<T extends SchedulableCard>(
  items: { card: T; index: number; progress: CardProgress }[],
  today: string,
  mode: PracticeMode,
  random: () => number,
): T[] {
  return [0, 1].flatMap((rank) => {
    const dates = [...new Set(items
      .filter(({ progress }) => (compareDateKeys(progress.due, today) < 0 ? 0 : 1) === rank)
      .map(({ progress }) => progress.due))].sort(compareDateKeys)
    return dates.flatMap((due) => {
      const group = shuffle(items
        .filter(({ progress }) => progress.due === due)
        .map(({ card }) => card), random)
      return interleaveKinds(group, mode)
    })
  })
}

function masteredRefreshCandidates<T extends SchedulableCard>(
  cards: readonly T[],
  progress: Record<string, CardProgress>,
  selectedLessonIds: readonly string[],
  masteredLessonIds: Iterable<string> | undefined,
  today: string,
  mode: PracticeMode,
  activityTypes: readonly ActivityType[] | undefined,
  dueOnly: boolean,
): { card: T; index: number; progress: CardProgress }[] {
  if (!masteredLessonIds) return []
  const selected = new Set(selectedLessonIds)
  const mastered = new Set(masteredLessonIds)
  if (mastered.size === 0) return []
  return cards
    .map((card, index) => ({ card, index, progress: progress[card.id] }))
    .filter((item): item is typeof item & { progress: CardProgress } => Boolean(item.progress)
      && !selected.has(item.card.lessonId)
      && mastered.has(item.card.lessonId)
      && isBeyondBoxFive(item.progress)
      && matchesMode(item.card, mode)
      && matchesActivityTypes(item.card, activityTypes)
      && (!dueOnly || isDue(item.progress, today)))
    .sort((left, right) => compareDateKeys(left.progress.due, right.progress.due) || left.index - right.index)
}

function orderNew<T extends SchedulableCard>(
  items: { card: T; index: number }[],
  selectedLessonIds: readonly string[],
  mode: PracticeMode,
  limit: number,
  activityTypes: readonly ActivityType[] | undefined,
  random: () => number,
): T[] {
  if (limit <= 0) return []
  const buckets = new Map<string, { card: T; index: number }[]>()
  items.forEach((item) => {
    const bucket = buckets.get(item.card.lessonId) ?? []
    bucket.push(item)
    buckets.set(item.card.lessonId, bucket)
  })
  buckets.forEach((bucket) => {
    bucket.splice(0, bucket.length, ...shuffle(bucket, random))
  })

  const unitIds = shuffle([...new Set(selectedLessonIds.filter((lessonId) => (buckets.get(lessonId)?.length ?? 0) > 0))], random)
  const result: T[] = []
  let unitIndex = 0
  let nextKind: CardKind = 'vocabulary'
  const availableActivityTypes = activityTypes
    ? shuffle(activityTypes.filter((type) => items.some((item) => activityTypesForTarget(item.card).includes(type))), random)
    : []
  let nextActivityIndex = 0
  while (result.length < limit && unitIds.length > 0) {
    let chosenUnitIndex = unitIndex % unitIds.length
    const requestedType = availableActivityTypes.length > 0 ? availableActivityTypes[nextActivityIndex % availableActivityTypes.length] : undefined
    if (requestedType) {
      const typeUnitIndexes = unitIds
        .map((lessonId, index) => ({ lessonId, index }))
        .filter(({ lessonId }) => (buckets.get(lessonId) ?? []).some((item) => activityTypesForTarget(item.card).includes(requestedType)))
        .map(({ index }) => index)
      if (typeUnitIndexes.length > 0) chosenUnitIndex = typeUnitIndexes[unitIndex % typeUnitIndexes.length]
    }
    const lessonId = unitIds[chosenUnitIndex]
    const bucket = buckets.get(lessonId) ?? []
    const preferredIndex = requestedType
      ? bucket.findIndex((item) => activityTypesForTarget(item.card).includes(requestedType))
      : mode === 'mixed'
        ? bucket.findIndex((item) => cardKind(item.card) === nextKind)
        : -1
    const item = bucket.splice(preferredIndex >= 0 ? preferredIndex : 0, 1)[0]
    result.push(item.card)
    if (requestedType) nextActivityIndex += 1
    else if (mode === 'mixed') nextKind = nextKind === 'vocabulary' ? 'conjugation' : 'vocabulary'
    if (bucket.length === 0) unitIds.splice(chosenUnitIndex, 1)
    unitIndex = chosenUnitIndex + 1
  }
  return result
}

export function queueCards<T extends SchedulableCard>(
  cards: readonly T[],
  progress: Record<string, CardProgress>,
  selectedLessonIds: readonly string[],
  today = dateKey(),
  limit = Number.POSITIVE_INFINITY,
  options: QueueOptions = {},
): T[] {
  const mode = options.mode ?? 'mixed'
  const selected = new Set(selectedLessonIds)
  const eligible = cards
    .map((card, index) => ({ card, index, progress: progress[card.id] }))
    .filter(({ card, progress: item }) => selected.has(card.lessonId) && matchesMode(card, mode) && matchesActivityTypes(card, options.activityTypes) && (!item || isDue(item, today)))
  const reviews = eligible.filter((item): item is typeof item & { progress: CardProgress } => Boolean(item.progress))
  const newItems = eligible.filter(({ progress: item }) => !item)
  const random = options.random ?? Math.random
  const immediateMisses = reviews.filter(({ progress: item }) => item.lastMissedDate === today)
  const scheduledReviews = reviews.filter(({ progress: item }) => item.lastMissedDate !== today)
  const reviewCards = orderReviews(scheduledReviews, today, mode, random)
  const missedCards = orderReviews(immediateMisses, today, mode, random)
  const available = Number.isFinite(limit) ? Math.max(0, limit) : Number.POSITIVE_INFINITY
  const selectedReviews = reviewCards.slice(0, available)
  const refreshCandidates = masteredRefreshCandidates(cards, progress, selectedLessonIds, options.masteredLessonIds, today, mode, options.activityTypes, true)
  const firstRefresh = refreshCandidates[0]
  const refresh = firstRefresh
    ? shuffle(refreshCandidates.filter((candidate) => candidate.progress.due === firstRefresh.progress.due), random)[0]
    : undefined
  const selectedRefresh = refresh && selectedReviews.length < available ? [refresh.card] : []
  const remainingAfterReviews = available === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY : available - selectedReviews.length - selectedRefresh.length
  const maxImmediateMisses = Math.max(0, Math.floor(options.maxImmediateMisses ?? Number.POSITIVE_INFINITY))
  const selectedMisses = missedCards.slice(0, Math.min(remainingAfterReviews, maxImmediateMisses))
  const remaining = remainingAfterReviews === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY : remainingAfterReviews - selectedMisses.length
  const maxNewCards = Math.max(0, Math.floor(options.maxNewCards ?? MAX_NEW_CARDS_PER_SESSION))
  const selectedNew = orderNew(newItems, selectedLessonIds, mode, Math.min(remaining, maxNewCards), options.activityTypes, random)
  return [...selectedReviews, ...selectedRefresh, ...selectedMisses, ...selectedNew]
}

export function shelfCounts(
  progress: Record<string, CardProgress>,
  selectedLessonIds?: readonly string[],
  cards?: readonly SchedulableCard[],
  mode: PracticeMode = 'mixed',
  activityTypes?: readonly ActivityType[],
): Record<Box, number> {
  const selected = selectedLessonIds && new Set(selectedLessonIds)
  const selectedCardIds = cards && new Set(cards
    .filter((card) => selected?.has(card.lessonId) && matchesMode(card, mode) && matchesActivityTypes(card, activityTypes))
    .map((card) => card.id))
  return BOXES.reduce<Record<Box, number>>((counts, box) => {
    counts[box] = Object.entries(progress).filter(([id, item]) =>
      item.box === box && (!selectedCardIds || selectedCardIds.has(id)),
    ).length
    return counts
  }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
}
