import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { curriculumById, curriculumUnits, materialLabelsById, type CurriculumUnit, type Level } from './data/curriculum'
import { allExercises } from './data/pilot-exercises'
import { allCards, allTargets } from './data/words'
import { ACTIVITY_TYPES, type ActivityType, type PracticeTarget } from './data/types'
import {
  BOXES,
  BOX_INTERVALS,
  activityAvailability,
  buildSessionQuestions,
  dateKey,
  getMasteredLessonIds,
  getQueueCounts,
  isDue,
  matchesActivityTypes,
  queueCards,
  responseIsCorrect,
  scheduleAnswer,
  shuffle,
  shelfCounts,
  type Box,
  type MissMode,
  type PracticeMode,
  type PracticeQuestion,
} from './leitner'
import { answerDisplayFor, choiceListClass, choicesFor, exerciseLabel, ExerciseContext, promptSizeClass } from './question-view.tsx'
import { SprintScreen } from './Sprint.tsx'
import { TestPrepScreen } from './TestPrep.tsx'
import { clearStoredState, completeStreak, defaultState, loadState, saveState, type CorrectAdvanceMode, type StoredState, type Theme } from './storage'

type Screen = 'today' | 'curriculum' | 'quiz' | 'results' | 'sprint' | 'testprep'
type ViewMode = 'normal' | 'presentation'
type IconName = 'menu' | 'close' | 'settings' | 'expand' | 'minimize' | 'arrow' | 'arrowLeft' | 'check' | 'chevron' | 'calendar' | 'book' | 'progress' | 'practice' | 'spark' | 'clock' | 'cards' | 'half' | 'cycle' | 'chat' | 'sliders' | 'hash'

type ActiveQuestion = PracticeQuestion & {
  choices: string[]
}

type Feedback = {
  correct: boolean
  answer: string
  selectedChoice: string
  previousBox: Box
  nextBox: Box
  stage: 'first' | 'repair'
}

type SessionStats = {
  total: number
  correct: number
  promotions: number
  misses: number
  repairs: number
  skipped: number
}

type MissedAnswer = {
  id: string
  prompt: string
  answer: string
  promptLanguage: string
  answerLanguage: string
  explanation?: string
}

type PracticePreset = 'noun-gender' | 'numbers' | 'word-meanings' | 'verb-forms' | 'grammar-usage' | 'custom'

const CORRECT_AUTO_ADVANCE_MS = 1600
const CORRECTION_AUTO_ADVANCE_MS = 4800
const MENU_CLOSE_MS = 200
const MENU_CLOSE_REDUCED_MS = 80
const FRENCH_ACCENTS = ['à', 'â', 'ç', 'é', 'è', 'ê', 'ë', 'î', 'ï', 'ô', 'ù', 'û', 'ü', 'œ'] as const

const levelNames: Record<Level, string> = {
  A: 'Foundations',
  B: 'Consolidate',
  C: 'Advanced',
}

const levelDescriptions: Record<Level, string> = {
  A: 'Objectives 1–32',
  B: 'Objectives 33–40',
  C: 'Professional themes',
}

const activityOptions: { type: ActivityType; label: string; description: string }[] = [
  { type: 'noun-gender', label: 'Noun gender', description: 'Choose masculine or feminine.' },
  { type: 'numbers', label: 'Numbers', description: 'Build French numbers from word tiles.' },
  { type: 'vocabulary', label: 'Vocabulary', description: 'Match French words and meanings.' },
  { type: 'conjugation', label: 'Conjugation', description: 'Present-tense form recall.' },
  { type: 'grammar', label: 'Grammar', description: 'Use French forms in context.' },
  { type: 'best-response', label: 'Best response', description: 'Choose the most useful workplace reply.' },
  { type: 'contextual-cloze', label: 'Fill in the blank', description: 'Complete a sentence in context.' },
  { type: 'ordered', label: 'Tap to order', description: 'Build a French phrase from word tiles.' },
  { type: 'correction', label: 'Spot the mistake', description: 'Find the part that needs correction.' },
  { type: 'reading', label: 'Reading', description: 'Read a passage and answer questions.' },
  { type: 'transformation', label: 'Rephrase it', description: 'Choose an equivalent expression.' },
  { type: 'scenario', label: 'Scenario', description: 'Choose the next workplace action.' },
  { type: 'typed', label: 'Spelling & typing', description: 'Type and spell the French answer.' },
]

const presetOptions: { id: Exclude<PracticePreset, 'custom'>; label: string; icon: IconName; mode: PracticeMode; types: readonly ActivityType[] }[] = [
  { id: 'noun-gender', label: 'Noun gender', icon: 'half', mode: 'vocabulary', types: ['noun-gender'] },
  { id: 'numbers', label: 'Numbers', icon: 'hash', mode: 'mixed', types: ['numbers'] },
  { id: 'word-meanings', label: 'Word meanings', icon: 'book', mode: 'vocabulary', types: ['vocabulary', 'ordered', 'typed'] },
  { id: 'verb-forms', label: 'Verb forms', icon: 'cycle', mode: 'conjugation', types: ['conjugation', 'typed'] },
  { id: 'grammar-usage', label: 'Grammar & usage', icon: 'chat', mode: 'mixed', types: ['grammar', 'contextual-cloze', 'correction', 'transformation', 'best-response', 'scenario'] },
]

// Pointer travel (px) before a press on a tile becomes a drag instead of a tap.
const TOKEN_DRAG_THRESHOLD = 6

function activityTypesForMode(mode: PracticeMode): ActivityType[] {
  if (mode === 'mixed') return [...ACTIVITY_TYPES]
  return mode === 'vocabulary' ? ['vocabulary', 'ordered', 'typed'] : ['conjugation', 'typed']
}

function practiceModeForActivityTypes(types: readonly ActivityType[]): PracticeMode {
  const matches = (preset: readonly ActivityType[]) => types.length === preset.length && preset.every((type) => types.includes(type))
  if (matches(activityTypesForMode('vocabulary'))) return 'vocabulary'
  if (matches(activityTypesForMode('conjugation'))) return 'conjugation'
  return 'mixed'
}

function practicePresetForSettings(mode: PracticeMode, types: readonly ActivityType[]): PracticePreset {
  const match = presetOptions.find((preset) => preset.mode === mode && preset.types.length === types.length && preset.types.every((type) => types.includes(type)))
  return match?.id ?? 'custom'
}

function activityTypeForQuestion(question: PracticeQuestion): ActivityType {
  if (question.kind === 'number') return 'numbers'
  if (question.vocabularyPractice === 'noun-gender') return 'noun-gender'
  if (question.exercise) return question.exercise.kind
  if (question.vocabularyPractice === 'recognition') return 'grammar'
  if (question.format === 'typed') return 'typed'
  if (question.format === 'arrange') return 'ordered'
  return question.kind === 'conjugation' ? 'conjugation' : 'vocabulary'
}

function shuffleByActivityType<T>(items: readonly T[], getType: (item: T) => ActivityType): T[] {
  const buckets = new Map<ActivityType, T[]>()
  items.forEach((item) => {
    const type = getType(item)
    const bucket = buckets.get(type) ?? []
    bucket.push(item)
    buckets.set(type, bucket)
  })
  const types = shuffle([...buckets.keys()])
  types.forEach((type) => buckets.set(type, shuffle(buckets.get(type) ?? [])))
  const result: T[] = []
  while (result.length < items.length) {
    for (const type of shuffle(types)) {
      const bucket = buckets.get(type)
      if (bucket?.length) result.push(bucket.shift()!)
    }
  }
  return result
}

const themeColors: Record<Theme, string> = {
  light: '#fbf9f4',
  dark: '#17101d',
}

const iconPaths: Record<IconName, string> = {
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'm6 6 12 12M18 6 6 18',
  settings: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm7-3.5a7 7 0 0 0-.1-1.2l1.4-1.1-1.8-3.1-1.7.7a7 7 0 0 0-2.1-1.2L14.5 4h-5l-.3 2.1a7 7 0 0 0-2.1 1.2l-1.7-.7-1.8 3.1L5 10.8a7 7 0 0 0 0 2.4l-1.4 1.1 1.8 3.1 1.7-.7a7 7 0 0 0 2.1 1.2l.3 2.1h5l.3-2.1a7 7 0 0 0 2.1-1.2l1.7.7 1.8-3.1-1.4-1.1c.1-.4.1-.8.1-1.2z',
  expand: 'M8 3H3v5m13-5h5v5m0 8v5h-5M3 16v5h5',
  minimize: 'M9 3v6H3m12 0h6V3M3 15h6v6m6-6h6v6',
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  arrowLeft: 'M20 12H5m6-6-6 6 6 6',
  check: 'm5 12 4 4L19 6',
  chevron: 'm7 9 5 5 5-5',
  calendar: 'M5 4h14a1 1 0 0 1 1 1v14H4V5a1 1 0 0 1 1-1zm3-2v4m8-4v4M4 9h16M8 13h2m2 0h2m-6 4h2m2 0h2',
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22zm16 0A2.5 2.5 0 0 0 17.5 3H13v17h4.5a2.5 2.5 0 0 1 2.5 2z',
  progress: 'M4 19V9m5 10V5m5 14v-8m5 8V3',
  practice: 'M8 5.5v13l10-6.5z',
  spark: 'm12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4z',
  clock: 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  cards: 'M5 4h11a1 1 0 0 1 1 1v11H6a1 1 0 0 1-1-1zm3 3h6m-6 3h6m-6 3h4M8 19h10a1 1 0 0 0 1-1V8',
  half: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 0v18M12 7a5 5 0 0 1 0 10',
  cycle: 'M4 12a8 8 0 0 1 13.7-5.7M20 12a8 8 0 0 1-13.7 5.7M17 3v4h-4M7 21v-4h4',
  chat: 'M4 5h16v11H9l-5 4zM8 9h8m-8 3h5',
  hash: 'M5 9h14M5 15h14M10 4l-2 16M16 4l-2 16',
  sliders: 'M4 7h9m5 0h2M4 17h3m5 0h8M15 5v4M9 15v4',
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={iconPaths[name]} />
    </svg>
  )
}

