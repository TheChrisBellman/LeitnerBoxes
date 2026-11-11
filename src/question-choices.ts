import { shuffle, type PracticeQuestion } from './leitner.ts'

export function choicesFor(question: PracticeQuestion): string[] {
  if (question.vocabularyPractice === 'noun-gender') return ['Masculine', 'Feminine']
  if (question.exercise?.kind === 'correction') {
    return [...question.exercise.segments.map((segment) => segment.id), ...(question.exercise.allowNoCorrection ? ['none'] : [])]
  }
  return question.format === 'choice' || question.format === 'cloze'
    ? shuffle([question.answer, ...question.distractors])
    : []
}

export function answerDisplayFor(question: PracticeQuestion, value = question.answer): string {
  if (value === question.answer && question.answerDisplay) return question.answerDisplay
  if (value === question.answer && question.card.kind === 'conjugation') return question.card.answer
  return question.choiceLabels?.[value] ?? value
}

export function exerciseLabel(question: PracticeQuestion): string | undefined {
  switch (question.exercise?.kind) {
    case 'contextual-cloze': return 'Fill in the blank'
    case 'correction': return 'Spot the mistake'
    case 'best-response': return 'Best response'
    case 'reading': return 'Reading'
    case 'scenario': return 'Scenario'
    case 'transformation': return 'Rephrase it'
    case 'ordered': return 'Tap to order'
    case 'typed': return 'Spelling & typing'
    default: return undefined
  }
}
