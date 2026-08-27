import { ACTIVITY_TYPES, type ActivityType, type CardKind, type CardTier, type Language, type PracticeCard, type PracticeTarget, type VocabularyCard } from './data/types.ts'

export type Box = 1 | 2 | 3 | 4 | 5
// `mixed` remains a storage-compatible alias for the source vocabulary activities.
export type PracticeMode = 'mixed' | 'vocabulary'
export type MissMode = 'step-back' | 'full-reset'
export const MAX_NEW_CARDS_PER_SESSION = 4

export type MaintenanceStep = 0 | 1 | 2

export type CardProgress = {
  box: Box
  due: string
  maintenanceStep?: MaintenanceStep
}

export type SchedulableCard = {
  id: string
  lessonId: string
  kind?: CardKind
  tier?: CardTier
  order?: number
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
    progress = { box: nextBox, due: today }
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
  activityTypes?: readonly ActivityType[]
  masteredLessonIds?: Iterable<string>
}

export type QuestionDirection = 'french-to-english' | 'english-to-french'
export type QuestionFormat = 'choice' | 'arrange' | 'typed'

export type PracticeQuestion = {
  card: PracticeTarget
  direction: QuestionDirection
  format: QuestionFormat
  prompt: string
  promptLanguage: Language
  answer: string
  answerLanguage: Language
  distractors: string[]
  tokens?: string[]
  acceptedAnswers?: string[]
}

