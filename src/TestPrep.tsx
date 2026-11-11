import { useEffect, useMemo, useRef, useState } from 'react'
import { curriculumById, materialLabelsById } from './data/curriculum'
import { allCards } from './data/words.ts'
import { exerciseTargets } from './data/pilot-exercises.ts'
import { dateKey, type CardProgress } from './leitner.ts'
import { ExerciseContext } from './question-view.tsx'
import { UnitPicker } from './UnitPicker.tsx'
import {
  MOCK_TEST_SIZE,
  READINESS_WARN_PERCENT,
  RECALL_ROUND_SIZE,
  advanceRound,
  answerText,
  buildMockTest,
  buildRecallRound,
  loadTestPrep,
  readiness,
  recordAnswers,
  saveTestPrep,
  scoreMockTest,
  startRound,
  unitsWeakestFirst,
  type RoundRun,
  type TestPrepState,
  type TestQuestion,
} from './testprep.ts'

const CORRECT_ADVANCE_MS = 700
const PERCENT = 100
const FIRST_INDEX = 0
const ONE = 1

type Phase = 'pick' | 'recall' | 'done' | 'mock' | 'mock-results'
type RoundKind = 'recall' | 'mock'
type Step = 'think' | 'choose' | 'result'

const unitName = (unitId: string) => materialLabelsById[unitId] ?? curriculumById.get(unitId)?.title ?? unitId.toUpperCase()

function UnitRow({ unitId, fraction, value }: { unitId: string; fraction: number | undefined; value: string }) {
  const percent = fraction === undefined ? 0 : Math.round(fraction * PERCENT)
  return (
    <div className="testprep-unit-row">
      <span className="testprep-unit-code">{unitId.toUpperCase()}</span>
      <span className="testprep-unit-name">{unitName(unitId)}</span>
      <span className="testprep-track" aria-hidden="true"><span className={`testprep-fill ${fraction !== undefined && percent < READINESS_WARN_PERCENT ? 'is-low' : ''}`} style={{ width: `${percent}%` }} /></span>
      <span className="testprep-unit-value">{value}</span>
    </div>
  )
}

function PromptCard({ question, headingRef }: { question: TestQuestion; headingRef?: { current: HTMLHeadingElement | null } }) {
  return (
    <div key={question.id} className="prompt-card">
      <div className="question-meta"><span className="question-type-label">{question.label}</span></div>
      {question.source && <ExerciseContext question={question.source} />}
      <div className={`prompt-headline ${question.promptNote ? 'is-conjugation' : ''}`}>
        <h1 ref={headingRef} tabIndex={-1} lang={question.promptLanguage}>{question.prompt}</h1>
        {question.promptNote && <span className="conjugation-person">{question.promptNote}</span>}
      </div>
    </div>
  )
}

function Progress({ label, current, total }: { label: string; current: number; total: number }) {
  return (
    <div className="testprep-progress">
      <span>{label}</span>
      <progress max={total} value={current} aria-label={label} />
    </div>
  )
}