type AnswerHint = NonNullable<PracticeQuestion['help']> & {
  note?: string
}

function AnswerHintPopover({ hint, id, open, onToggle }: { hint: AnswerHint; id: string; open: boolean; onToggle: () => void }) {
  return (
    <>
      <button type="button" className="phrase-help-button" aria-expanded={open} aria-controls={id} onClick={onToggle}>
        <span>{hint.label}</span>
        {hint.phrase && <span lang="fr" className="phrase-help-term">{hint.phrase}</span>}
      </button>
      <p id={id} className={`shared-answer-tooltip ${open ? 'is-open' : ''}`} role="tooltip" hidden={!open}>
        {hint.phrase && <><span lang="fr">{hint.phrase}</span> — </>}{hint.text}{hint.note && <> ({hint.note})</>}
      </p>
    </>
  )
}

function cardMatchesMode(card: PracticeTarget, mode: PracticeMode, enabledActivityTypes?: readonly ActivityType[]): boolean {
  const modeMatches = card.kind === 'exercise' ? mode === 'mixed' : mode === 'mixed' || card.kind === mode
  return modeMatches && matchesActivityTypes(card, enabledActivityTypes)
}

function groupLabel(group: string): string {
  const objectives = group.match(/objectifs\s+([\d–-]+)/i)
  return objectives ? `Objectives ${objectives[1]}` : group
}

function materialLabel(unit: CurriculumUnit): string {
  return materialLabelsById[unit.id] ?? unit.title
}

function TabBar({ screen, onNavigate }: { screen: Screen; onNavigate: (next: Screen) => void }) {
  const tabs: { id: Screen; label: string; active: boolean }[] = [
    { id: 'today', label: 'Climb', active: screen === 'today' || screen === 'curriculum' },
    { id: 'sprint', label: 'Sprint', active: screen === 'sprint' },
    { id: 'testprep', label: 'Test', active: screen === 'testprep' },
    { id: 'results', label: 'Me', active: screen === 'results' },
  ]
  return (
    <nav className="tab-bar" aria-label="Sections">
      {tabs.map((tab) => <button type="button" key={tab.id} aria-current={tab.active ? 'page' : undefined} onClick={() => onNavigate(tab.id)}>{tab.label}</button>)}
    </nav>
  )
}

function MenuSheet({
  dailyGoal,
  missMode,
  correctAdvanceMode,
  onDailyGoalChange,
  onMissModeChange,
  onCorrectAdvanceModeChange,
  closing,
  onClose,
}: {
  dailyGoal: number
  missMode: MissMode
  correctAdvanceMode: CorrectAdvanceMode
  onDailyGoalChange: (value: number) => void
  onMissModeChange: (value: MissMode) => void
  onCorrectAdvanceModeChange: (value: CorrectAdvanceMode) => void
  closing: boolean
  onClose: () => void
}) {
  return (
    <>
      <button type="button" className={`menu-backdrop ${closing ? 'is-closing' : ''}`} onClick={onClose} aria-label="Close options" />
      <aside id="app-menu" className={`menu-sheet ${closing ? 'is-closing' : ''}`} role="dialog" aria-modal="true" aria-labelledby="menu-title" onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, select, [href], input, textarea')).filter((element) => !element.hasAttribute('disabled'))
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (!first || !last) return
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }}>
        <div className="menu-sheet-header">
          <h2 id="menu-title">Session options</h2>
          <button type="button" className="icon-plain" onClick={onClose} aria-label="Close options" autoFocus>
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="menu-setting">
          <label htmlFor="miss-mode">On a missed answer</label>
          <select id="miss-mode" name="miss-mode" autoComplete="off" value={missMode} onChange={(event) => onMissModeChange(event.target.value as MissMode)}>
            <option value="step-back">Step back one box</option>
            <option value="full-reset">Return to Box 1</option>
          </select>
        </div>
        <div className="menu-setting">
          <label htmlFor="correct-advance-mode">After a correct answer</label>
          <select id="correct-advance-mode" name="correct-advance-mode" autoComplete="off" value={correctAdvanceMode} onChange={(event) => onCorrectAdvanceModeChange(event.target.value as CorrectAdvanceMode)}>
            <option value="automatic">Continue automatically</option>
            <option value="manual">Wait for Next</option>
          </select>
        </div>
        <div className="menu-setting">
          <label htmlFor="daily-goal">Cards per session</label>
          <select id="daily-goal" name="daily-goal" autoComplete="off" value={dailyGoal} onChange={(event) => onDailyGoalChange(Number(event.target.value))}>
            {[5, 8, 12, 20].map((value) => <option key={value} value={value}>{value} cards</option>)}
          </select>
        </div>
      </aside>
    </>
  )
}

function PageTitle({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="page-title">
      <button type="button" className="icon-plain" onClick={onBack} aria-label="Back to practice"><Icon name="arrowLeft" size={20} /></button>
      <h1 tabIndex={-1}>{title}</h1>
    </div>
  )
}

