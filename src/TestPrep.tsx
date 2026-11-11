import { useEffect, useMemo, useRef, useState } from 'react'
import { curriculumById, materialLabelsById } from './data/curriculum'
import { allCards } from './data/words.ts'
import { exerciseTargets } from './data/pilot-exercises.ts'
import { buildAnswerItems } from './data/test-prep-answers.ts'
import { dateKey, type CardProgress } from './leitner.ts'
import { ExerciseContext, choiceListClass, promptSizeClass } from './question-view.tsx'
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
    <div className="unit-bar">
      <div><span>{unitName(unitId)}</span><span>{value}</span></div>
      <span className="testprep-track" aria-hidden="true"><span className={`testprep-fill ${fraction !== undefined && percent < READINESS_WARN_PERCENT ? 'is-low' : ''}`} style={{ width: `${percent}%` }} /></span>
    </div>
  )
}

function StageBody({ question, note, headingRef }: { question: TestQuestion; note?: string; headingRef?: { current: HTMLHeadingElement | null } }) {
  return (
    <div key={question.id} className="stage-body">
      {question.source && <ExerciseContext question={question.source} />}
      <p className="stage-instruction">{question.label}{note ? ` · ${note}` : ''}</p>
      <div className="prompt-headline">
        <h1 ref={headingRef} tabIndex={-1} lang={question.promptLanguage} className={promptSizeClass(question.prompt)}>{question.prompt}</h1>
        {question.promptNote && <span className="conjugation-person">{question.promptNote}</span>}
      </div>
    </div>
  )
}

function StageTop({ label, current, total, onExit }: { label: string; current: number; total: number; onExit: () => void }) {
  return (
    <div className="stage-top">
      <button type="button" className="icon-plain" onClick={onExit} aria-label="End round"><svg className="icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
      <progress className="run-progress" max={total} value={current} aria-label={label} />
      <span className="stage-count" aria-hidden="true">{current}/{total}</span>
    </div>
  )
}

function RoundDone({ kicker, firstTry, total, missed, onAgain, onChange }: { kicker: string; firstTry: number; total: number; missed: MissedRow[]; onAgain: () => void; onChange: () => void }) {
  return (
    <section className="page fill-page results-page">
      <div className="result-head">
        <p className="kicker">{kicker} complete</p>
        <h1 tabIndex={-1}>{firstTry} of {total}</h1>
        <p>right on the first try. {missed.length === 0 ? 'No misses.' : `${missed.length} came back and were asked again.`}</p>
      </div>
      {missed.length > 0 && <details className="missed-recap" open>
        <summary>Missed ({missed.length})</summary>
        <ol>{missed.map((item) => <li key={item.id}>
          <span className="missed-recap-prompt" lang={item.promptLanguage}>{item.prompt}</span>
          <strong lang={item.answerLanguage}>{item.answer}</strong>
          {item.note && <p>{item.note}</p>}
        </li>)}</ol>
      </details>}
      <div className="spacer" />
      <div className="action-row">
        <button type="button" className="button button-secondary" onClick={onChange}>Change round</button>
        <button type="button" className="button button-primary" onClick={onAgain}>Again</button>
      </div>
    </section>
  )
}

