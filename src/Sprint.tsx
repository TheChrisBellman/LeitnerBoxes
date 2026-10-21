import { useEffect, useMemo, useRef, useState } from 'react'
import { allCards } from './data/words.ts'
import type { PracticeCard } from './data/types.ts'
import {
  SPRINT_PENALTY_SECONDS,
  SPRINT_SECONDS,
  buildSprintQuestions,
  emptyRun,
  loadBestScores,
  recordAnswer,
  saveBestScore,
  sprintCategoryOptions,
  type BestScores,
  type SprintCategory,
  type SprintQuestion,
  type SprintRun,
} from './sprint.ts'

const MS_PER_SECOND = 1000
const TICK_MS = 100
const MISS_REVEAL_MS = 900
const PERCENT = 100
const LOW_TIME_SECONDS = 10

type Phase = 'pick' | 'run' | 'done'
type Scope = 'selected' | 'all'

function Hud({ remainingMs, score, penalty }: { remainingMs: number; score: number; penalty: boolean }) {
  const seconds = Math.ceil(remainingMs / MS_PER_SECOND)
  const width = `${Math.max(0, Math.min(PERCENT, (remainingMs / (SPRINT_SECONDS * MS_PER_SECOND)) * PERCENT))}%`
  return (
    <div className="sprint-hud" role="status" aria-live="off">
      <div className="sprint-hud-row">
        <span className={`sprint-clock ${seconds <= LOW_TIME_SECONDS ? 'is-low' : ''}`}><strong>{seconds}</strong> s{penalty && <em className="sprint-penalty" aria-live="assertive">−{SPRINT_PENALTY_SECONDS} s</em>}</span>
        <span className="sprint-score"><strong>{score}</strong> correct</span>
      </div>
      <div className="sprint-timer-track" aria-hidden="true"><div className="sprint-timer-fill" style={{ width }} /></div>
    </div>
  )
}