const frenchTypedAnswer = /^\p{L}+(?:[- '’]\p{L}+)*$/u

export function isFrenchTypedAnswer(value: string): boolean {
  return frenchTypedAnswer.test(value.trim())
}

function normalizeTypedAnswer(value: string): string {
  return value.trim().toLocaleLowerCase('fr').replace(/’/g, "'").replace(/\s+/g, ' ')
}

export function responseIsCorrect(question: PracticeQuestion, value: string): boolean {
  const acceptedAnswers = [question.answer, ...(question.acceptedAnswers ?? [])]
  return question.format === 'typed'
    ? acceptedAnswers.some((answer) => normalizeTypedAnswer(value) === normalizeTypedAnswer(answer))
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

function normalizeResponse(value: string): string {
  return value.trim().toLocaleLowerCase('fr').replace(/\s+/g, ' ')
}

export function buildVocabularyQuestion(
  card: VocabularyCard,
  reverse: boolean,
  vocabularyPool: readonly PracticeCard[] = [],
): PracticeQuestion {
  const acceptedAnswers = reverse
    ? [...new Set(vocabularyPool
      .filter((candidate) => candidate.lessonId === card.lessonId && normalizeResponse(candidate.answer) === normalizeResponse(card.answer))
      .map((candidate) => candidate.french)
      .filter((french) => french !== card.french))]
    : []
  return {
    card,
    direction: reverse ? 'english-to-french' : 'french-to-english',
    format: 'choice',
    prompt: reverse ? card.answer : card.french,
    promptLanguage: reverse ? 'en' : 'fr',
    answer: reverse ? card.french : card.answer,
    answerLanguage: reverse ? 'fr' : 'en',
    distractors: reverse ? [...card.reverseDistractors] : [...card.distractors],
    ...(acceptedAnswers.length > 0 ? { acceptedAnswers } : {}),
  }
}

function arrangementTokens(value: string): string[] | undefined {
  const tokens = value.trim().split(/\s+/)
  return tokens.length >= 2 && tokens.length <= 8 ? tokens : undefined
}

export function buildSessionQuestions(
  cards: readonly PracticeCard[],
  progress: Record<string, CardProgress> = {},
  enabledActivityTypes: readonly ActivityType[] = ACTIVITY_TYPES,
  vocabularyPool: readonly PracticeCard[] = cards,
): PracticeQuestion[] {
  let vocabularyOrdinal = 0

  return cards.map((card) => {
    const box = progress[card.id]?.box ?? 1
    const reverse = vocabularyOrdinal++ % 2 === 1 || box >= 3
    const question = buildVocabularyQuestion(card, reverse, vocabularyPool)
    if (!reverse) return question
    if (enabledActivityTypes.includes('typed') && box >= 3 && isFrenchTypedAnswer(question.answer)) return { ...question, format: 'typed' }
    const tokens = enabledActivityTypes.includes('ordered') && box >= 2 ? arrangementTokens(question.answer) : undefined
    return tokens ? { ...question, format: 'arrange', tokens } : question
  })
}

function matchesMode(_card: SchedulableCard, _mode: PracticeMode): boolean {
  return true
}

export function activityTypesForTarget(_card: SchedulableCard): ActivityType[] {
  return [...ACTIVITY_TYPES]
}

export function matchesActivityTypes(card: SchedulableCard, activityTypes?: readonly ActivityType[]): boolean {
  if (!activityTypes) return true
  return activityTypesForTarget(card).some((type) => activityTypes.includes(type))
}

function tierRank(tier: CardTier | undefined): number {
  return tier === 'expansion' ? 1 : tier === 'applied' ? 2 : 0
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

function orderReviews<T extends SchedulableCard>(
  items: { card: T; index: number; progress: CardProgress }[],
  today: string,
): T[] {
  return items
    .sort((left, right) => compareDateKeys(left.progress.due, today) < 0 ? -1 : compareDateKeys(right.progress.due, today) < 0 ? 1 : compareDateKeys(left.progress.due, right.progress.due) || left.index - right.index)
    .map(({ card }) => card)
}

function orderNew<T extends SchedulableCard>(
  items: { card: T; index: number }[],
  selectedLessonIds: readonly string[],
  limit: number,
): T[] {
  if (limit <= 0) return []
  const buckets = new Map<string, { card: T; index: number }[]>()
  items.forEach((item) => {
    const bucket = buckets.get(item.card.lessonId) ?? []
    bucket.push(item)
    buckets.set(item.card.lessonId, bucket)
  })
  buckets.forEach((bucket) => bucket.sort((left, right) =>
    (left.card.queuePriority ?? 1) - (right.card.queuePriority ?? 1)
      || tierRank(left.card.tier) - tierRank(right.card.tier)
      || (left.card.order ?? left.index) - (right.card.order ?? right.index)
      || left.index - right.index,
  ))

  const unitIds = [...new Set(selectedLessonIds)].filter((lessonId) => (buckets.get(lessonId)?.length ?? 0) > 0)
  const result: T[] = []
  let unitIndex = 0
  while (result.length < limit && unitIds.length > 0) {
    const chosenUnitIndex = unitIndex % unitIds.length
    const bucket = buckets.get(unitIds[chosenUnitIndex]) ?? []
    const item = bucket.shift()
    if (item) result.push(item.card)
    if (bucket.length === 0) unitIds.splice(chosenUnitIndex, 1)
    else unitIndex = chosenUnitIndex + 1
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
  const reviewCards = orderReviews(reviews, today)
  const available = Number.isFinite(limit) ? Math.max(0, limit) : Number.POSITIVE_INFINITY
  const selectedReviews = reviewCards.slice(0, available)
  const refresh = masteredRefreshCandidates(cards, progress, selectedLessonIds, options.masteredLessonIds, today, mode, options.activityTypes, true)[0]
  const selectedRefresh = refresh && selectedReviews.length < available ? [refresh.card] : []
  const remaining = available === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY : available - selectedReviews.length - selectedRefresh.length
  const maxNewCards = Math.max(0, Math.floor(options.maxNewCards ?? MAX_NEW_CARDS_PER_SESSION))
  const selectedNew = orderNew(newItems, selectedLessonIds, Math.min(remaining, maxNewCards))
  return [...selectedReviews, ...selectedRefresh, ...selectedNew]
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
