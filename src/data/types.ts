export type Level = 'A' | 'B' | 'C'
export type CardKind = 'vocabulary' | 'conjugation'
export type CardTier = 'core' | 'expansion' | 'applied'
export type ConjugationPerson = 'je' | 'tu' | 'il/elle' | 'nous' | 'vous' | 'ils/elles'
export type ConjugationTense = 'present'

export type CardBase = {
  id: string
  level: Level
  lessonId: string
  kind: CardKind
  tier: CardTier
  order: number
}

export type VocabularyCard = CardBase & {
  kind: 'vocabulary'
  french: string
  answer: string
  distractors: [string, string, string]
  reverseDistractors: [string, string, string]
}

export type ConjugationCard = CardBase & {
  kind: 'conjugation'
  infinitive: string
  tense: ConjugationTense
  person: ConjugationPerson
  answer: string
  distractors: [string, string, string]
}

export type PracticeCard = VocabularyCard | ConjugationCard
export type Word = VocabularyCard

export type ExerciseKind =
  | 'contextual-cloze'
  | 'correction'
  | 'best-response'
  | 'reading'
  | 'scenario'
  | 'transformation'
  | 'ordered'
  | 'typed'

export const ACTIVITY_TYPES = [
  'vocabulary',
  'conjugation',
  'best-response',
  'contextual-cloze',
  'ordered',
  'correction',
  'reading',
  'transformation',
  'scenario',
  'typed',
] as const

export type ActivityType = typeof ACTIVITY_TYPES[number]
export type ExerciseLanguage = 'fr' | 'en'

export type ExerciseBase = {
  id: string
  unitId: string
  targetId: string
  feedback: string
  promptLanguage?: ExerciseLanguage
  contextLanguage?: ExerciseLanguage
}

export type ContextualClozeExercise = ExerciseBase & {
  kind: 'contextual-cloze'
  prompt: string
  context?: string
  answer: string
  distractors: [string, string, string]
}

export type BestResponseExercise = ExerciseBase & {
  kind: 'best-response'
  prompt: string
  situation: string
  dialogueId?: string
  answer: string
  distractors: [string, string, string]
}

export type ReadingExercise = ExerciseBase & {
  kind: 'reading'
  passageId: string
  prompt: string
  answer: string
  distractors: [string, string, string]
}

export type TransformationExercise = ExerciseBase & {
  kind: 'transformation'
  prompt: string
  source: string
  answer: string
  distractors: [string, string, string]
}

export type OrderedExercise = ExerciseBase & {
  kind: 'ordered'
  prompt: string
  context?: string
  tokens: string[]
  answer: string
  acceptedAnswers?: string[]
}

export type CorrectionSegment = {
  id: string
  text: string
}

export type CorrectionExercise = ExerciseBase & {
  kind: 'correction'
  prompt: string
  segments: CorrectionSegment[]
  answerSegmentId: string
  correction: string
  allowNoCorrection?: boolean
}

export type TypedExercise = ExerciseBase & {
  kind: 'typed'
  prompt: string
  context?: string
  answer: string
  acceptedAnswers?: string[]
}

export type ScenarioNode = {
  id: string
  prompt: string
  choices: [string, string, string, string]
  answer: string
  feedback: string
}

export type Passage = {
  id: string
  unitId: string
  genre: string
  title: string
  text: string
}

export type SupportingDialogue = {
  id: string
  unitId: string
  title: string
  turns: { speaker: string; text: string }[]
}

export type Scenario = {
  id: string
  unitId: string
  title: string
  setup: string
  nodes: ScenarioNode[]
}

export type AuthoredExercise =
  | ContextualClozeExercise
  | CorrectionExercise
  | BestResponseExercise
  | ReadingExercise
  | ScenarioExercise
  | TransformationExercise
  | OrderedExercise
  | TypedExercise

export type ScenarioExercise = ExerciseBase & {
  kind: 'scenario'
  scenarioId: string
  nodeId: string
}

export type ExerciseTarget = {
  id: string
  level: Level
  lessonId: string
  kind: 'exercise'
  tier: 'applied'
  order: number
  targetType: 'exercise'
  queuePriority: 0
}

export type PracticeTarget = PracticeCard | ExerciseTarget
export type TargetKind = CardKind | 'exercise'

export type CurriculumUnit = {
  id: string
  level: Level
  group: string
  title: string
}