const BOX_CADENCE: Record<Box, string> = { 1: 'New', 2: '1-day review', 3: '2-day review', 4: '4-day review', 5: '14+ day review' }
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`
const boxTotal = (counts: Record<Box, number>) => BOXES.reduce((sum, box) => sum + counts[box], 0)

// Box 5 on top, Box 1 at the bottom. `due` adds due badges (home); `deltas` makes the compact after-session version.
function Ladder({ counts, due, deltas }: { counts: Record<Box, number>; due?: Record<Box, number>; deltas?: Record<Box, number> }) {
  return (
    <div className={`ladder ${deltas ? 'is-compact' : ''}`} role="group" aria-label="Cards in each box">
      {[...BOXES].reverse().map((box) => (
        <div className={`rung box-${box}`} key={box}>
          <strong aria-label={plural(counts[box], 'card')}>{counts[box]}</strong>
          {due && due[box] > 0 && <span className="rung-pill">{due[box]} due</span>}
          <span className="rung-label"><b>Box {box}</b>{!deltas && BOX_CADENCE[box]}</span>
          {deltas && (deltas[box] === 0 ? <span className="rung-delta">no change</span> : <span className={`rung-pill ${deltas[box] < 0 ? 'is-outline' : ''}`}>{deltas[box] > 0 ? '+' : '−'}{Math.abs(deltas[box])}</span>)}
        </div>
      ))}
    </div>
  )
}

function BoxBar({ counts, labelled = false }: { counts: Record<Box, number>; labelled?: boolean }) {
  return (
    <div className={`box-bar ${labelled ? 'is-labelled' : ''}`} role="img" aria-label={BOXES.map((box) => `Box ${box}: ${counts[box]}`).join(', ')}>
      {BOXES.filter((box) => counts[box] > 0).map((box) => <span className={`box-${box}`} key={box} style={{ flexGrow: counts[box] }}>{labelled && counts[box]}</span>)}
    </div>
  )
}

function boxMoveLabel(feedback: Feedback): string {
  const days = feedback.correct ? (feedback.previousBox === 5 ? 0 : BOX_INTERVALS[feedback.previousBox - 1]) : BOX_INTERVALS[feedback.nextBox - 1]
  const when = !days ? '' : days === 1 ? ' · back tomorrow' : ` · back in ${days} days`
  return `${feedback.nextBox > feedback.previousBox ? '↑ Up to' : feedback.nextBox < feedback.previousBox ? '↓ Back to' : 'Stays in'} Box ${feedback.nextBox}${when}`
}

function TodayScreen({
  counts,
  dueCounts,
  queueCounts,
  activeUnits,
  masteredSelectedCount,
  dailyGoal,
  practiceMode,
  activePreset,
  missMode,
  enabledActivityTypes,
  activityCounts,
  selectedCardCount,
  readyCardCount,
  onStart,
  notice,
  onChooseCurriculum,
  onActivityTypesChange,
  onPresetChange,
}: {
  counts: Record<Box, number>
  dueCounts: Record<Box, number>
  queueCounts: ReturnType<typeof getQueueCounts>
  activeUnits: CurriculumUnit[]
  masteredSelectedCount: number
  dailyGoal: number
  practiceMode: PracticeMode
  activePreset: PracticePreset
  missMode: MissMode
  enabledActivityTypes: readonly ActivityType[]
  activityCounts: Record<ActivityType, number>
  selectedCardCount: number
  readyCardCount: number
  onStart: () => void
  notice: string | null
  onChooseCurriculum: () => void
  onActivityTypesChange: (value: ActivityType[]) => void
  onPresetChange: (preset: PracticePreset) => void
}) {
  const [customOpen, setCustomOpen] = useState(activePreset === 'custom')
  const [styleOpen, setStyleOpen] = useState(false)

  useEffect(() => {
    if (activePreset !== 'custom') setCustomOpen(false)
  }, [activePreset])

  const hasCards = readyCardCount > 0
  const hasFutureCards = queueCounts.future > 0
  const modeDescription = practiceMode === 'conjugation' ? 'conjugation cards' : practiceMode === 'vocabulary' ? 'vocabulary cards' : 'cards'
  const masteredOnly = activeUnits.length === 0 && masteredSelectedCount > 0
  const selectedUnitCount = activeUnits.length + masteredSelectedCount
  const needsMaterial = activeUnits.length === 0 && !masteredOnly
  const customActive = activePreset === 'custom' || customOpen
  const styleLabel = customActive ? 'Custom' : presetOptions.find((preset) => preset.id === activePreset)?.label ?? 'Custom'
  const dueTotal = boxTotal(dueCounts)

  if (styleOpen) {
    return (
      <section className="page fill-page">
        <PageTitle title="Practice style" onBack={() => setStyleOpen(false)} />
        <div className="tile-grid" role="group" aria-label="Practice styles">
          {presetOptions.map((preset) => (
            <button type="button" key={preset.id} className="tile" aria-pressed={activePreset === preset.id && !customOpen} onClick={() => { setCustomOpen(false); onPresetChange(preset.id) }}>
              <Icon name={preset.icon} size={20} />
              <strong>{preset.label}</strong>
            </button>
          ))}
          <button type="button" className="tile" aria-pressed={customActive} onClick={() => setCustomOpen(true)}>
            <Icon name="sliders" size={20} />
            <strong>Custom</strong>
            <small>{plural(enabledActivityTypes.length, 'question type')}</small>
          </button>
        </div>
        {customActive && <>
          <h2 className="section-label">Question types in Custom</h2>
          <div className="chip-group" role="group" aria-label="Question types">
            {activityOptions.map(({ type, label, description }) => {
              const checked = enabledActivityTypes.includes(type)
              const available = activityCounts[type] ?? 0
              const unavailable = available === 0
              return (
                <label className="chip-check" title={description} key={type}>
                  <input type="checkbox" aria-label={`${label}, ${available} available`} checked={checked} disabled={(unavailable && !checked) || (checked && enabledActivityTypes.length === 1)} onChange={() => onActivityTypesChange(checked ? enabledActivityTypes.filter((item) => item !== type) : [...enabledActivityTypes, type])} />
                  <span>{label}</span>
                  <small>{available}</small>
                </label>
              )
            })}
          </div>
        </>}
        <div className="spacer" />
        <button type="button" className="button button-primary" onClick={() => setStyleOpen(false)}>Use {styleLabel}</button>
      </section>
    )
  }

  return (
    <section className="page fill-page today-page">
      <div className="pill-row">
        <button type="button" className="pill" onClick={onChooseCurriculum}>{selectedUnitCount > 0 ? plural(selectedUnitCount, 'unit') : 'Choose material'}<Icon name="chevron" size={14} /></button>
        <button type="button" className="pill" onClick={() => setStyleOpen(true)} disabled={selectedUnitCount === 0}>{styleLabel}<Icon name="chevron" size={14} /></button>
      </div>
      <div className="headline">
        <h1 tabIndex={-1}>{needsMaterial ? 'Choose material' : dueTotal > 0 ? `${dueTotal} due` : hasCards ? `${readyCardCount} ready` : 'All caught up'}</h1>
        <span>{plural(boxTotal(counts), 'card')} on the ladder</span>
      </div>
      <Ladder counts={counts} due={dueCounts} />
      {notice && <p className="inline-notice" role="alert">{notice}</p>}
      {!hasCards && !notice && activeUnits.length > 0 && <p className="quiet-note">{selectedCardCount === 0 ? `No ${modeDescription} are authored for the selected units yet. Choose another practice style or add another unit.` : hasFutureCards ? 'No cards are due right now. Come back when the next review is ready.' : 'No cards are available right now.'}</p>}
      {!hasCards && !notice && masteredOnly && <p className="quiet-note">Mastered objectives return for occasional refreshes. {hasFutureCards ? 'The next refresh is scheduled.' : 'No refresh is due right now.'}</p>}
      <button type="button" className="button button-primary" onClick={needsMaterial ? onChooseCurriculum : onStart} disabled={!hasCards && !needsMaterial}>
        {hasCards ? `Start · ${plural(readyCardCount, 'card')}` : needsMaterial ? 'Choose material' : masteredOnly ? 'All caught up' : 'No practice ready'}
      </button>
    </section>
  )
}

function CurriculumScreen({
  selectedIds,
  masteredIds,
  masteredSelectedCount,
  selectedCardCount,
  practiceMode,
  unitCardCounts,
  onToggleLesson,
  onToggleLevel,
  onBack,
}: {
  selectedIds: string[]
  masteredIds: ReadonlySet<string>
  masteredSelectedCount: number
  selectedCardCount: number
  practiceMode: PracticeMode
  unitCardCounts: Record<string, number>
  onToggleLesson: (lessonId: string) => void
  onToggleLevel: (level: Level) => void
  onBack: () => void
}) {
  const [level, setLevel] = useState<Level>('A')
  const [search, setSearch] = useState('')
  const selected = new Set(selectedIds)
  const searchTerm = search.trim().toLocaleLowerCase()
  const visibleUnits = curriculumUnits.filter((unit) => !searchTerm || unit.id.includes(searchTerm) || unit.title.toLocaleLowerCase().includes(searchTerm) || materialLabel(unit).toLocaleLowerCase().includes(searchTerm))
  const levels: Level[] = ['A', 'B', 'C']
  const totalSelected = selectedIds.length + masteredSelectedCount

  return (
    <section className="page curriculum-page">
      <PageTitle title="Material" onBack={onBack} />
      <input id="curriculum-search" className="curriculum-search" type="search" aria-label="Find material" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by unit name or ID" />
      {!searchTerm && <div className="segmented" role="group" aria-label="Level">
        {levels.map((item) => <button type="button" key={item} aria-pressed={level === item} onClick={() => setLevel(item)}>Level {item}</button>)}
      </div>}
      <div className="curriculum-list">
        {/* A search looks across every level; otherwise only the chosen level shows. */}
        {(searchTerm ? levels : [level]).map((shownLevel) => {
          const units = visibleUnits.filter((unit) => unit.level === shownLevel)
          if (units.length === 0) return null
          const groups = [...new Set(units.map((unit) => unit.group))]
          const selectableUnits = units.filter((unit) => !masteredIds.has(unit.id))
          const selectedInLevel = selectableUnits.filter((unit) => selected.has(unit.id)).length
          const allLevelMastered = selectableUnits.length === 0
          return (
            <section className="level-section" key={shownLevel} aria-label={`Level ${shownLevel}`}>
              <div className="level-actions">
                <span>{levelNames[shownLevel]} · {levelDescriptions[shownLevel]} · {allLevelMastered ? 'All mastered' : `${selectedInLevel} / ${selectableUnits.length} selected`}</span>
                <button type="button" className="text-button" onClick={() => onToggleLevel(shownLevel)} disabled={allLevelMastered} aria-pressed={!allLevelMastered && selectedInLevel === selectableUnits.length}>{allLevelMastered ? 'All mastered' : selectedInLevel === selectableUnits.length ? 'Deselect all' : 'Select all'}</button>
              </div>
              {groups.map((group) => {
                const groupUnits = units.filter((unit) => unit.group === group)
                const allGroupMastered = groupUnits.every((unit) => masteredIds.has(unit.id))
                return (
                  <div className="unit-group" key={group}>
                    <div className="unit-group-heading">
                      <span>{groupLabel(group)}</span>
                      {allGroupMastered && <span>All mastered</span>}
                    </div>
                    <div className="unit-options">
                      {groupUnits.map((unit) => {
                        const mastered = masteredIds.has(unit.id)
                        return (
                          <label className={`unit-option ${mastered ? 'is-mastered' : ''}`} key={unit.id}>
                            <input type="checkbox" checked={selected.has(unit.id)} disabled={mastered} onChange={() => onToggleLesson(unit.id)} />
                            <span className="custom-check" aria-hidden="true"><Icon name="check" size={14} /></span>
                            <span className="unit-copy"><strong>{materialLabel(unit)}</strong><small><span lang="fr">{unit.title}</span> · {unit.id.toUpperCase()}{mastered ? ' · Mastered · occasional refresh' : ''}</small></span>
                            <span className="unit-count">{mastered ? 'Mastered' : plural(unitCardCounts[unit.id] ?? 0, 'card')}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </section>
          )
        })}
      </div>
      {visibleUnits.length === 0 && <p className="quiet-note">No material matches “{search}”.</p>}
      <p className="fine-print"><strong>Unofficial companion.</strong> Unit names follow the archived Government of Canada PFL2 taxonomy. Vocabulary terms are selected from public PDFs and paired with reviewed English glosses. This app is not affiliated with or endorsed by the Government of Canada.</p>
      <button type="button" className="button button-primary sticky-cta" onClick={onBack} disabled={totalSelected === 0}>Use {plural(totalSelected, 'unit')} · {plural(selectedCardCount, 'card')}</button>
    </section>
  )
}

function FeedbackPanel({
  question,
  feedback,
  index,
  total,
  advanceMode,
  onStartRepair,
  onContinue,
}: {
  question: ActiveQuestion
  feedback: Feedback
  index: number
  total: number
  advanceMode: CorrectAdvanceMode
  onStartRepair: () => void
  onContinue: () => void
}) {
  const actionRef = useRef<HTMLButtonElement>(null)
  const continueRef = useRef(onContinue)
  const shouldAutoAdvance = feedback.correct && feedback.stage === 'first' && advanceMode === 'automatic'
  const autoAdvanceDelay = question.exercise?.kind === 'correction' ? CORRECTION_AUTO_ADVANCE_MS : CORRECT_AUTO_ADVANCE_MS

  useEffect(() => {
    continueRef.current = onContinue
  }, [onContinue])

  useEffect(() => {
    if (!shouldAutoAdvance) {
      actionRef.current?.focus()
      return undefined
    }
    const timer = window.setTimeout(() => continueRef.current(), autoAdvanceDelay)
    return () => window.clearTimeout(timer)
  }, [autoAdvanceDelay, feedback.correct, feedback.stage, question.card.id, shouldAutoAdvance])

  const fullAnswer = answerDisplayFor(question, feedback.answer)
  const selectedAnswer = answerDisplayFor(question, feedback.selectedChoice)
  const revealed = feedback.correct || feedback.stage === 'repair'
  const explanation = revealed ? question.exercise?.feedback ?? question.answerExplanation : undefined
  const title = feedback.stage === 'repair'
    ? feedback.correct ? 'Correct on retry' : 'Still not quite'
    : feedback.correct ? 'Correct' : 'Not quite'

  return (
    <div className={`feedback-panel ${feedback.correct ? 'is-correct' : 'is-incorrect'}`}>
      <div className="feedback-copy" role={feedback.correct ? 'status' : 'alert'} aria-live={feedback.correct ? 'polite' : 'assertive'} aria-atomic="true">
        <strong>{title}</strong>
        {revealed && <span className="feedback-answer" lang={question.answerLanguage}>{fullAnswer}</span>}
        {feedback.stage === 'repair' && !feedback.correct && <span className="feedback-chosen">You chose <strong lang={question.answerLanguage}>{selectedAnswer}</strong></span>}
        {explanation && <span className="feedback-explanation">{explanation}</span>}
      </div>
      {!feedback.correct && feedback.stage === 'first'
        ? <button ref={actionRef} type="button" className="button button-primary" onClick={onStartRepair}>Try again</button>
        : !shouldAutoAdvance && <button ref={actionRef} type="button" className="button button-primary" onClick={onContinue}>{index + 1 === total ? 'Results' : 'Next'}</button>}
    </div>
  )
}

function QuizScreen({
  question,
  currentBox,
  index,
  total,
  feedback,
  repairing,
  onAnswer,
  onStartRepair,
  onContinue,
  advanceMode,
  onSkip,
  onExit,
  onMenu,
  menuOpen,
  menuTriggerRef,
  viewMode,
  onTogglePresentation,
}: {
  question: ActiveQuestion
  currentBox: Box
  index: number
  total: number
  feedback: Feedback | null
  repairing: boolean
  onAnswer: (choice: string) => void
  onStartRepair: () => void
  onContinue: () => void
  advanceMode: CorrectAdvanceMode
  onSkip: () => void
  onExit: () => void
  onMenu: () => void
  menuOpen: boolean
  menuTriggerRef: { current: HTMLButtonElement | null }
  viewMode: ViewMode
  onTogglePresentation: () => void
}) {
  const questionHeadingRef = useRef<HTMLHeadingElement>(null)
  const firstChoiceRef = useRef<HTMLButtonElement>(null)
  const typedInputRef = useRef<HTMLInputElement>(null)
  const [typedAnswer, setTypedAnswer] = useState('')
  const accentSelectionRef = useRef<{ start: number; end: number } | null>(null)
  const accentPointerHandledRef = useRef(false)
  const [selectedTokenIndexes, setSelectedTokenIndexes] = useState<number[]>([])
  const [tokenOrder, setTokenOrder] = useState<number[]>([])
  const answerRowRef = useRef<HTMLDivElement>(null)
  const tokenDragRef = useRef<{ tokenIndex: number; startX: number; startY: number; moved: boolean } | null>(null)
  const suppressTokenClickRef = useRef(false)
  const [draggedToken, setDraggedToken] = useState<{ tokenIndex: number; x: number; y: number } | null>(null)
  const [phraseHelpOpen, setPhraseHelpOpen] = useState(false)

  useEffect(() => {
    // The page scrolls inside main, so a new card has to be sent back to the top by hand.
    document.getElementById('main-content')?.scrollTo(0, 0)
    questionHeadingRef.current?.focus({ preventScroll: true })
  }, [question.card.id])

  useEffect(() => {
    setTypedAnswer('')
    accentSelectionRef.current = null
    accentPointerHandledRef.current = false
    setSelectedTokenIndexes([])
    setPhraseHelpOpen(false)
    const indexes = (question.tokens ?? []).map((_, tokenIndex) => tokenIndex)
    setTokenOrder(indexes.length > 1 ? [...indexes.slice(1), indexes[0]] : indexes)
    if (!repairing) return
    if (question.format === 'typed') typedInputRef.current?.focus({ preventScroll: true })
    else if (question.format === 'choice' || question.format === 'cloze' || question.format === 'correction') firstChoiceRef.current?.focus({ preventScroll: true })
  }, [question.card.id, question.format, question.tokens, repairing])

  const questionLabel = question.kind === 'number' ? 'Numbers · Build the number' : question.vocabularyPractice === 'noun-gender' ? 'Noun gender' : exerciseLabel(question) ?? (question.vocabularyPractice === 'recognition'
    ? 'Grammar · Recognition'
    : question.format === 'typed'
      ? question.kind === 'conjugation' ? 'Conjugation · Typed recall' : 'Vocabulary · Typed recall'
      : question.format === 'arrange'
        ? 'Vocabulary · Build the answer'
        : question.format === 'cloze'
          ? 'Conjugation · Fill the blank'
          : question.direction === 'english-to-french'
            ? 'Vocabulary · English → French'
            : 'Vocabulary · French → English')
  const questionInstruction = question.kind === 'number' ? 'Build this number in French. Not every tile is needed.' : question.vocabularyPractice === 'noun-gender' ? 'Is this noun masculine or feminine?' : question.vocabularyPractice === 'recognition'
    ? 'Choose the best answer.'
    : question.exercise?.kind === 'correction'
      ? 'Read the full text, then choose the underlined part that contains the error.'
    : question.exercise?.kind === 'reading'
      ? 'Read the passage, then choose the best answer.'
      : question.exercise?.kind === 'scenario'
        ? 'What should you say next?'
        : question.exercise?.kind === 'best-response'
          ? 'Choose the most appropriate response.'
            : question.exercise?.kind === 'transformation'
            ? 'Choose the equivalent expression.'
            : question.exercise?.kind === 'contextual-cloze'
              ? 'Try each option in the blank. Choose the one that makes the French sentence complete.'
              : question.exercise?.kind === 'ordered'
                ? 'Drag or tap the words to build the directive.'
                : question.format === 'typed'
                  ? question.kind === 'conjugation' ? 'Type the present-tense form. Add accents if they belong.' : 'Type the French answer. Use the accent buttons if needed.'
                  : question.format === 'arrange'
                    ? 'Drag or tap the words to build the French answer.'
                    : question.format === 'cloze'
                      ? 'Choose the present-tense form that completes the sentence.'
                      : question.direction === 'english-to-french'
                        ? 'How do you say this in French?'
                        : 'What does it mean in English?'
  const answerGroupLabel = question.vocabularyPractice === 'noun-gender' ? 'Choose the noun gender' : question.vocabularyPractice === 'recognition'
    ? 'Choose the best answer'
    : question.exercise?.kind === 'correction'
      ? 'Choose the segment to correct'
      : question.exercise
        ? 'Choose the best answer'
      : question.kind === 'conjugation'
        ? 'Choose the French conjugation'
        : question.direction === 'english-to-french'
          ? 'Choose the French translation'
          : 'Choose the English translation'
  const arrangedAnswer = selectedTokenIndexes.map((tokenIndex) => question.tokens?.[tokenIndex] ?? '').join(' ')
  const remainingTokenIndexes = tokenOrder.filter((tokenIndex) => !selectedTokenIndexes.includes(tokenIndex))
  // Number banks include trap tiles, so only some tiles are needed.
  const canCheckArranged = !feedback && (question.kind === 'number' ? selectedTokenIndexes.length > 0 : remainingTokenIndexes.length === 0)
  const answerHint = question.help
  const answerHintId = answerHint ? `question-help-${question.card.id}` : undefined

  useEffect(() => {
    const input = typedInputRef.current
    const form = input?.form
    const viewport = window.visualViewport
    if (!input || !form || !viewport) return undefined
    let frame = 0
    const keepInputVisible = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        if (document.activeElement === input) form.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' })
      })
    }
    viewport.addEventListener('resize', keepInputVisible)
    return () => {
      window.cancelAnimationFrame(frame)
      viewport.removeEventListener('resize', keepInputVisible)
    }
  }, [question.card.id, question.format])

  function submitTypedAnswer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (typedAnswer.trim() && !feedback) onAnswer(typedAnswer)
  }

  function submitArrangedAnswer() {
    if (canCheckArranged) onAnswer(arrangedAnswer)
  }

  function handleTokenPointerDown(event: React.PointerEvent<HTMLButtonElement>, tokenIndex: number) {
    if (feedback || event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    tokenDragRef.current = { tokenIndex, startX: event.clientX, startY: event.clientY, moved: false }
  }

  function handleTokenPointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = tokenDragRef.current
    if (!drag) return
    const x = event.clientX - drag.startX
    const y = event.clientY - drag.startY
    if (!drag.moved && Math.hypot(x, y) < TOKEN_DRAG_THRESHOLD) return
    drag.moved = true
    setDraggedToken({ tokenIndex: drag.tokenIndex, x, y })
  }

  // A drop in the answer row goes before the first tile below or right of the pointer; anywhere else returns the tile to the bank.
  function handleTokenPointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = tokenDragRef.current
    cancelTokenDrag()
    if (!drag?.moved) return
    suppressTokenClickRef.current = true
    window.setTimeout(() => { suppressTokenClickRef.current = false }, 0)
    const row = answerRowRef.current
    const bounds = row?.getBoundingClientRect()
    const rest = selectedTokenIndexes.filter((tokenIndex) => tokenIndex !== drag.tokenIndex)
    if (!row || !bounds || event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      setSelectedTokenIndexes(rest)
      return
    }
    const tiles = [...row.querySelectorAll<HTMLElement>('[data-token-index]')].filter((tile) => Number(tile.dataset.tokenIndex) !== drag.tokenIndex)
    const found = tiles.findIndex((tile) => {
      const box = tile.getBoundingClientRect()
      return event.clientY < box.top || (event.clientY <= box.bottom && event.clientX < box.left + box.width / 2)
    })
    const insertAt = found < 0 ? rest.length : found
    setSelectedTokenIndexes([...rest.slice(0, insertAt), drag.tokenIndex, ...rest.slice(insertAt)])
  }

  function cancelTokenDrag() {
    tokenDragRef.current = null
    setDraggedToken(null)
  }

  function tokenDragProps(tokenIndex: number) {
    const offset = draggedToken?.tokenIndex === tokenIndex ? draggedToken : null
    return {
      'data-token-index': tokenIndex,
      onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => handleTokenPointerDown(event, tokenIndex),
      onPointerMove: handleTokenPointerMove,
      onPointerUp: handleTokenPointerUp,
      onPointerCancel: cancelTokenDrag,
      style: offset ? { transform: `translate(${offset.x}px, ${offset.y}px)` } : undefined,
    }
  }

  function toggleToken(tokenIndex: number) {
    if (suppressTokenClickRef.current) return
    setSelectedTokenIndexes((current) => current.includes(tokenIndex) ? current.filter((indexToKeep) => indexToKeep !== tokenIndex) : [...current, tokenIndex])
  }

  function captureAccentSelection() {
    const input = typedInputRef.current
    if (!input) return
    const start = input.selectionStart ?? typedAnswer.length
    accentSelectionRef.current = { start, end: input.selectionEnd ?? start }
  }

  function insertAccent(character: string, selectionOverride?: { start: number; end: number }) {
    const input = typedInputRef.current
    if (!input || feedback) return
    const selection = selectionOverride ?? accentSelectionRef.current
    accentSelectionRef.current = null
    const start = selection?.start ?? input.selectionStart ?? typedAnswer.length
    const end = selection?.end ?? input.selectionEnd ?? start
    const nextValue = `${typedAnswer.slice(0, start)}${character}${typedAnswer.slice(end)}`
    setTypedAnswer(nextValue)
    window.requestAnimationFrame(() => {
      input.focus({ preventScroll: true })
      const cursor = start + character.length
      input.setSelectionRange(cursor, cursor)
    })
  }

  function handleAccentPointerDown(event: React.PointerEvent<HTMLButtonElement>, character: string) {
    event.preventDefault()
    if (accentPointerHandledRef.current) return
    accentPointerHandledRef.current = true
    const input = typedInputRef.current
    const start = input?.selectionStart ?? typedAnswer.length
    const end = input?.selectionEnd ?? start
    insertAccent(character, { start, end })
  }

  function handleAccentMouseDown(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
  }

  function handleAccentClick(character: string) {
    if (accentPointerHandledRef.current) {
      accentPointerHandledRef.current = false
      return
    }
    insertAccent(character)
  }

  const stageBox = feedback?.nextBox ?? currentBox
  const doneCount = index + (feedback?.correct ? 1 : 0)
  const isChoiceFormat = question.format === 'choice' || question.format === 'cloze' || question.format === 'correction'
  const canSkip = !feedback && !repairing
  const skipButton = canSkip && <button type="button" className="button button-secondary" onClick={onSkip}>Skip</button>

  return (
    <section className={`page quiz-page box-${stageBox}`}>
      <div className="stage">
        <div className="stage-top">
          <button type="button" className="icon-plain" onClick={onExit} aria-label="End session"><Icon name="close" size={20} /></button>
          <div className="segments" role="img" aria-label={`Card ${index + 1} of ${total}`}>
            {Array.from({ length: total }, (_, segment) => <i key={segment} className={segment < doneCount ? 'is-done' : segment === index ? 'is-current' : ''} />)}
          </div>
          <span className="stage-count">{index + 1}/{total}</span>
          <button type="button" className="icon-plain presentation-button" onClick={onTogglePresentation} aria-pressed={viewMode === 'presentation'} aria-label={viewMode === 'presentation' ? 'Exit presentation mode' : 'Enter presentation mode'}>
            <Icon name={viewMode === 'presentation' ? 'minimize' : 'expand'} size={18} />
          </button>
          {viewMode !== 'presentation' && <button ref={menuTriggerRef} type="button" className="icon-plain" onClick={onMenu} aria-label="Open session options" aria-haspopup="dialog" aria-expanded={menuOpen} aria-controls="app-menu">
            <Icon name="settings" size={18} />
          </button>}
        </div>
        <div key={question.card.id} className="stage-body">
          {feedback?.stage === 'first'
            ? <span className="stage-pill is-solid">{boxMoveLabel(feedback)}</span>
            : <span className="stage-pill">Box {currentBox}</span>}
          <span className="visually-hidden">{questionLabel}</span>
          <ExerciseContext question={question} />
          {question.exercise?.kind === 'contextual-cloze' && <span className="prompt-task-label">Complete the French sentence</span>}
          {question.exercise?.kind !== 'scenario' && <p className="stage-instruction">{questionInstruction}</p>}
          <div className="prompt-headline">
            <h1 ref={questionHeadingRef} tabIndex={-1} lang={question.promptLanguage} className={promptSizeClass(question.prompt)}>{question.prompt}</h1>
            {question.card.kind === 'conjugation' && question.format !== 'cloze' && <span className="conjugation-person">{question.card.person}</span>}
          </div>
        </div>
      </div>
      <div className="sheet">
        {repairing && <div className="repair-prompt" role="status" aria-live="polite">
          <span>{question.format === 'typed'
            ? 'Type the answer again without looking at the correction.'
            : question.format === 'arrange'
              ? 'Build the answer again without looking at the correction.'
              : question.exercise?.kind === 'correction'
                ? 'Read the full text again, then choose the underlined part with the error.'
                : question.card.kind === 'conjugation'
                  ? `Choose the form that matches ${question.card.person}.`
                  : 'Choose the answer again without looking at the correction.'}</span>
        </div>}
        {isChoiceFormat && <div className={choiceListClass(question.choices.map((choice) => question.choiceLabels?.[choice] ?? choice))} role="group" aria-label={answerGroupLabel}>
          {question.choices.map((choice, choiceIndex) => {
            const choiceLabel = question.choiceLabels?.[choice] ?? choice
            const isCorrect = Boolean(feedback?.correct || feedback?.stage === 'repair') && feedback?.answer === choice
            const isSelected = feedback?.selectedChoice === choice
            const repairLabel = feedback?.stage === 'repair' && !feedback.correct && choice === feedback.answer
              ? `${index + 1 === total ? 'Show results' : 'Continue to the next card'}`
              : undefined
            const accessibleLabel = repairLabel ? `${choiceLabel}. ${repairLabel}` : undefined
            return (
              <button ref={choiceIndex === 0 ? firstChoiceRef : undefined} type="button" className={`choice-button ${isCorrect ? 'is-correct' : ''} ${isSelected && !isCorrect ? 'is-incorrect' : ''}`} key={choice} onClick={() => onAnswer(choice)} disabled={Boolean(feedback?.correct || (feedback?.stage === 'repair' && choice !== feedback.answer))} aria-label={accessibleLabel}>
                <span className="choice-number" aria-hidden="true">{choiceIndex + 1}</span>
                <span lang={question.answerLanguage}>{choiceLabel}</span>
                {feedback && isCorrect && <Icon name="check" size={18} />}
                {feedback && isSelected && !isCorrect && <Icon name="close" size={18} />}
              </button>
            )
          })}
        </div>}
        {question.format === 'typed' && <form className="typed-answer-form" onSubmit={submitTypedAnswer}>
          <label htmlFor="typed-answer">Your answer</label>
          <input ref={typedInputRef} id="typed-answer" className="typed-answer-input" value={typedAnswer} onChange={(event) => setTypedAnswer(event.target.value)} onSelect={captureAccentSelection} onBlur={captureAccentSelection} lang={question.answerLanguage} placeholder={question.kind === 'conjugation' ? 'Present-tense form' : 'French answer'} inputMode="text" enterKeyHint="done" autoComplete="off" autoCapitalize="none" spellCheck={false} disabled={Boolean(feedback)} />
          <div className="accent-palette" role="group" aria-label="French accented characters">
            {FRENCH_ACCENTS.map((character) => <button key={character} type="button" className="accent-button" aria-label={`Insert ${character}`} onPointerDown={(event) => handleAccentPointerDown(event, character)} onMouseDown={handleAccentMouseDown} onClick={() => handleAccentClick(character)} disabled={Boolean(feedback)}>{character}</button>)}
          </div>
          {!feedback && <div className="action-row">
            {skipButton}
            <button type="submit" className="button button-primary" disabled={!typedAnswer.trim()}>Check</button>
          </div>}
        </form>}
        {question.format === 'arrange' && <div className="arrange-answer">
          <div ref={answerRowRef} className="arranged-sentence" aria-label="Your arranged answer" lang={question.answerLanguage}>
            {selectedTokenIndexes.length === 0 && <span>Drag or tap tiles below to build the answer.</span>}
            {selectedTokenIndexes.map((tokenIndex) => <button type="button" className={`word-token is-selected ${draggedToken?.tokenIndex === tokenIndex ? 'is-dragging' : ''}`} key={tokenIndex} {...tokenDragProps(tokenIndex)} onClick={() => toggleToken(tokenIndex)} disabled={Boolean(feedback)} aria-label={`Remove ${question.tokens?.[tokenIndex]}`}>{question.tokens?.[tokenIndex]}</button>)}
          </div>
          <div className="token-bank" aria-label="Available words" lang={question.answerLanguage}>
            {/* Used tiles leave a ghost so the rest of the bank never shifts. */}
            {tokenOrder.map((tokenIndex) => selectedTokenIndexes.includes(tokenIndex) ? <span className="word-token is-ghost" key={tokenIndex} aria-hidden="true">{question.tokens?.[tokenIndex]}</span> : <button type="button" className={`word-token ${draggedToken?.tokenIndex === tokenIndex ? 'is-dragging' : ''}`} key={tokenIndex} {...tokenDragProps(tokenIndex)} onClick={() => toggleToken(tokenIndex)} disabled={Boolean(feedback)}>{question.tokens?.[tokenIndex]}</button>)}
          </div>
          {!feedback && <div className="action-row">
            {skipButton}
            <button type="button" className="button button-primary" onClick={submitArrangedAnswer} disabled={!canCheckArranged}>Check</button>
          </div>}
        </div>}
        {canSkip && (isChoiceFormat || answerHint) && <div className="quiz-support-actions">
          {isChoiceFormat && <button type="button" className="text-button" onClick={onSkip}>Skip</button>}
          {answerHint && answerHintId && <AnswerHintPopover hint={answerHint} id={answerHintId} open={phraseHelpOpen} onToggle={() => setPhraseHelpOpen((open) => !open)} />}
        </div>}
        {feedback && <FeedbackPanel question={question} feedback={feedback} index={index} total={total} advanceMode={advanceMode} onStartRepair={onStartRepair} onContinue={onContinue} />}
      </div>
    </section>
  )
}

function ProgressionOverviewScreen({ state, shelf, unitShelves, onThemeChange, onResetLocalData, onMenu, menuOpen, menuTriggerRef }: { state: StoredState; shelf: Record<Box, number>; unitShelves: { unit: CurriculumUnit; counts: Record<Box, number> }[]; onThemeChange: (value: Theme) => void; onResetLocalData: () => void; onMenu: () => void; menuOpen: boolean; menuTriggerRef: { current: HTMLButtonElement | null } }) {
  const total = boxTotal(shelf)
  return (
    <section className="page fill-page me-page">
      <div className="headline">
        <h1 tabIndex={-1}>{plural(total, 'card')}</h1>
        <span>{shelf[5]} in Box 5 · {state.streak.count} {state.streak.count === 1 ? 'day' : 'days'} in a row</span>
      </div>
      <BoxBar counts={shelf} labelled />
      {unitShelves.length > 0 && <div className="unit-bars">
        <h2 className="section-label">By unit</h2>
        {unitShelves.map(({ unit, counts }) => (
          <div className="unit-bar" key={unit.id}>
            <div><span>{materialLabel(unit)}</span><span>{plural(boxTotal(counts), 'card')}</span></div>
            <BoxBar counts={counts} />
          </div>
        ))}
      </div>}
      <div className="spacer" />
      <div className="row-list">
        <button ref={menuTriggerRef} type="button" className="row" onClick={onMenu} aria-haspopup="dialog" aria-expanded={menuOpen} aria-controls="app-menu">Session options<Icon name="arrow" size={16} /></button>
        <details>
          <summary className="row">How the boxes work<Icon name="chevron" size={16} /></summary>
          <p>Every card sits in one of five boxes. A right answer moves it forward and spaces the next review further out; a missed card steps back. Due cards come first, then new cards fill the session.</p>
        </details>
        <label className="row theme-switch">
          Dark theme
          <input type="checkbox" role="switch" aria-checked={state.theme === 'dark'} checked={state.theme === 'dark'} onChange={(event) => onThemeChange(event.target.checked ? 'dark' : 'light')} />
          <span className="switch-track" aria-hidden="true"><span className="switch-thumb" /></span>
        </label>
        <button type="button" className="row" onClick={onResetLocalData}>Reset progress</button>
      </div>
      <p className="fine-print">Unofficial companion. Vocabulary cards use selected PFL2 PDF terms with reviewed English glosses; other activities are independently authored. Progress stays in this browser. <time dateTime="2026-09-07">Last updated: 7 September 2026</time></p>
    </section>
  )
}

function ResultsScreen({ results, shelf, startShelf, hasMoreCards, onDone, onKeepGoing }: { results: SessionStats & { box5Count: number; missedAnswers: MissedAnswer[] }; shelf: Record<Box, number>; startShelf: Record<Box, number>; hasMoreCards: boolean; onDone: () => void; onKeepGoing: () => void }) {
  const deltas = Object.fromEntries(BOXES.map((box) => [box, shelf[box] - startShelf[box]])) as Record<Box, number>
  return (
    <section className="page fill-page results-page">
      <div className="result-head">
        <p className="kicker">Session complete</p>
        <h1 tabIndex={-1}>{results.correct} of {results.total}</h1>
        <p>right on the first try. {plural(results.promotions, 'card')} climbed a box.{results.repairs > 0 && ` ${results.repairs} correct on retry.`}{results.skipped > 0 && ` ${results.skipped} skipped, still in your queue.`}</p>
      </div>
      <Ladder counts={shelf} deltas={deltas} />
      {results.missedAnswers.length > 0 && <details className="missed-recap" open>
        <summary>Missed ({results.missedAnswers.length})</summary>
        <ol>
          {results.missedAnswers.map((item) => <li key={item.id}>
            <span className="missed-recap-prompt" lang={item.promptLanguage}>{item.prompt}</span>
            <strong lang={item.answerLanguage}>{item.answer}</strong>
            {item.explanation && <p>{item.explanation}</p>}
          </li>)}
        </ol>
      </details>}
      <div className="spacer" />
      <div className="action-row">
        <button type="button" className="button button-secondary" onClick={onDone}>Done</button>
        <button type="button" className="button button-primary" onClick={onKeepGoing} disabled={!hasMoreCards}>{hasMoreCards ? 'Keep going' : 'All caught up'}</button>
      </div>
    </section>
  )
}

export default function App() {
  const today = dateKey()
  const [state, setState] = useState<StoredState>(() => loadState())
  const [screen, setScreen] = useState<Screen>('today')
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuClosing, setMenuClosing] = useState(false)
  const [session, setSession] = useState<ActiveQuestion[]>([])
  const [sessionLessonIds, setSessionLessonIds] = useState<string[]>([])
  const [focusedSession, setFocusedSession] = useState(false)
  const [sessionMode, setSessionMode] = useState<PracticeMode>('mixed')
  const [sessionActivityTypes, setSessionActivityTypes] = useState<ActivityType[]>([...ACTIVITY_TYPES])
  const [sessionStartProgress, setSessionStartProgress] = useState<StoredState['progress']>({})
  const [sessionIndex, setSessionIndex] = useState(0)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [repairing, setRepairing] = useState(false)
  const [repairContext, setRepairContext] = useState<Feedback | null>(null)
  const [sessionStats, setSessionStats] = useState<SessionStats>({ total: 0, correct: 0, promotions: 0, misses: 0, repairs: 0, skipped: 0 })
  const [results, setResults] = useState<(SessionStats & { box5Count: number; missedAnswers: MissedAnswer[] }) | null>(null)
  const [missedAnswers, setMissedAnswers] = useState<MissedAnswer[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('normal')
  const presentationFullscreen = useRef(false)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)
  const menuCloseTimerRef = useRef<number | null>(null)
  const previousScreenRef = useRef<Screen>(screen)
  const focusMainOnNavigationRef = useRef(false)

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.theme = state.theme
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', themeColors[state.theme])
  }, [state.theme])

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return undefined
    let frame = 0
    const updateViewportMetrics = () => {
      const layoutHeight = document.documentElement.clientHeight || window.innerHeight
      const keyboardInset = Math.max(0, layoutHeight - viewport.height - viewport.offsetTop)
      document.documentElement.style.setProperty('--visual-viewport-height', `${viewport.height}px`)
      document.documentElement.style.setProperty('--keyboard-inset', `${keyboardInset}px`)
    }
    const scheduleViewportMetrics = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(updateViewportMetrics)
    }
    updateViewportMetrics()
    viewport.addEventListener('resize', scheduleViewportMetrics)
    viewport.addEventListener('scroll', scheduleViewportMetrics)
    window.addEventListener('resize', scheduleViewportMetrics)
    return () => {
      window.cancelAnimationFrame(frame)
      viewport.removeEventListener('resize', scheduleViewportMetrics)
      viewport.removeEventListener('scroll', scheduleViewportMetrics)
      window.removeEventListener('resize', scheduleViewportMetrics)
      document.documentElement.style.removeProperty('--visual-viewport-height')
      document.documentElement.style.removeProperty('--keyboard-inset')
    }
  }, [])

  useEffect(() => {
    const onFullscreenChange = () => {
      if (document.fullscreenElement || !presentationFullscreen.current) return
      presentationFullscreen.current = false
      setViewMode('normal')
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    if (screen === 'quiz') return
    presentationFullscreen.current = false
    setViewMode('normal')
    if (document.fullscreenElement) {
      const exit = document.exitFullscreen?.()
      if (exit) void exit.catch(() => {})
    }
  }, [screen])

  useEffect(() => () => {
    if (menuCloseTimerRef.current !== null) window.clearTimeout(menuCloseTimerRef.current)
  }, [])

  const masteredLessonIds = useMemo(() => getMasteredLessonIds(allTargets, state.progress), [state.progress])
  const masteredSelectedLessonIds = useMemo(() => new Set(state.selectedLessonIds.filter((id) => masteredLessonIds.has(id))), [masteredLessonIds, state.selectedLessonIds])
  const activeLessonIds = useMemo(() => state.selectedLessonIds.filter((id) => !masteredLessonIds.has(id)), [masteredLessonIds, state.selectedLessonIds])
  const queueCounts = useMemo(() => getQueueCounts(allTargets, state.progress, activeLessonIds, today, state.practiceMode, state.enabledActivityTypes, masteredSelectedLessonIds), [activeLessonIds, masteredSelectedLessonIds, state.enabledActivityTypes, state.progress, state.practiceMode, today])
  const readyCardCount = useMemo(() => queueCards(allTargets, state.progress, activeLessonIds, today, state.dailyGoal, { mode: state.practiceMode, maxNewCards: state.dailyGoal, activityTypes: state.enabledActivityTypes, masteredLessonIds: masteredSelectedLessonIds }).length, [activeLessonIds, masteredSelectedLessonIds, state.dailyGoal, state.enabledActivityTypes, state.practiceMode, state.progress, today])
  const activityCounts = useMemo(() => activityAvailability(allTargets, state.selectedLessonIds, 'mixed'), [state.selectedLessonIds])
  const activeUnits = useMemo(() => activeLessonIds.map((id) => curriculumById.get(id)).filter((unit): unit is CurriculumUnit => Boolean(unit)), [activeLessonIds])
  const sprintCards = useMemo(() => allCards.filter((card) => state.selectedLessonIds.includes(card.lessonId)), [state.selectedLessonIds])
  const activePreset = useMemo(() => practicePresetForSettings(state.practiceMode, state.enabledActivityTypes), [state.enabledActivityTypes, state.practiceMode])
  const unitCardCounts = useMemo(() => allTargets.reduce<Record<string, number>>((counts, card) => {
    if (cardMatchesMode(card, state.practiceMode, state.enabledActivityTypes)) counts[card.lessonId] = (counts[card.lessonId] ?? 0) + 1
    return counts
  }, {}), [state.enabledActivityTypes, state.practiceMode])
  const selectedCardCount = useMemo(() => allTargets.filter((card) => activeLessonIds.includes(card.lessonId) && cardMatchesMode(card, state.practiceMode, state.enabledActivityTypes)).length, [activeLessonIds, state.enabledActivityTypes, state.practiceMode])
  const displayMode = screen === 'quiz' || (screen === 'results' && results) ? sessionMode : state.practiceMode
  const shelf = useMemo(() => shelfCounts(state.progress, activeLessonIds, allTargets, displayMode, state.enabledActivityTypes), [activeLessonIds, state.enabledActivityTypes, state.progress, displayMode])
  const dueShelf = useMemo(() => shelfCounts(Object.fromEntries(Object.entries(state.progress).filter(([, item]) => isDue(item, today))), activeLessonIds, allTargets, displayMode, state.enabledActivityTypes), [activeLessonIds, state.enabledActivityTypes, state.progress, displayMode, today])
  const unitShelves = useMemo(() => activeUnits.map((unit) => ({ unit, counts: shelfCounts(state.progress, [unit.id], allTargets, displayMode, state.enabledActivityTypes) })), [activeUnits, state.enabledActivityTypes, state.progress, displayMode])
  const sessionSelection = useMemo(() => {
    const selectedIds = sessionLessonIds.length > 0 ? sessionLessonIds : [...activeLessonIds, ...masteredSelectedLessonIds]
    const mastered = new Set(selectedIds.filter((id) => masteredLessonIds.has(id)))
    return { active: selectedIds.filter((id) => !mastered.has(id)), mastered }
  }, [activeLessonIds, masteredLessonIds, masteredSelectedLessonIds, sessionLessonIds])
  const sessionQueueCounts = useMemo(() => getQueueCounts(allTargets, state.progress, sessionSelection.active, today, sessionMode, sessionActivityTypes, sessionSelection.mastered), [sessionActivityTypes, sessionMode, sessionSelection, state.progress, today])
  const sessionShelf = useMemo(() => shelfCounts(state.progress, focusedSession && sessionLessonIds.length > 0 ? sessionLessonIds : sessionSelection.active, allTargets, displayMode, sessionActivityTypes), [displayMode, focusedSession, sessionActivityTypes, sessionLessonIds, sessionSelection.active, state.progress])
  const sessionStartShelf = useMemo(() => shelfCounts(sessionStartProgress, focusedSession && sessionLessonIds.length > 0 ? sessionLessonIds : sessionSelection.active, allTargets, displayMode, sessionActivityTypes), [displayMode, focusedSession, sessionActivityTypes, sessionLessonIds, sessionSelection.active, sessionStartProgress])
  const currentQuestion = session[sessionIndex]
  const currentChoices = currentQuestion?.choices ?? []

  function commitState(next: StoredState) {
    setState(next)
    saveState(next)
  }

  function updateState(change: (previous: StoredState) => StoredState) {
    setState((previous) => {
      const next = change(previous)
      saveState(next)
      return next
    })
  }

  function openMenu() {
    if (menuCloseTimerRef.current !== null) {
      window.clearTimeout(menuCloseTimerRef.current)
      menuCloseTimerRef.current = null
    }
    setMenuClosing(false)
    setMenuOpen(true)
  }

  function closeMenuImmediately() {
    if (menuCloseTimerRef.current !== null) {
      window.clearTimeout(menuCloseTimerRef.current)
      menuCloseTimerRef.current = null
    }
    setMenuClosing(false)
    setMenuOpen(false)
  }

  function closeMenu() {
    if (!menuOpen || menuClosing) return
    setMenuClosing(true)
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? MENU_CLOSE_REDUCED_MS : MENU_CLOSE_MS
    menuCloseTimerRef.current = window.setTimeout(() => {
      menuCloseTimerRef.current = null
      setMenuOpen(false)
      setMenuClosing(false)
      window.requestAnimationFrame(() => menuTriggerRef.current?.focus())
    }, duration)
  }

  function exitPresentationMode() {
    setViewMode('normal')
    presentationFullscreen.current = false
    if (typeof document === 'undefined' || !document.fullscreenElement) return
    const exit = document.exitFullscreen?.()
    if (exit) void exit.catch(() => {})
  }

  function togglePresentationMode() {
    if (viewMode === 'presentation') {
      exitPresentationMode()
      return
    }
    setViewMode('presentation')
    if (typeof document === 'undefined') return
    const request = document.documentElement.requestFullscreen?.()
    if (!request) return
    presentationFullscreen.current = true
    void request.catch(() => { presentationFullscreen.current = false })
  }

  function navigate(next: Screen) {
    focusMainOnNavigationRef.current = true
    if (next === 'results') setResults(null)
    setScreen(next)
    closeMenuImmediately()
  }

  function beginSession(
    nextQueue: readonly PracticeTarget[],
    requestedLessonIds: readonly string[],
    sessionPracticeMode: PracticeMode,
    sessionTypes: readonly ActivityType[],
    focused: boolean,
  ) {
    const nextSession = shuffleByActivityType(
      buildSessionQuestions(nextQueue, state.progress, sessionTypes, allCards, allExercises, Math.random).map((question) => ({
        ...question,
        choices: choicesFor(question),
      })),
      activityTypeForQuestion,
    )
    setSession(nextSession)
    setSessionStartProgress(state.progress)
    setSessionLessonIds([...requestedLessonIds])
    setFocusedSession(focused)
    setSessionMode(sessionPracticeMode)
    setSessionActivityTypes([...sessionTypes])
    setSessionIndex(0)
    setFeedback(null)
    setRepairing(false)
    setRepairContext(null)
    setSessionStats({ total: nextQueue.length, correct: 0, promotions: 0, misses: 0, repairs: 0, skipped: 0 })
    setMissedAnswers([])
    setViewMode('normal')
    setNotice(null)
    setScreen('quiz')
    closeMenuImmediately()
  }

  function startSession(lessonIds?: readonly string[]) {
    const requestedLessonIds = [...new Set(lessonIds ?? [...activeLessonIds, ...masteredSelectedLessonIds])]
    const focusedMasteredLessonIds = new Set(requestedLessonIds.filter((id) => masteredLessonIds.has(id)))
    const focusedActiveLessonIds = requestedLessonIds.filter((id) => !focusedMasteredLessonIds.has(id))
    const sessionPracticeMode = state.practiceMode
    const sessionTypes = state.enabledActivityTypes
    const currentDate = dateKey()
    const focusedQueueCounts = getQueueCounts(allTargets, state.progress, focusedActiveLessonIds, currentDate, sessionPracticeMode, sessionTypes, focusedMasteredLessonIds)
    const focusedCardCount = allTargets.filter((card) => focusedActiveLessonIds.includes(card.lessonId) && cardMatchesMode(card, sessionPracticeMode, sessionTypes)).length
    const nextQueue = queueCards(allTargets, state.progress, focusedActiveLessonIds, currentDate, state.dailyGoal, { mode: sessionPracticeMode, maxNewCards: state.dailyGoal, activityTypes: sessionTypes, masteredLessonIds: focusedMasteredLessonIds })
    if (nextQueue.length === 0) {
      setNotice(focusedActiveLessonIds.length === 0 && focusedMasteredLessonIds.size === 0
        ? 'Choose material before starting.'
        : focusedQueueCounts.future > 0
          ? 'No cards are due right now. Your next review will appear on its scheduled date.'
          : focusedCardCount === 0
            ? 'No practice items are available for the selected units yet.'
            : 'No cards are available right now.')
      if (lessonIds !== undefined) {
        setScreen('today')
        closeMenuImmediately()
      }
      return
    }
    beginSession(nextQueue, requestedLessonIds, sessionPracticeMode, sessionTypes, lessonIds !== undefined)
  }

  function answer(choice: string) {
    if (!currentQuestion || feedback || repairing) return
    const correct = responseIsCorrect(currentQuestion, choice)
    const cardId = currentQuestion.card.id
    const result = scheduleAnswer(state.progress[cardId], correct, dateKey(), state.missMode)
    const nextState: StoredState = { ...state, progress: { ...state.progress, [cardId]: result.progress } }
    commitState(nextState)
    setFeedback({ correct, answer: currentQuestion.answer, selectedChoice: choice, previousBox: result.previousBox, nextBox: result.nextBox, stage: 'first' })
    if (!correct) setMissedAnswers((current) => current.some((item) => item.id === cardId) ? current : [...current, {
      id: cardId,
      prompt: currentQuestion.prompt,
      answer: answerDisplayFor(currentQuestion),
      promptLanguage: currentQuestion.promptLanguage,
      answerLanguage: currentQuestion.answerLanguage,
      explanation: currentQuestion.exercise?.feedback ?? currentQuestion.answerExplanation,
    }])
    setSessionStats((current) => ({ ...current, correct: current.correct + (correct ? 1 : 0), promotions: current.promotions + (result.promoted ? 1 : 0), misses: current.misses + (result.missed ? 1 : 0) }))
  }

  // Test prep: a first-attempt miss on a card that already has progress sends it back to Box 1. Unseen cards stay unseen.
  function recordTestPrepMiss(id: string) {
    updateState((previous) => previous.progress[id] ? { ...previous, progress: { ...previous.progress, [id]: scheduleAnswer(previous.progress[id], false, dateKey(), 'full-reset').progress } } : previous)
  }

  function beginRepair() {
    if (!feedback || feedback.correct || feedback.stage !== 'first') return
    setRepairContext(feedback)
    setFeedback(null)
    setRepairing(true)
  }

  function completeRepair(choice: string, context: Feedback) {
    if (!currentQuestion) return
    const correct = responseIsCorrect(currentQuestion, choice)
    setFeedback({ ...context, correct, selectedChoice: choice, stage: 'repair' })
    setRepairing(false)
    setRepairContext(null)
    if (correct) setSessionStats((current) => ({ ...current, repairs: current.repairs + 1 }))
  }

  function handleAnswer(choice: string) {
    if (repairing && repairContext) completeRepair(choice, repairContext)
    else if (feedback && !feedback.correct && feedback.stage === 'first') completeRepair(choice, feedback)
    else if (feedback && !feedback.correct && feedback.stage === 'repair' && choice === feedback.answer) continueSession()
    else answer(choice)
  }

  function finishSession(stats: SessionStats) {
    const completedStreak = completeStreak(state.streak, today)
    const nextState = { ...state, streak: completedStreak }
    commitState(nextState)
    const nextMasteredLessonIds = getMasteredLessonIds(allTargets, nextState.progress)
    const nextActiveLessonIds = focusedSession
      ? sessionLessonIds
      : nextState.selectedLessonIds.filter((id) => !nextMasteredLessonIds.has(id))
    setResults({ ...stats, box5Count: shelfCounts(nextState.progress, nextActiveLessonIds, allTargets, sessionMode, nextState.enabledActivityTypes)[5], missedAnswers })
    setScreen('results')
    setFeedback(null)
    setRepairing(false)
    setRepairContext(null)
  }

  function continueSession() {
    if (!feedback || repairing) return
    if (sessionIndex + 1 < session.length) {
      setSessionIndex((current) => current + 1)
      setFeedback(null)
      setRepairing(false)
      setRepairContext(null)
      return
    }
    finishSession(sessionStats)
  }

  function skipCurrentCard() {
    if (!currentQuestion || feedback || repairing) return
    const nextStats = { ...sessionStats, total: Math.max(0, sessionStats.total - 1), skipped: sessionStats.skipped + 1 }
    setSessionStats(nextStats)
    setFeedback(null)
    setRepairing(false)
    setRepairContext(null)
    if (sessionIndex + 1 < session.length) {
      setSession((current) => current.filter((_, index) => index !== sessionIndex))
      return
    }
    if (nextStats.total === 0) {
      setSession([])
      setSessionIndex(0)
      setNotice('Skipped cards stay in your queue for later. No progress was changed.')
      setScreen('today')
      return
    }
    finishSession(nextStats)
  }

  function exitSession() {
    exitPresentationMode()
    setFeedback(null)
    setRepairing(false)
    setRepairContext(null)
    setScreen('today')
  }

  function updateDailyGoal(value: number) {
    updateState((previous) => ({ ...previous, dailyGoal: value }))
  }

  function updateActivityTypes(values: ActivityType[]) {
    const enabledActivityTypes = ACTIVITY_TYPES.filter((type) => values.includes(type))
    if (enabledActivityTypes.length === 0) return
    setNotice(null)
    updateState((previous) => ({
      ...previous,
      practiceMode: practiceModeForActivityTypes(enabledActivityTypes),
      enabledActivityTypes,
    }))
  }

  function updatePreset(preset: PracticePreset) {
    if (preset === 'custom') return
    const selected = presetOptions.find((option) => option.id === preset)
    if (!selected) return
    updateState((previous) => ({ ...previous, practiceMode: selected.mode, enabledActivityTypes: [...selected.types] }))
    setNotice(null)
  }

  function updateMissMode(value: MissMode) {
    updateState((previous) => ({ ...previous, missMode: value }))
  }

  function updateCorrectAdvanceMode(value: CorrectAdvanceMode) {
    updateState((previous) => ({ ...previous, correctAdvanceMode: value }))
  }

  function updateTheme(value: Theme) {
    updateState((previous) => ({ ...previous, theme: value }))
  }

  function resetLocalData() {
    if (!window.confirm('Reset all local data? This erases your progress, streak, material selection, and preferences from this browser.')) return
    if (!clearStoredState()) {
      setScreen('today')
      setNotice('We could not clear browser storage. Use your browser site-data settings to remove this app\'s data.')
      closeMenu()
      return
    }
    setState(defaultState())
    setScreen('today')
    closeMenu()
    setSession([])
    setSessionLessonIds([])
    setFocusedSession(false)
    setSessionMode('vocabulary')
    setSessionActivityTypes(['vocabulary', 'ordered', 'typed'])
    setSessionIndex(0)
    setFeedback(null)
    setRepairing(false)
    setRepairContext(null)
    setSessionStats({ total: 0, correct: 0, promotions: 0, misses: 0, repairs: 0, skipped: 0 })
    setMissedAnswers([])
    setResults(null)
    setNotice(null)
  }

  function toggleLesson(lessonId: string) {
    if (masteredLessonIds.has(lessonId)) return
    setNotice(null)
    updateState((previous) => {
      const selected = new Set(previous.selectedLessonIds)
      if (selected.has(lessonId)) selected.delete(lessonId)
      else selected.add(lessonId)
      return { ...previous, selectedLessonIds: [...selected] }
    })
  }

  function toggleLevel(level: Level) {
    setNotice(null)
    updateState((previous) => {
      const mastered = getMasteredLessonIds(allTargets, previous.progress)
      const levelIds = curriculumUnits.filter((unit) => unit.level === level && !mastered.has(unit.id)).map((unit) => unit.id)
      const selected = new Set(previous.selectedLessonIds)
      const shouldSelect = levelIds.some((id) => !selected.has(id))
      levelIds.forEach((id) => shouldSelect ? selected.add(id) : selected.delete(id))
      return { ...previous, selectedLessonIds: [...selected] }
    })
  }

  useEffect(() => {
    const changed = previousScreenRef.current !== screen
    previousScreenRef.current = screen
    const shouldFocus = changed || focusMainOnNavigationRef.current
    focusMainOnNavigationRef.current = false
    if (!shouldFocus || menuOpen || screen === 'quiz') return undefined
    document.getElementById('main-content')?.scrollTo(0, 0)
    const frame = window.requestAnimationFrame(() => document.querySelector<HTMLElement>('#main-content h1')?.focus({ preventScroll: true }))
    return () => window.cancelAnimationFrame(frame)
  }, [menuOpen, screen])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen, menuClosing])

  useEffect(() => {
    if (menuOpen || screen !== 'quiz' || !currentQuestion || feedback?.correct || !['choice', 'cloze', 'correction'].includes(currentQuestion.format)) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      const index = Number(event.key) - 1
      if (index >= 0 && index < currentChoices.length) {
        const choice = currentChoices[index]
        if (feedback?.stage === 'repair' && choice !== feedback.answer) return
        event.preventDefault()
        handleAnswer(choice)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen, screen, currentQuestion?.card.id, feedback, repairing, currentChoices])

  function renderScreen() {
    const hasMoreCards = sessionQueueCounts.overdue + sessionQueueCounts.due + sessionQueueCounts.newCards > 0
    if (screen === 'curriculum') return <CurriculumScreen selectedIds={activeLessonIds} masteredIds={masteredLessonIds} masteredSelectedCount={masteredSelectedLessonIds.size} selectedCardCount={selectedCardCount} practiceMode={state.practiceMode} unitCardCounts={unitCardCounts} onToggleLesson={toggleLesson} onToggleLevel={toggleLevel} onBack={() => setScreen('today')} />
    if (screen === 'quiz' && currentQuestion) return <QuizScreen question={currentQuestion} currentBox={state.progress[currentQuestion.card.id]?.box ?? 1} index={sessionIndex} total={session.length} feedback={feedback} repairing={repairing} onAnswer={handleAnswer} onStartRepair={beginRepair} onContinue={continueSession} advanceMode={state.correctAdvanceMode} onSkip={skipCurrentCard} onExit={exitSession} onMenu={openMenu} menuOpen={menuOpen} menuTriggerRef={menuTriggerRef} viewMode={viewMode} onTogglePresentation={togglePresentationMode} />
    if (screen === 'sprint') return <SprintScreen selectedCards={sprintCards} selectedIds={state.selectedLessonIds} masteredIds={masteredLessonIds} onToggleLesson={toggleLesson} />
    if (screen === 'testprep') return <TestPrepScreen progress={state.progress} onMiss={recordTestPrepMiss} />
    if (screen === 'results') return results ? <ResultsScreen results={results} shelf={sessionShelf} startShelf={sessionStartShelf} hasMoreCards={hasMoreCards} onDone={() => setScreen('today')} onKeepGoing={() => startSession(sessionLessonIds)} /> : <ProgressionOverviewScreen state={state} shelf={shelf} unitShelves={unitShelves} onThemeChange={updateTheme} onResetLocalData={resetLocalData} onMenu={openMenu} menuOpen={menuOpen} menuTriggerRef={menuTriggerRef} />
    return <TodayScreen counts={shelf} dueCounts={dueShelf} queueCounts={queueCounts} activeUnits={activeUnits} masteredSelectedCount={masteredSelectedLessonIds.size} dailyGoal={state.dailyGoal} practiceMode={state.practiceMode} activePreset={activePreset} missMode={state.missMode} enabledActivityTypes={state.enabledActivityTypes} activityCounts={activityCounts} selectedCardCount={selectedCardCount} readyCardCount={readyCardCount} onStart={() => startSession()} notice={notice} onChooseCurriculum={() => setScreen('curriculum')} onActivityTypesChange={updateActivityTypes} onPresetChange={updatePreset} />
  }

  const showTabs = screen !== 'quiz' && !(screen === 'results' && results)
  return (
    <div className={`app-shell ${viewMode === 'presentation' && screen === 'quiz' ? 'is-presentation' : ''}`}>
      <div className="app-view" inert={menuOpen}>
        <a className="skip-link" href="#main-content">Skip to practice</a>
        <main id="main-content" className="app-content" tabIndex={-1}>{renderScreen()}</main>
        {showTabs && <TabBar screen={screen} onNavigate={navigate} />}
      </div>
      {menuOpen && <MenuSheet dailyGoal={state.dailyGoal} missMode={state.missMode} correctAdvanceMode={state.correctAdvanceMode} onDailyGoalChange={updateDailyGoal} onMissModeChange={updateMissMode} onCorrectAdvanceModeChange={updateCorrectAdvanceMode} closing={menuClosing} onClose={closeMenu} />}
    </div>
  )
}
