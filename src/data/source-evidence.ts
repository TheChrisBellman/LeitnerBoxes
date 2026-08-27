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
}

export type SourceSupplement = Pick<VocabularyCard, 'lessonId' | 'french' | 'answer'> & {
  evidence: SourceEvidence
}

export type SourceSupplementRow = Omit<SourceSupplement, 'evidence'>
