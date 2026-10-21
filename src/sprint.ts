import { frenchNumberMisspellings, frenchNumbers, numberLookalikes } from './data/numbers.ts'
import type { ConjugationCard, ExerciseLanguage, PracticeCard, VocabularyCard } from './data/types.ts'
import { buildSessionQuestions, buildVocabularyQuestion, nounGenderFor, shuffle } from './leitner.ts'

export const SPRINT_SECONDS = 60
export const SPRINT_PENALTY_SECONDS = 5
export const SPRINT_STORAGE_KEY = 'leitner-boxes:sprint:v1'
const CHOICE_COUNT = 4
const DIGIT_BASE = 10
const ONE_STEP = 1
const TWO_STEPS = ONE_STEP + ONE_STEP
const NUMBER_NEIGHBOUR_OFFSETS = [ONE_STEP, TWO_STEPS, DIGIT_BASE, DIGIT_BASE * TWO_STEPS].flatMap((offset) => [offset, -offset])
const TEMPTING_COUNT = 4
// A quarter of the spelled-out questions that have a classic misspelling (quatre-vingt, soixante-onze) show it as a choice.
const MISSPELLING_CHANCE = 0.25

export const SPRINT_CATEGORIES = ['noun-gender', 'french-to-english', 'english-to-french', 'verb-forms', 'numbers'] as const
export type SprintCategory = typeof SPRINT_CATEGORIES[number]

export const sprintCategoryOptions: readonly { id: SprintCategory; label: string; description: string }[] = [
  { id: 'french-to-english', label: 'French → English', description: 'Pick the meaning of a French word.' },
  { id: 'english-to-french', label: 'English → French', description: 'Pick the French word for a meaning.' },
  { id: 'verb-forms', label: 'Verb forms', description: 'Pick the present-tense form for the subject.' },
  { id: 'noun-gender', label: 'Noun gender', description: 'Masculine or feminine, as fast as you can.' },
  { id: 'numbers', label: 'Numbers', description: 'Digits to French words and back, 0–100.' },
]

export type SprintQuestion = {
  id: string
  prompt: string
  promptLanguage: ExerciseLanguage
  promptNote?: string
  answer: string
  answerLanguage: ExerciseLanguage
  choices: string[]
}

export type SprintStorage = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

function browserStorage(): SprintStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

function isPlainVocabulary(card: PracticeCard): card is VocabularyCard {
  return card.kind === 'vocabulary' && !card.practice
}

function withChoices(answer: string, distractors: readonly string[], random: () => number): string[] {
  return shuffle([answer, ...new Set(distractors.filter((item) => item && item !== answer))].slice(0, CHOICE_COUNT), random)
}

function numberDistractors(n: number, random: () => number): number[] {
  const tempting = shuffle(numberLookalikes(n).slice(0, TEMPTING_COUNT), random)
  const neighbours = shuffle(NUMBER_NEIGHBOUR_OFFSETS.map((offset) => n + offset), random)
  const fallback = shuffle(frenchNumbers.map((_, value) => value), random)
  return [...new Set([...tempting, ...neighbours, ...fallback].filter((value) => value >= 0 && value < frenchNumbers.length && value !== n))]
    .slice(0, CHOICE_COUNT - 1)
}

/** Builds the full shuffled question pool for one category. Progress and due dates are ignored. */
export function buildSprintQuestions(category: SprintCategory, cards: readonly PracticeCard[], random: () => number = Math.random): SprintQuestion[] {
  if (category === 'numbers') {
    return shuffle(frenchNumbers.map((word, n) => {
      const distractors = numberDistractors(n, random)
      const reverse = Math.round(random()) === 1
      if (reverse) return { id: `n-${n}-r`, prompt: word, promptLanguage: 'fr' as const, answer: String(n), answerLanguage: 'en' as const, choices: withChoices(String(n), distractors.map(String), random) }
      const misspelling = random() < MISSPELLING_CHANCE ? frenchNumberMisspellings(n).slice(0, 1) : []
      return { id: `n-${n}`, prompt: String(n), promptLanguage: 'en' as const, answer: word, answerLanguage: 'fr' as const, choices: withChoices(word, [...misspelling, ...distractors.map((value) => frenchNumbers[value])], random) }
    }), random)
  }
  if (category === 'verb-forms') {
    const verbs = cards.filter((card): card is ConjugationCard => card.kind === 'conjugation')
    return shuffle(buildSessionQuestions(verbs, {}, ['typed'], cards).map((question) => ({
      id: question.card.id,
      prompt: question.prompt,
      promptLanguage: 'fr' as const,
      promptNote: (question.card as ConjugationCard).person,
      answer: question.answer,
      answerLanguage: 'fr' as const,
      choices: withChoices(question.answer, question.distractors, random),
    })), random)
  }
  if (category === 'noun-gender') {
    return shuffle(cards.filter(isPlainVocabulary).flatMap((card) => {
      const gender = nounGenderFor(card.french)
      return gender ? [{ id: card.id, prompt: gender.noun, promptLanguage: 'fr' as const, answer: gender.answer, answerLanguage: 'en' as const, choices: ['Masculine', 'Feminine'] }] : []
    }), random)
  }
  const reverse = category === 'english-to-french'
  return shuffle(cards.filter(isPlainVocabulary).map((card) => {
    const question = buildVocabularyQuestion(card, reverse, cards)
    return {
      id: card.id,
      prompt: question.prompt,
      promptLanguage: question.promptLanguage,
      answer: question.answer,
      answerLanguage: question.answerLanguage,
      choices: withChoices(question.answer, question.distractors, random),
    }
  }), random)
}

export type SprintRun = {
  index: number
  score: number
  misses: number
  missed: SprintQuestion[]
}

export const emptyRun: SprintRun = { index: 0, score: 0, misses: 0, missed: [] }

/** Advances the run after an answer; the caller applies the time penalty on a miss. */
export function recordAnswer(run: SprintRun, question: SprintQuestion, correct: boolean): SprintRun {
  return {
    index: run.index + 1,
    score: run.score + (correct ? 1 : 0),
    misses: run.misses + (correct ? 0 : 1),
    missed: correct || run.missed.some((item) => item.id === question.id) ? run.missed : [...run.missed, question],
  }
}

export type BestScores = Partial<Record<SprintCategory, number>>

export function loadBestScores(storage: SprintStorage | undefined = browserStorage()): BestScores {
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(SPRINT_STORAGE_KEY) ?? '{}')
    if (!parsed || typeof parsed !== 'object') return {}
    return Object.fromEntries(Object.entries(parsed).filter(([key, value]) => (SPRINT_CATEGORIES as readonly string[]).includes(key) && typeof value === 'number'))
  } catch {
    return {}
  }
}

/** Saves the score if it beats the stored best; returns the updated table. */
export function saveBestScore(category: SprintCategory, score: number, storage: SprintStorage | undefined = browserStorage()): BestScores {
  const current = loadBestScores(storage)
  if ((current[category] ?? 0) >= score) return current
  const next = { ...current, [category]: score }
  try {
    storage?.setItem(SPRINT_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ponytail: storage full or blocked; best score is a nicety, not data
  }
  return next
}
