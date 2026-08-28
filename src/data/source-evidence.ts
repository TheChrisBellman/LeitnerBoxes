import type { VocabularyCard } from './types.ts'

export type SourceCategory = 'vocabulary' | 'expression' | 'verb/form' | 'grammar' | 'spelling' | 'phonetics' | 'occupation'
export type SourceEvidenceType = 'source-table' | 'source-example' | 'answer-key-confirmation'

export type SourceEvidence = {
  pdf: string
  page: number
  lineRange: string
  section: string
  category: SourceCategory
  evidenceType: SourceEvidenceType
  /** Terms that are split across adjacent table cells rather than contiguous text. */
  sourceFragments?: readonly string[]
  /** English gloss pieces used when the source wraps alternatives across lines. */
  englishFragments?: readonly string[]
}

export function englishEvidenceFragments(answer: string): readonly string[] {
  return answer.split(/[,;/]|\([^)]*\)|\s+\bor\b\s+/i).map((part) => part.trim()).filter(Boolean)
}

export type SourceSupplement = Pick<VocabularyCard, 'lessonId' | 'french' | 'answer'> & {
  evidence: SourceEvidence
}

export type SourceSupplementRow = Omit<SourceSupplement, 'evidence'>