export function SprintScreen({ selectedCards, onExit }: { selectedCards: readonly PracticeCard[]; onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('pick')
  const [category, setCategory] = useState<SprintCategory>('french-to-english')
  const [scope, setScope] = useState<Scope>(selectedCards.length > 0 ? 'selected' : 'all')
  const [questions, setQuestions] = useState<SprintQuestion[]>([])
  const [run, setRun] = useState<SprintRun>(emptyRun)
  const [remainingMs, setRemainingMs] = useState(SPRINT_SECONDS * MS_PER_SECOND)
  const [reveal, setReveal] = useState<string | null>(null)
  const [penaltyFlash, setPenaltyFlash] = useState(false)
  const [best, setBest] = useState<BestScores>(() => loadBestScores())
  const [newBest, setNewBest] = useState(false)
  const deadlineRef = useRef(0)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const pool = scope === 'all' ? allCards : selectedCards
  const counts = useMemo(() => Object.fromEntries(sprintCategoryOptions.map((option) => [option.id, buildSprintQuestions(option.id, pool).length])) as Record<SprintCategory, number>, [pool])
  const question = questions.length > 0 ? questions[run.index % questions.length] : undefined

  function start() {
    const next = buildSprintQuestions(category, pool)
    if (next.length === 0) return
    setQuestions(next)
    setRun(emptyRun)
    setReveal(null)
    setPenaltyFlash(false)
    setNewBest(false)
    deadlineRef.current = Date.now() + SPRINT_SECONDS * MS_PER_SECOND
    setRemainingMs(SPRINT_SECONDS * MS_PER_SECOND)
    setPhase('run')
  }

  useEffect(() => {
    if (phase !== 'run') return undefined
    const tick = window.setInterval(() => setRemainingMs(Math.max(0, deadlineRef.current - Date.now())), TICK_MS)
    return () => window.clearInterval(tick)
  }, [phase])

  useEffect(() => {
    if (phase !== 'run' || remainingMs > 0) return
    const next = saveBestScore(category, run.score)
    setNewBest(run.score > 0 && (best[category] ?? 0) < run.score)
    setBest(next)
    setPhase('done')
  }, [phase, remainingMs, run.score, category, best])

  useEffect(() => {
    if (phase === 'run') headingRef.current?.focus({ preventScroll: true })
  }, [phase, run.index])

  function answer(choice: string) {
    if (phase !== 'run' || !question || reveal) return
    const correct = choice === question.answer
    if (correct) {
      setRun((current) => recordAnswer(current, question, true))
      return
    }
    deadlineRef.current -= SPRINT_PENALTY_SECONDS * MS_PER_SECOND
    setRemainingMs(Math.max(0, deadlineRef.current - Date.now()))
    setReveal(choice)
    setPenaltyFlash(true)
    window.setTimeout(() => {
      setRun((current) => recordAnswer(current, question, false))
      setReveal(null)
      setPenaltyFlash(false)
    }, MISS_REVEAL_MS)
  }

  useEffect(() => {
    if (phase !== 'run' || !question) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      const index = Number(event.key) - 1
      if (index >= 0 && index < question.choices.length) {
        event.preventDefault()
        answer(question.choices[index])
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  if (phase === 'run' && question) {
    return (
      <section className="page sprint-page" aria-label="Sprint round">
        <Hud remainingMs={remainingMs} score={run.score} penalty={penaltyFlash} />
        <div key={question.id} className="prompt-card sprint-prompt">
          <div className="question-meta"><span className="question-type-label">{sprintCategoryOptions.find((option) => option.id === category)?.label}</span></div>
          <div className={`prompt-headline ${question.promptNote ? 'is-conjugation' : ''}`}>
            <h1 ref={headingRef} tabIndex={-1} lang={question.promptLanguage}>{question.prompt}</h1>
            {question.promptNote && <span className="conjugation-person">{question.promptNote}</span>}
          </div>
        </div>
        <div className="choice-list" role="group" aria-label="Answers">
          {question.choices.map((choice, index) => {
            const isCorrect = reveal !== null && choice === question.answer
            const isIncorrect = reveal === choice && choice !== question.answer
            return (
              <button type="button" key={choice} className={`choice-button ${isCorrect ? 'is-correct' : ''} ${isIncorrect ? 'is-incorrect' : ''}`} onClick={() => answer(choice)} disabled={reveal !== null}>
                <span className="choice-number">{index + 1}</span>
                <span lang={question.answerLanguage}>{choice}</span>
              </button>
            )
          })}
        </div>
        <div className="sprint-actions">
          <button type="button" className="button button-secondary" onClick={() => answer('')} disabled={reveal !== null}>Skip (−{SPRINT_PENALTY_SECONDS} s)</button>
          <button type="button" className="button button-secondary" onClick={() => setPhase('pick')}>End round</button>
        </div>
      </section>
    )
  }

  if (phase === 'done') {
    const answered = run.score + run.misses
    const accuracy = answered === 0 ? 0 : Math.round((run.score / answered) * PERCENT)
    return (
      <section className="page results-page sprint-page">
        <header className="screen-header">
          <span className="screen-kicker">Sprint · {sprintCategoryOptions.find((option) => option.id === category)?.label}</span>
          <h1 tabIndex={-1}>Time's up</h1>
        </header>
        <div className="results-score surface-panel">
          <span className="screen-kicker">{newBest ? 'New best score' : 'Score'}</span>
          <strong>{run.score}</strong>
          <p>{run.score} correct in {SPRINT_SECONDS} seconds, {run.misses} missed, {accuracy}% accuracy. Best for this category: {best[category] ?? 0}.</p>
          <div className="results-actions">
            <button type="button" className="button button-primary" onClick={start}>Again</button>
            <button type="button" className="button button-secondary" onClick={() => setPhase('pick')}>Change category</button>
          </div>
        </div>
        {run.missed.length > 0 && <details className="missed-recap" open>
          <summary>Review missed answers ({run.missed.length})</summary>
          <ol>
            {run.missed.map((item) => <li key={item.id}>
              <span className="missed-recap-prompt" lang={item.promptLanguage}>{item.prompt}{item.promptNote ? ` · ${item.promptNote}` : ''}</span>
              <strong lang={item.answerLanguage}>{item.answer}</strong>
            </li>)}
          </ol>
        </details>}
      </section>
    )
  }

  return (
    <section className="page sprint-page">
      <header className="screen-header">
        <button type="button" className="back-button" onClick={onExit}>Back to Practice</button>
        <span className="screen-kicker">Sprint</span>
        <h1 tabIndex={-1}>Beat the clock</h1>
        <p>{SPRINT_SECONDS} seconds, as many right answers as you can. Each miss or skip costs {SPRINT_PENALTY_SECONDS} seconds. Boxes are not affected.</p>
      </header>
      <div className="practice-presets" role="group" aria-label="Sprint categories">
        {sprintCategoryOptions.map((option) => (
          <button type="button" key={option.id} className={`practice-preset ${category === option.id ? 'is-selected' : ''}`} aria-pressed={category === option.id} disabled={counts[option.id] === 0} onClick={() => setCategory(option.id)}>
            <strong>{option.label}</strong>
            <small>{option.description}</small>
            <small>{counts[option.id]} items · best {best[option.id] ?? 0}</small>
          </button>
        ))}
      </div>
      <div className="sprint-scope" role="group" aria-label="Material">
        <button type="button" className={`practice-preset ${scope === 'selected' ? 'is-selected' : ''}`} aria-pressed={scope === 'selected'} disabled={selectedCards.length === 0} onClick={() => setScope('selected')}><strong>Selected material</strong><small>Units chosen on the Material screen.</small></button>
        <button type="button" className={`practice-preset ${scope === 'all' ? 'is-selected' : ''}`} aria-pressed={scope === 'all'} onClick={() => setScope('all')}><strong>Everything</strong><small>All units, all levels.</small></button>
      </div>
      <div className="results-actions">
        <button type="button" className="button button-primary" onClick={start} disabled={counts[category] === 0}>Start {SPRINT_SECONDS}-second sprint</button>
      </div>
    </section>
  )
}
