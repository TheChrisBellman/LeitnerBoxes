import type { PracticeQuestion } from './leitner.ts'

export { answerDisplayFor, choicesFor, exerciseLabel } from './question-choices.ts'

export function ExerciseContext({ question }: { question: PracticeQuestion }) {
  if (!question.context && question.exercise?.kind !== 'correction') return null
  if (question.exercise?.kind === 'correction') {
    return (
      <div className="exercise-context correction-context">
        <span className="exercise-context-label">{question.contextLabel}</span>
        <p lang={question.contextLanguage ?? 'fr'} className="correction-sentence">
          {question.exercise.segments.map((segment) => (
            <span className="correction-segment" key={segment.id}>{segment.text}</span>
          ))}
        </p>
      </div>
    )
  }
  if (!question.context) return null
  if (question.contextKind === 'passage') {
    return (
      <article className="exercise-context reading-passage" lang={question.contextLanguage ?? 'fr'}>
        <header>
          {question.contextLabel && <span className="exercise-context-label">{question.contextLabel}</span>}
          {question.contextTitle && <h2>{question.contextTitle}</h2>}
        </header>
        <p>{question.context}</p>
      </article>
    )
  }
  if (question.contextKind === 'dialogue') {
    return (
      <blockquote className="exercise-context dialogue-context" lang={question.contextLanguage ?? 'fr'}>
        {question.contextTitle && <cite>{question.contextTitle}</cite>}
        <p>{question.context}</p>
      </blockquote>
    )
  }
  return (
    <div className="exercise-context situation-context" lang={question.contextLanguage ?? 'fr'}>
      {question.contextLabel && <span className="exercise-context-label">{question.contextLabel}</span>}
      <p>{question.context}</p>
    </div>
  )
}

const GRID_CHOICE_MAX_CHARS = 24
const SHORT_PROMPT_MAX_CHARS = 14
const LONG_PROMPT_MIN_CHARS = 48

export const promptSizeClass = (prompt: string) => prompt.length <= SHORT_PROMPT_MAX_CHARS ? 'is-short' : prompt.length >= LONG_PROMPT_MIN_CHARS ? 'is-long' : undefined

// Two columns only when every label is short enough to sit in a tile.
export const choiceListClass = (labels: readonly string[]) => `choice-list ${labels.length % 2 === 0 && labels.every((label) => label.length <= GRID_CHOICE_MAX_CHARS) ? 'is-grid' : ''}`
