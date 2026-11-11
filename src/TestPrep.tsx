import { useEffect, useMemo, useRef, useState } from 'react'
import { curriculumById, materialLabelsById } from './data/curriculum'
import { allCards } from './data/words.ts'
import { exerciseTargets } from './data/pilot-exercises.ts'
import { buildAnswerItems } from './data/test-prep-answers.ts'
import { dateKey, type CardProgress } from './leitner.ts'
import { ExerciseContext } from './question-view.tsx'
import { UnitPicker } from './UnitPicker.tsx'
import {
  BUILD_ROUND_SIZE,
  MOCK_TEST_SIZE,
  READINESS_WARN_PERCENT,
  RECALL_ROUND_SIZE,
  advanceRound,
  isBuiltAnswerCorrect,
  answerText,
  buildAnswerRound,
  buildMockTest,
  buildRecallRound,
  loadTestPrep,
  readiness,
  recordAnswers,
  saveTestPrep,
  scoreMockTest,
  startRound,
  unitsWeakestFirst,
  type BuildQuestion,
  type RoundRun,
  type TestPrepState,
  type TestQuestion,
} from './testprep.ts'

const CORRECT_ADVANCE_MS = 700
const PERCENT = 100
const FIRST_INDEX = 0
const ONE = 1

type Phase = 'pick' | 'recall' | 'done' | 'mock' | 'mock-results' | 'build' | 'build-done'
type RoundKind = 'recall' | 'mock' | 'build'
type Step = 'think' | 'choose' | 'build' | 'result'
type MissedRow = { id: string; prompt: string; promptLanguage: string; answer: string; answerLanguage: string; note?: string }

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

function RoundDone({ kicker, firstTry, total, missed, onAgain, onChange }: { kicker: string; firstTry: number; total: number; missed: MissedRow[]; onAgain: () => void; onChange: () => void }) {
  return (
    <section className="page results-page testprep-page">
      <header className="screen-header">
        <span className="screen-kicker">Test prep · {kicker}</span>
        <h1 tabIndex={-1}>Round complete</h1>
      </header>
      <div className="results-score surface-panel">
        <span className="screen-kicker">First try</span>
        <strong>{firstTry} / {total}</strong>
        <p>{missed.length === 0 ? 'No misses.' : `${missed.length} came back and were asked again.`}</p>
        <div className="results-actions">
          <button type="button" className="button button-primary" onClick={onAgain}>Again</button>
          <button type="button" className="button button-secondary" onClick={onChange}>Change round</button>
        </div>
      </div>
      {missed.length > 0 && <details className="missed-recap" open>
        <summary>Review missed answers ({missed.length})</summary>
        <ol>{missed.map((item) => <li key={item.id}>
          <span className="missed-recap-prompt" lang={item.promptLanguage}>{item.prompt}</span>
          <strong lang={item.answerLanguage}>{item.answer}</strong>
          {item.note && <p>{item.note}</p>}
        </li>)}</ol>
      </details>}
    </section>
  )
}

