import { sourceVocabulary } from './source-vocabulary.ts'
import type { PracticeCard, PracticeTarget } from './types.ts'

export const allCards: PracticeCard[] = sourceVocabulary
export const allTargets: PracticeTarget[] = [...allCards]
export const allWords = allCards.filter((card) => card.kind === 'vocabulary')