const builtSentence = (question: BuildQuestion) => question.item.answer.join(' ')

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
  const exitRound = () => setPhase('pick')

  if (phase === 'recall' && head) {
    // Questions asked so far: a requeued miss keeps its number instead of counting as a new question.
    const position = questions.length - run.queue.filter((item) => !run.repeated.includes(item.id)).length + (firstAttempt ? ONE : 0)
    const label = `Question ${position} of ${questions.length}${firstAttempt ? '' : ' · second try'}`
    return (
      <section className="page run-page is-neutral" aria-label="Recall round">
        <div className="stage">
          <StageTop label={label} current={position} total={questions.length} onExit={exitRound} />
          <StageBody question={head} note={step === 'think' ? 'Say it first' : firstAttempt ? undefined : 'Second try'} headingRef={headingRef} />
        </div>
        <div className="sheet">
          {step === 'think' && <>
            <div className={`${choiceListClass(head.choices.map((choice) => choice.label))} is-covered`} role="img" aria-label="Choices are covered">
              {head.choices.map((choice) => <div key={choice.value} />)}
            </div>
            <div className="action-row">
              <button type="button" className="button button-secondary" onClick={() => answerRecall(null)}>I blanked</button>
              <button key={head.id} type="button" className="button button-primary" autoFocus onClick={() => setStep('choose')}>Show choices</button>
            </div>
          </>}
          {step !== 'think' && <div className={choiceListClass(head.choices.map((choice) => choice.label))} role="group" aria-label="Answers">
            {head.choices.map((choice, position) => {
              const reveal = step === 'result'
              const isCorrect = reveal && choice.value === head.answer
              const isIncorrect = reveal && picked === choice.value && choice.value !== head.answer
              return (
                <button type="button" key={choice.value} className={`choice-button ${isCorrect ? 'is-correct' : ''} ${isIncorrect ? 'is-incorrect' : ''}`} onClick={() => answerRecall(choice.value)} disabled={reveal}>
                  <span className="choice-number" aria-hidden="true">{position + ONE}</span>
                  <span lang={head.answerLanguage}>{choice.label}</span>
                </button>
              )
            })}
          </div>}
          {step === 'result' && !recallCorrect && <div className="feedback-panel" role="status">
            <div className="feedback-copy"><strong lang={head.answerLanguage}>{answerText(head)}</strong>{firstAttempt && <span>Comes back later.</span>}</div>
            <button type="button" className="button button-primary" autoFocus onClick={nextRecall}>Next</button>
          </div>}
        </div>
      </section>
    )
  }

  if (phase === 'done') {
    return <RoundDone kicker="Recall round" firstTry={run.firstTry} total={questions.length} onAgain={() => startRecall(buildRecallRound(unitIds, allCards, state))} onChange={exitRound}
      missed={run.missed.map((item) => ({ id: item.id, prompt: `${item.prompt}${item.promptNote ? ` · ${item.promptNote}` : ''}`, promptLanguage: item.promptLanguage, answer: answerText(item), answerLanguage: item.answerLanguage }))} />
  }

  if (phase === 'build' && buildHead) {
    const position = buildQuestions.length - buildRun.queue.filter((item) => !buildRun.repeated.includes(item.id)).length + (buildFirstAttempt ? ONE : 0)
    const label = `Question ${position} of ${buildQuestions.length}${buildFirstAttempt ? '' : ' · second try'}`
    const slots = buildHead.item.answer.length
    const result = step === 'result'
    const blanked = result && placed.length === 0
    return (
      <section className="page run-page is-neutral" aria-label="Build the answer">
        <div className="stage">
          <StageTop label={label} current={position} total={buildQuestions.length} onExit={exitRound} />
          <div key={buildHead.id} className="stage-body">
            <p className="stage-instruction">Build the answer{step === 'think' ? ' · Think of your full answer first' : buildFirstAttempt ? '' : ' · Second try'}</p>
            <div className="prompt-headline"><h1 tabIndex={-1} lang="fr" className={promptSizeClass(buildHead.item.question)}>{buildHead.item.question}</h1></div>
          </div>
        </div>
        <div className="sheet">
          {step === 'think' && <div className="action-row">
            <button type="button" className="button button-secondary" onClick={answerBuild}>I blanked</button>
            <button key={buildHead.id} type="button" className="button button-primary" autoFocus onClick={() => setStep('build')}>Show tiles</button>
          </div>}
          {step !== 'think' && !blanked && <div className="arrange-answer">
            <div className={`arranged-sentence ${result && !buildCorrect ? 'is-incorrect' : ''}`} aria-label="Your answer" lang="fr">
              {placed.length === 0 && <span>Tap tiles to build your answer</span>}
              {placed.map((tileIndex, position) => <button type="button" className="word-token is-selected" key={tileIndex} onClick={() => setPlaced(placed.filter((_, at) => at !== position))} disabled={result} aria-label={`Remove ${buildHead.tiles[tileIndex]}`}>{buildHead.tiles[tileIndex]}</button>)}
              {Array.from({ length: slots - placed.length }, (_, slot) => <span className="word-token is-selected is-ghost testprep-slot" key={`slot-${slot}`} aria-hidden="true" />)}
            </div>
            {!result && <div className="token-bank" aria-label="Tiles" lang="fr">
              {buildHead.tiles.map((tile, tileIndex) => placed.includes(tileIndex)
                ? <span className="word-token is-ghost" key={tileIndex} aria-hidden="true">{tile}</span>
                : <button type="button" className="word-token" key={tileIndex} onClick={() => { if (placed.length < slots) setPlaced([...placed, tileIndex]) }}>{tile}</button>)}
            </div>}
            {!result && <button type="button" className="button button-primary" onClick={answerBuild} disabled={placed.length < slots}>Check</button>}
          </div>}
          {result && !buildCorrect && <div className="feedback-panel" role="status">
            <div className="feedback-copy"><strong lang="fr">{builtSentence(buildHead)}</strong>{buildFirstAttempt && <span>Comes back later.</span>}{buildHead.item.note && <span>{buildHead.item.note}</span>}</div>
            <button type="button" className="button button-primary" autoFocus onClick={nextBuild}>Next</button>
          </div>}
        </div>
      </section>
    )
  }

  if (phase === 'build-done') {
    return <RoundDone kicker="Build the answer" firstTry={buildRun.firstTry} total={buildQuestions.length} onAgain={startBuild} onChange={exitRound}
      missed={buildRun.missed.map((item) => ({ id: item.id, prompt: item.item.question, promptLanguage: 'fr', answer: builtSentence(item), answerLanguage: 'fr', note: item.item.note }))} />
  }

  if (mockQuestion) {
    const isLast = index === questions.length - ONE
    return (
      <section className="page run-page is-neutral" aria-label="Mock test">
        <div className="stage">
          <StageTop label={`Question ${index + ONE} of ${questions.length} · Marked at the end`} current={index + ONE} total={questions.length} onExit={exitRound} />
          <StageBody question={mockQuestion} note="Marked at the end" headingRef={headingRef} />
        </div>
        <div className="sheet">
          <div className={choiceListClass(mockQuestion.choices.map((choice) => choice.label))} role="group" aria-label="Answers">
            {mockQuestion.choices.map((choice, position) => (
              <button type="button" key={choice.value} className={`choice-button ${answers[index] === choice.value ? 'is-picked' : ''}`} aria-pressed={answers[index] === choice.value} onClick={() => pickMock(choice.value)}>
                <span className="choice-number" aria-hidden="true">{position + ONE}</span>
                <span lang={mockQuestion.answerLanguage}>{choice.label}</span>
              </button>
            ))}
          </div>
          {askFinish && <p className="quiet-note" role="status">{unanswered} unanswered</p>}
          <div className="action-row">
            <button type="button" className="button button-secondary" onClick={() => { setIndex(index - ONE); setAskFinish(false) }} disabled={index === FIRST_INDEX}>Back</button>
            {!isLast && <button type="button" className="button button-primary" onClick={() => setIndex(index + ONE)}>Next</button>}
            {isLast && !askFinish && <button type="button" className="button button-primary" onClick={() => unanswered > 0 ? setAskFinish(true) : finishMock()}>Finish</button>}
            {isLast && askFinish && <button type="button" className="button button-primary" onClick={finishMock}>Finish anyway</button>}
          </div>
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
      <section className="page fill-page results-page">
        <div className="result-head">
          <p className="kicker">Mock test results</p>
          <h1 tabIndex={-1}>{result.score} of {result.total}</h1>
          {weakest && <p>Weakest: {unitName(weakest)}</p>}
        </div>
        <div className="testprep-units">
          {mockUnits.map((unitId) => <UnitRow key={unitId} unitId={unitId} fraction={ratio(unitId)} value={`${result.byUnit[unitId].score}/${result.byUnit[unitId].total}`} />)}
        </div>
        {result.missed.length > 0 && <details className="missed-recap" open>
          <summary>Missed ({result.missed.length})</summary>
          <ol>{result.missed.map((item) => <li key={item.id}>
            <span className="missed-recap-prompt" lang={item.promptLanguage}>{item.prompt}{item.promptNote ? ` · ${item.promptNote}` : ''}</span>
            <strong lang={item.answerLanguage}>{answerText(item)}</strong>
            {item.feedback && <p>{item.feedback}</p>}
          </li>)}</ol>
        </details>}
        <div className="spacer" />
        {recallable.length > 0 && <button type="button" className="button button-primary" onClick={() => startRecall(recallable)}>Recall the {recallable.length} {recallable.length === ONE ? 'miss' : 'misses'}</button>}
        <div className="action-row">
          <button type="button" className="button button-secondary" onClick={exitRound}>Change round</button>
          <button type="button" className={`button ${recallable.length > 0 ? 'button-secondary' : 'button-primary'}`} onClick={startMock}>New mock test</button>
        </div>
      </section>
    )
  }

  const scores = rows.map((unitId) => readiness(state, unitId)).filter((value): value is number => value !== undefined)
  const overall = scores.length === 0 ? undefined : Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length)
  return (
    <section className="page fill-page testprep-page">
      <div className="headline is-stacked">
        <h1 tabIndex={-1}>{overall === undefined ? 'Ready for the test?' : `${overall}% ready`}</h1>
        <p>{unitIds.length} {unitIds.length === ONE ? 'unit' : 'units'}, {poolSize} items. Boxes only change when you miss a card you have already practised.</p>
      </div>
      <div className="testprep-units" role="group" aria-label="Readiness by unit">
        {rows.map((unitId) => {
          const percent = readiness(state, unitId)
          return <UnitRow key={unitId} unitId={unitId} fraction={percent === undefined ? undefined : percent / PERCENT} value={percent === undefined ? '—' : `${percent}%`} />
        })}
      </div>
      <div className="spacer" />
      <div className="option-list is-tall" role="group" aria-label="Test prep rounds">
        <button type="button" className="option-row" aria-pressed={roundKind === 'recall'} onClick={() => setRoundKind('recall')}>
          <strong>Recall round</strong>
          <small>Answer in your head, then check. {RECALL_ROUND_SIZE} questions.</small>
        </button>
        <button type="button" className="option-row" aria-pressed={roundKind === 'mock'} onClick={() => setRoundKind('mock')}>
          <strong>Mock test</strong>
          <small>{MOCK_TEST_SIZE} questions, marked at the end.</small>
        </button>
        {buildAvailable && <button type="button" className="option-row" aria-pressed={roundKind === 'build'} onClick={() => setRoundKind('build')}>
          <strong>Build the answer</strong>
          <small>Answer the instructor&apos;s question with tiles. {BUILD_ROUND_SIZE} questions.</small>
        </button>}
      </div>
      <details className="unit-details">
        <summary>Change units ({unitIds.length} selected)</summary>
        <UnitPicker selectedIds={unitIds} onToggle={toggleUnit} />
      </details>
      <button type="button" className="button button-primary sticky-cta" onClick={start} disabled={poolSize === 0}>Start {roundKind === 'mock' ? 'mock test' : roundKind === 'build' && buildAvailable ? 'build round' : 'recall round'}</button>
    </section>
  )
}
