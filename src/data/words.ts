import { sourceVocabulary } from './source-vocabulary.ts'
import { conjugationsACore } from './conjugations.ts'
import { conjugationsAExpansion1 } from './conjugations-a-expansion-1.ts'
import { conjugationsAExpansion2 } from './conjugations-a-expansion-2.ts'
import { conjugationsAExpansion3 } from './conjugations-a-expansion-3.ts'
import { conjugationsBExpansion1 } from './conjugations-b-expansion-1.ts'
import { conjugationsBExpansion2 } from './conjugations-b-expansion-2.ts'
import { conjugationsCExpansion1 } from './conjugations-c-expansion-1.ts'
import { conjugationsCExpansion2 } from './conjugations-c-expansion-2.ts'
import { conjugationsCExpansion3 } from './conjugations-c-expansion-3.ts'
import { exerciseTargets } from './pilot-exercises.ts'
import type { PracticeCard, PracticeTarget } from './types.ts'

export const allCards: PracticeCard[] = [
  ...sourceVocabulary,
  ...conjugationsACore,
  ...conjugationsAExpansion1,
  ...conjugationsAExpansion2,
  ...conjugationsAExpansion3,
  ...conjugationsBExpansion1,
  ...conjugationsBExpansion2,
  ...conjugationsCExpansion1,
  ...conjugationsCExpansion2,
  ...conjugationsCExpansion3,
]
export const allTargets: PracticeTarget[] = [...allCards, ...exerciseTargets]
export const allWords = allCards.filter((card) => card.kind === 'vocabulary')
