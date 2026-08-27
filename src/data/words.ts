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
import { wordsA } from './words-a.ts'
import { wordsAExpansion1 } from './words-a-expansion-1.ts'
import { wordsAExpansion2 } from './words-a-expansion-2.ts'
import { wordsAExpansion3 } from './words-a-expansion-3.ts'
import { wordsB } from './words-b.ts'
import { wordsBExpansion1 } from './words-b-expansion-1.ts'
import { wordsBExpansion2 } from './words-b-expansion-2.ts'
import { wordsC } from './words-c.ts'
import { wordsCExpansion1 } from './words-c-expansion-1.ts'
import { wordsCExpansion2 } from './words-c-expansion-2.ts'
import { wordsCExpansion3 } from './words-c-expansion-3.ts'
import type { PracticeCard, PracticeTarget } from './types.ts'

export const allCards: PracticeCard[] = [
  ...wordsA,
  ...wordsAExpansion1,
  ...wordsAExpansion2,
  ...wordsAExpansion3,
  ...wordsB,
  ...wordsBExpansion1,
  ...wordsBExpansion2,
  ...wordsC,
  ...wordsCExpansion1,
  ...wordsCExpansion2,
  ...wordsCExpansion3,
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
