export type Level = 'A' | 'B' | 'C'
export type CardKind = 'vocabulary'
export type CardTier = 'core' | 'expansion' | 'applied'
export type Language = 'fr' | 'en'

export type CardBase = {
  id: string
  level: Level
  lessonId: string
  kind: CardKind
  tier: CardTier
  order: number
}

export type VocabularyCard = CardBase & {
  french: string
  answer: string
  distractors: [string, string, string]
  reverseDistractors: [string, string, string]
}

export type PracticeCard = VocabularyCard
export type Word = VocabularyCard

export const ACTIVITY_TYPES = ['vocabulary', 'ordered', 'typed'] as const
export type ActivityType = typeof ACTIVITY_TYPES[number]

export type PracticeTarget = PracticeCard
export type TargetKind = CardKind

export type CurriculumUnit = {
  id: string
  level: Level
  group: string
  title: string
}