const builtSentence = (question: BuildQuestion) => question.item.answer.join(' ')

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
  const [buildQuestions, setBuildQuestions] = useState<BuildQuestion[]>([])
  const [buildRun, setBuildRun] = useState<RoundRun<BuildQuestion>>(() => startRound<BuildQuestion>([]))
  // Tile indexes in answer order; indexes, not values, because an answer can repeat a word.
  const [placed, setPlaced] = useState<number[]>([])
  const headingRef = useRef<HTMLHeadingElement>(null)

  const unitIds = state.unitIds
  const poolSize = useMemo(() => allCards.filter((card) => unitIds.includes(card.lessonId)).length + exerciseTargets.filter((target) => unitIds.includes(target.lessonId)).length, [unitIds])
  const head = run.queue[FIRST_INDEX]
  const firstAttempt = head !== undefined && !run.repeated.includes(head.id)
  const buildHead = buildRun.queue[FIRST_INDEX]
  const buildFirstAttempt = buildHead !== undefined && !buildRun.repeated.includes(buildHead.id)
  const buildAvailable = buildAnswerItems.some((item) => unitIds.includes(item.unitId))

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

  function startBuild() {
    const round = buildAnswerRound(unitIds, buildAnswerItems, state)
    if (round.length === 0) return
    setBuildQuestions(round)
    setBuildRun(startRound(round))
    setStep('think')
    setPlaced([])
    setPhase('build')
  }

  function start() {
    if (roundKind === 'mock') startMock()
    else if (roundKind === 'build' && buildAvailable) startBuild()
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

  const builtTiles = buildHead ? placed.map((tileIndex) => buildHead.tiles[tileIndex]) : []
  const buildCorrect = phase === 'build' && step === 'result' && buildHead !== undefined && isBuiltAnswerCorrect(buildHead.item, builtTiles)

  // Build: Check marks the placed tiles; "I blanked" arrives with none placed, which is a miss.
  function answerBuild() {
    if (!buildHead || step === 'result') return
    if (buildFirstAttempt) commit(recordAnswers(state, [{ unitId: buildHead.unitId, correct: isBuiltAnswerCorrect(buildHead.item, builtTiles) }]))
    setStep('result')
  }

  function nextBuild() {
    const next = advanceRound(buildRun, buildCorrect)
    setBuildRun(next)
    setStep('think')
    setPlaced([])
    if (next.queue.length === 0) setPhase('build-done')
  }

  const recallCorrect = phase === 'recall' && step === 'result' && picked === head?.answer
  useEffect(() => {
    const advance = recallCorrect ? nextRecall : buildCorrect ? nextBuild : undefined
    if (!advance) return undefined
    const timer = window.setTimeout(advance, CORRECT_ADVANCE_MS)
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
    return <RoundDone kicker="Recall round" firstTry={run.firstTry} total={questions.length} onAgain={() => startRecall(buildRecallRound(unitIds, allCards, state))} onChange={() => setPhase('pick')}
      missed={run.missed.map((item) => ({ id: item.id, prompt: `${item.prompt}${item.promptNote ? ` · ${item.promptNote}` : ''}`, promptLanguage: item.promptLanguage, answer: answerText(item), answerLanguage: item.answerLanguage }))} />
  }

  if (phase === 'build' && buildHead) {
    const position = buildQuestions.length - buildRun.queue.filter((item) => !buildRun.repeated.includes(item.id)).length + (buildFirstAttempt ? ONE : 0)
    const label = `Question ${position} of ${buildQuestions.length}${buildFirstAttempt ? '' : ' · second try'}`
    const slots = buildHead.item.answer.length
    const result = step === 'result'
    const blanked = result && placed.length === 0
    return (
      <section className="page testprep-page" aria-label="Build the answer">
        <Progress label={label} current={position} total={buildQuestions.length} />
        <div key={buildHead.id} className="prompt-card">
          <div className="question-meta"><span className="question-type-label">Build the answer</span></div>
          <div className="prompt-headline"><h1 tabIndex={-1} lang="fr">{buildHead.item.question}</h1></div>
        </div>
        {step === 'think' && <>
          <p className="testprep-hint">Think of your full answer first.</p>
          <div className="sprint-actions">
            <button type="button" className="button button-secondary" onClick={answerBuild}>I blanked</button>
            <button key={buildHead.id} type="button" className="button button-primary" autoFocus onClick={() => setStep('build')}>Show tiles</button>
          </div>
        </>}
        {step !== 'think' && !blanked && <div className="arrange-answer">
          <div className={`arranged-sentence testprep-built ${result ? (buildCorrect ? 'is-correct' : 'is-incorrect') : ''}`} aria-label="Your answer" lang="fr">
            {placed.length === 0 && <span>Tap tiles to build your answer</span>}
            {placed.map((tileIndex, position) => <button type="button" className="word-token is-selected" key={tileIndex} onClick={() => setPlaced(placed.filter((_, at) => at !== position))} disabled={result} aria-label={`Remove ${buildHead.tiles[tileIndex]}`}>{buildHead.tiles[tileIndex]}</button>)}
            {Array.from({ length: slots - placed.length }, (_, slot) => <span className="word-token is-ghost testprep-slot" key={`slot-${slot}`} aria-hidden="true" />)}
          </div>
          {!result && <div className="token-bank" aria-label="Tiles" lang="fr">
            {buildHead.tiles.map((tile, tileIndex) => placed.includes(tileIndex)
              ? <span className="word-token is-ghost" key={tileIndex} aria-hidden="true">{tile}</span>
              : <button type="button" className="word-token" key={tileIndex} onClick={() => { if (placed.length < slots) setPlaced([...placed, tileIndex]) }}>{tile}</button>)}
          </div>}
          {!result && <button type="button" className="button button-primary arrange-check" onClick={answerBuild} disabled={placed.length < slots}>Check</button>}
        </div>}
        {result && !buildCorrect && <div className="testprep-feedback" role="status">
          <p><strong lang="fr">{builtSentence(buildHead)}</strong>{buildFirstAttempt ? ' · Comes back later.' : ''}{buildHead.item.note && <><br />{buildHead.item.note}</>}</p>
          <button type="button" className="button button-primary" autoFocus onClick={nextBuild}>Next</button>
        </div>}
      </section>
    )
  }

  if (phase === 'build-done') {
    return <RoundDone kicker="Build the answer" firstTry={buildRun.firstTry} total={buildQuestions.length} onAgain={startBuild} onChange={() => setPhase('pick')}
      missed={buildRun.missed.map((item) => ({ id: item.id, prompt: item.item.question, promptLanguage: 'fr', answer: builtSentence(item), answerLanguage: 'fr', note: item.item.note }))} />
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
        {buildAvailable && <button type="button" className={`practice-preset ${roundKind === 'build' ? 'is-selected' : ''}`} aria-pressed={roundKind === 'build'} onClick={() => setRoundKind('build')}>
          <strong>Build the answer</strong>
          <small>Answer the instructor&apos;s question with tiles. {BUILD_ROUND_SIZE} questions.</small>
        </button>}
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
