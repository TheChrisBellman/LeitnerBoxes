import { useState } from 'react'
import type { LearningPilotLesson, LearningPilotTerm } from './data/learning-pilot.ts'

export function LearnScreen({
  lesson,
  terms,
  onStartRetrieval,
  onExit,
}: {
  lesson: LearningPilotLesson
  terms: readonly LearningPilotTerm[]
  onStartRetrieval: () => void
  onExit: () => void
}) {
  const [index, setIndex] = useState(0)
  const term = terms[index]
  const lastTerm = index + 1 === terms.length

  if (!term) return null

  return (
    <section className="page learn-page">
      <header className="screen-header">
        <button type="button" className="back-button" onClick={onExit}>Back to Today</button>
        <span className="screen-kicker">Guided Learn · {lesson.lessonId.toUpperCase()}</span>
        <h1 tabIndex={-1}>Learn {lesson.lessonId.toUpperCase()}</h1>
        <p>Preview six useful terms in context, then retrieve those same terms right away.</p>
      </header>
      <section className="learn-card surface-panel" aria-live="polite" aria-atomic="true">
        <span className="learn-progress">Term {index + 1} of {terms.length}</span>
        <div className="learn-term">
          <h2 lang="fr">{term.card.french}</h2>
          <p>{term.card.answer}</p>
        </div>
        <div className="learn-example">
          <span>In context</span>
          <p lang="fr">{term.note.exampleFrench}</p>
          <span>English</span>
          <p>{term.note.exampleEnglish}</p>
        </div>
        {term.note.note && <p className="learn-note">{term.note.note}</p>}
      </section>
      <nav className="learn-actions" aria-label="Lesson controls">
        <button type="button" className="button button-secondary" onClick={() => setIndex((current) => current - 1)} disabled={index === 0}>Previous</button>
        {lastTerm
          ? <button type="button" className="button button-primary" onClick={onStartRetrieval}>Start {terms.length}-term retrieval</button>
          : <button type="button" className="button button-primary" onClick={() => setIndex((current) => current + 1)}>Next term</button>}
      </nav>
      <p className="learn-retrieval-note">The retrieval check starts each new term in the normal Box 1 path. It does not give an extra promotion.</p>
    </section>
  )
}