export function TestPrepScreen({ onMiss }: { progress: Record<string, CardProgress>; onMiss: (progressId: string) => void }) {
  const [phase, setPhase] = useState<Phase>('pick')
  const [roundKind, setRoundKind] = useState<RoundKind>('recall')
  const [state, setState] = useState<TestPrepState>(() => loadTestPrep())
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [run, setRun] = useState<RoundRun>(() => startRound([]))
  const [step, setStep] = useState<Step>('think')
  const [picked, setPicked] = useState<string | null>(null)
  const [answers, setAnswers] = useState<(string | null)[]>([])
  const [index, setIndex] = useState(FIRST_INDEX)
  const [askFinish, setAskFinish] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const unitIds = state.unitIds
  const poolSize = useMemo(() => allCards.filter((card) => unitIds.includes(card.lessonId)).length + exerciseTargets.filter((target) => unitIds.includes(target.lessonId)).length, [unitIds])
  const head = run.queue[FIRST_INDEX]
  const firstAttempt = head !== undefined && !run.repeated.includes(head.id)

  function commit(next: TestPrepState) {
    setState(next)
    saveTestPrep(next)
  }

  function toggleUnit(id: string) {
    commit({ ...state, unitIds: unitIds.includes(id) ? unitIds.filter((unitId) => unitId !== id) : [...unitIds, id] })
  }

  function startRecall(round: TestQuestion[]) {
    if (round.length === 0) return
    setQuestions(round)
    setRun(startRound(round))
    setStep('think')
    setPicked(null)
    setPhase('recall')
  }

  function startMock() {
    const test = buildMockTest(unitIds, allCards, exerciseTargets, state)
    if (test.length === 0) return
    setQuestions(test)
    setAnswers(test.map(() => null))
    setIndex(FIRST_INDEX)
    setAskFinish(false)
    setPhase('mock')
  }

  function start() {
    if (roundKind === 'mock') startMock()
    else startRecall(buildRecallRound(unitIds, allCards, state))
  }

  // Recall: pick is a choice value, or null for "I blanked".
  function answerRecall(pick: string | null) {
    if (!head || step === 'result') return
    const correct = pick === head.answer
    if (firstAttempt) {
      commit(recordAnswers(state, [{ unitId: head.unitId, correct }]))
      if (!correct && head.progressId) onMiss(head.progressId)
    }
    setPicked(pick ?? '')
    setStep('result')
  }

  function nextRecall() {
    const next = advanceRound(run, picked === head?.answer)
    setRun(next)
    setStep('think')
    setPicked(null)
    if (next.queue.length === 0) setPhase('done')
  }

  const recallCorrect = phase === 'recall' && step === 'result' && picked === head?.answer
  useEffect(() => {
    if (!recallCorrect) return undefined
    const timer = window.setTimeout(nextRecall, CORRECT_ADVANCE_MS)
    return () => window.clearTimeout(timer)
  })

  useEffect(() => {
    if (phase === 'mock') headingRef.current?.focus({ preventScroll: true })
  }, [phase, head?.id, index])

  function finishMock() {
    const result = scoreMockTest(questions, answers)
    const answered = questions.flatMap((question, position) => answers[position] === null ? [] : [{ question, correct: answers[position] === question.answer }])
    commit({ ...recordAnswers(state, answered.map(({ question, correct }) => ({ unitId: question.unitId, correct }))), lastMock: { score: result.score, total: result.total, date: dateKey() } })
    answered.forEach(({ question, correct }) => { if (!correct && question.progressId) onMiss(question.progressId) })
    setPhase('mock-results')
  }

  const unanswered = answers.filter((answer) => answer === null).length
  const mockQuestion = phase === 'mock' ? questions[index] : undefined

  function pickMock(value: string) {
    setAnswers((current) => current.map((answer, position) => position === index ? value : answer))
    setAskFinish(false)
  }

  useEffect(() => {
    const active = phase === 'recall' && step === 'choose' ? head : mockQuestion
    if (!active) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      const choice = active.choices[Number(event.key) - ONE]
      if (!choice) return
      event.preventDefault()
      if (phase === 'recall') answerRecall(choice.value)
      else pickMock(choice.value)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const rows = unitsWeakestFirst(state, unitIds)

  if (phase === 'recall' && head) {
    // Questions asked so far: a requeued miss keeps its number instead of counting as a new question.
    const position = questions.length - run.queue.filter((item) => !run.repeated.includes(item.id)).length + (firstAttempt ? ONE : 0)
    const label = `Question ${position} of ${questions.length}${firstAttempt ? '' : ' · second try'}`
    return (
      <section className="page testprep-page" aria-label="Recall round">
        <Progress label={label} current={position} total={questions.length} />
        <PromptCard question={head} headingRef={headingRef} />
        {step === 'think' && <>
          <div className="testprep-covered" aria-hidden="true">
            {head.choices.map((choice, position) => <div className="testprep-covered-row" key={choice.value}><span className="choice-number">{position + ONE}</span><span className="testprep-covered-bar" /></div>)}
          </div>
          <p className="testprep-hint">Say it first. Choices are covered.</p>
          <div className="sprint-actions">
            <button type="button" className="button button-secondary" onClick={() => answerRecall(null)}>I blanked</button>
            <button key={head.id} type="button" className="button button-primary" autoFocus onClick={() => setStep('choose')}>Show choices</button>
          </div>
        </>}
        {step !== 'think' && <div className="choice-list" role="group" aria-label="Answers">
          {head.choices.map((choice, position) => {
            const reveal = step === 'result'
            const isCorrect = reveal && choice.value === head.answer
            const isIncorrect = reveal && picked === choice.value && choice.value !== head.answer
            return (
              <button type="button" key={choice.value} className={`choice-button ${isCorrect ? 'is-correct' : ''} ${isIncorrect ? 'is-incorrect' : ''}`} onClick={() => answerRecall(choice.value)} disabled={reveal}>
                <span className="choice-number">{position + ONE}</span>
                <span lang={head.answerLanguage}>{choice.label}</span>
              </button>
            )
          })}
        </div>}
        {step === 'result' && !recallCorrect && <div className="testprep-feedback" role="status">
          <p><strong lang={head.answerLanguage}>{answerText(head)}</strong>{firstAttempt ? ' · Comes back later.' : ''}</p>
          <button type="button" className="button button-primary" autoFocus onClick={nextRecall}>Next</button>
        </div>}
      </section>
    )
  }

  if (phase === 'done') {
    return (
      <section className="page results-page testprep-page">
        <header className="screen-header">
          <span className="screen-kicker">Test prep · Recall round</span>
          <h1 tabIndex={-1}>Round complete</h1>
        </header>
        <div className="results-score surface-panel">
          <span className="screen-kicker">First try</span>
          <strong>{run.firstTry} / {questions.length}</strong>
          <p>{run.missed.length === 0 ? 'No misses.' : `${run.missed.length} came back and were asked again.`}</p>
          <div className="results-actions">
            <button type="button" className="button button-primary" onClick={() => startRecall(buildRecallRound(unitIds, allCards, state))}>Again</button>
            <button type="button" className="button button-secondary" onClick={() => setPhase('pick')}>Change round</button>
          </div>
        </div>
        {run.missed.length > 0 && <details className="missed-recap" open>
          <summary>Review missed answers ({run.missed.length})</summary>
          <ol>{run.missed.map((item) => <li key={item.id}><span className="missed-recap-prompt" lang={item.promptLanguage}>{item.prompt}{item.promptNote ? ` · ${item.promptNote}` : ''}</span><strong lang={item.answerLanguage}>{answerText(item)}</strong></li>)}</ol>
        </details>}
      </section>
    )
  }

  if (mockQuestion) {
    const isLast = index === questions.length - ONE
    return (
      <section className="page testprep-page" aria-label="Mock test">
        <Progress label={`Question ${index + ONE} of ${questions.length} · Marked at the end`} current={index + ONE} total={questions.length} />
        <PromptCard question={mockQuestion} headingRef={headingRef} />
        <div className="choice-list" role="group" aria-label="Answers">
          {mockQuestion.choices.map((choice, position) => (
            <button type="button" key={choice.value} className={`choice-button ${answers[index] === choice.value ? 'is-picked' : ''}`} aria-pressed={answers[index] === choice.value} onClick={() => pickMock(choice.value)}>
              <span className="choice-number">{position + ONE}</span>
              <span lang={mockQuestion.answerLanguage}>{choice.label}</span>
            </button>
          ))}
        </div>
        {askFinish && <p className="testprep-hint" role="status">{unanswered} unanswered</p>}
        <div className="sprint-actions">
          <button type="button" className="button button-secondary" onClick={() => { setIndex(index - ONE); setAskFinish(false) }} disabled={index === FIRST_INDEX}>Back</button>
          {!isLast && <button type="button" className="button button-primary" onClick={() => setIndex(index + ONE)}>Next</button>}
          {isLast && !askFinish && <button type="button" className="button button-primary" onClick={() => unanswered > 0 ? setAskFinish(true) : finishMock()}>Finish</button>}
          {isLast && askFinish && <button type="button" className="button button-primary" onClick={finishMock}>Finish anyway</button>}
        </div>
      </section>
    )
  }

  if (phase === 'mock-results') {
    const result = scoreMockTest(questions, answers)
    const mockUnits = [...new Set(questions.map((question) => question.unitId))]
    const ratio = (unitId: string) => result.byUnit[unitId].score / result.byUnit[unitId].total
    const weakest = mockUnits.reduce<string | undefined>((lowest, unitId) => lowest === undefined || ratio(unitId) < ratio(lowest) ? unitId : lowest, undefined)
    const recallable = result.missed.filter((question) => question.recallable)
    return (
      <section className="page results-page testprep-page">
        <header className="screen-header">
          <span className="screen-kicker">Test prep · Mock test</span>
          <h1 tabIndex={-1}>Mock test results</h1>
        </header>
        <div className="results-score surface-panel">
          <span className="screen-kicker">Score</span>
          <strong>{result.score} / {result.total}</strong>
          {weakest && <p>Weakest: {weakest.toUpperCase()} · {unitName(weakest)}</p>}
          <div className="testprep-units">
            {mockUnits.map((unitId) => <UnitRow key={unitId} unitId={unitId} fraction={ratio(unitId)} value={`${result.byUnit[unitId].score}/${result.byUnit[unitId].total}`} />)}
          </div>
          <div className="results-actions">
            {recallable.length > 0 && <button type="button" className="button button-primary" onClick={() => startRecall(recallable)}>Recall the {recallable.length} {recallable.length === ONE ? 'miss' : 'misses'}</button>}
            <button type="button" className={`button ${recallable.length > 0 ? 'button-secondary' : 'button-primary'}`} onClick={startMock}>New mock test</button>
            <button type="button" className="button button-secondary" onClick={() => setPhase('pick')}>Change round</button>
          </div>
        </div>
        {result.missed.length > 0 && <details className="missed-recap" open>
          <summary>Review missed answers ({result.missed.length})</summary>
          <ol>{result.missed.map((item) => <li key={item.id}>
            <span className="missed-recap-prompt" lang={item.promptLanguage}>{item.prompt}{item.promptNote ? ` · ${item.promptNote}` : ''}</span>
            <strong lang={item.answerLanguage}>{answerText(item)}</strong>
            {item.feedback && <p>{item.feedback}</p>}
          </li>)}</ol>
        </details>}
      </section>
    )
  }

  return (
    <section className="page testprep-page">
      <header className="screen-header">
        <span className="screen-kicker">Test prep</span>
        <h1 tabIndex={-1}>Ready for the test?</h1>
        <p>{unitIds.length} {unitIds.length === ONE ? 'unit' : 'units'}, {poolSize} items. Boxes only change when you miss a card you have already practised.</p>
      </header>
      <div className="testprep-units" aria-label="Readiness by unit">
        {rows.map((unitId) => {
          const percent = readiness(state, unitId)
          return <UnitRow key={unitId} unitId={unitId} fraction={percent === undefined ? undefined : percent / PERCENT} value={percent === undefined ? '—' : `${percent}%`} />
        })}
      </div>
      <div className="practice-presets" role="group" aria-label="Test prep rounds">
        <button type="button" className={`practice-preset ${roundKind === 'recall' ? 'is-selected' : ''}`} aria-pressed={roundKind === 'recall'} onClick={() => setRoundKind('recall')}>
          <strong>Recall round</strong>
          <small>Answer in your head, then check. {RECALL_ROUND_SIZE} questions.</small>
        </button>
        <button type="button" className={`practice-preset ${roundKind === 'mock' ? 'is-selected' : ''}`} aria-pressed={roundKind === 'mock'} onClick={() => setRoundKind('mock')}>
          <strong>Mock test</strong>
          <small>{MOCK_TEST_SIZE} questions, marked at the end.</small>
        </button>
      </div>
      <details className="sprint-units">
        <summary>Change units ({unitIds.length} selected)</summary>
        <UnitPicker selectedIds={unitIds} onToggle={toggleUnit} />
      </details>
      <div className="results-actions">
        <button type="button" className="button button-primary" onClick={start} disabled={poolSize === 0}>Start</button>
      </div>
    </section>
  )
}
