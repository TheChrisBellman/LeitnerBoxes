import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { curriculumById, curriculumUnits, type CurriculumUnit, type Level } from './data/curriculum'
import { allExercises } from './data/pilot-exercises'
import { allCards, allTargets } from './data/words'
import { ACTIVITY_TYPES, type ActivityType, type PracticeTarget } from './data/types'
import {
  BOXES,
  activityAvailability,
  buildSessionQuestions,
  dateKey,
  getMasteredLessonIds,
  getQueueCounts,
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
import { clearStoredState, completeStreak, defaultState, loadState, saveState, type CorrectAdvanceMode, type StoredState, type Theme } from './storage'

type Screen = 'today' | 'curriculum' | 'quiz' | 'results'
type ViewMode = 'normal' | 'presentation'
type IconName = 'menu' | 'close' | 'settings' | 'expand' | 'minimize' | 'arrow' | 'arrowLeft' | 'check' | 'chevron' | 'calendar' | 'book' | 'progress' | 'practice' | 'spark' | 'clock' | 'cards'

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

type ShelfMotion = {
  from: Box
  to: Box
  token: number
}

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
  { type: 'vocabulary', label: 'Vocabulary', description: 'Match French words and meanings.' },
  { type: 'conjugation', label: 'Conjugation', description: 'Present-tense form recall.' },
  { type: 'best-response', label: 'Best response', description: 'Choose the most useful workplace reply.' },
  { type: 'contextual-cloze', label: 'Fill in the blank', description: 'Complete a sentence in context.' },
  { type: 'ordered', label: 'Tap to order', description: 'Build a French phrase from word tiles.' },
  { type: 'correction', label: 'Spot the mistake', description: 'Find the part that needs correction.' },
  { type: 'reading', label: 'Reading', description: 'Read a passage and answer questions.' },
  { type: 'transformation', label: 'Rephrase it', description: 'Choose an equivalent expression.' },
  { type: 'scenario', label: 'Scenario', description: 'Choose the next workplace action.' },
  { type: 'typed', label: 'Spelling & typing', description: 'Type and spell the French answer.' },
]

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

function activityTypeForQuestion(question: PracticeQuestion): ActivityType {
  if (question.exercise) return question.exercise.kind
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
  light: '#f7f6f2',
  dark: '#111214',
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
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={iconPaths[name]} />
    </svg>
  )
}

function choicesFor(question: PracticeQuestion): string[] {
  if (question.exercise?.kind === 'correction') {
    return [...question.exercise.segments.map((segment) => segment.id), ...(question.exercise.allowNoCorrection ? ['none'] : [])]
  }
  return question.format === 'choice' || question.format === 'cloze'
    ? shuffle([question.answer, ...question.distractors])
    : []
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

function practiceModeLabel(mode: PracticeMode): string {
  return mode === 'vocabulary' ? 'Vocabulary only' : mode === 'conjugation' ? 'Conjugation only' : 'Mixed practice'
}

function cardMatchesMode(card: PracticeTarget, mode: PracticeMode, enabledActivityTypes?: readonly ActivityType[]): boolean {
  const modeMatches = card.kind === 'exercise' ? mode === 'mixed' : mode === 'mixed' || card.kind === mode
  return modeMatches && matchesActivityTypes(card, enabledActivityTypes)
}

function levelForLesson(lessonId: string): CurriculumUnit | undefined {
  return curriculumById.get(lessonId)
}

function answerDisplayFor(question: PracticeQuestion, value = question.answer): string {
  if (value === question.answer && question.answerDisplay) return question.answerDisplay
  if (value === question.answer && question.card.kind === 'conjugation') return question.card.answer
  return question.choiceLabels?.[value] ?? value
}

function exerciseLabel(question: PracticeQuestion): string | undefined {
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

function ExerciseContext({ question }: { question: PracticeQuestion }) {
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

function groupLabel(group: string): string {
  return group.replace('objectifs', 'objectives')
}

function ActiveCurriculumLabel({ units }: { units: CurriculumUnit[] }) {
  if (units.length === 0) return <span>No curriculum selected</span>
  return (
    <>
      <span lang="fr">{units[0].title}</span>
      {units.length > 1 && <span> + {units.length - 1} more</span>}
    </>
  )
}

function MobileHeader({ onMenu, menuOpen, triggerRef, screen, onNavigate }: { onMenu: () => void; menuOpen: boolean; triggerRef: { current: HTMLButtonElement | null }; screen: Screen; onNavigate: (next: Screen) => void }) {
  const practiceActive = screen === 'today' || screen === 'quiz'
  return (
    <header className="mobile-header">
      <button type="button" className="brand-name" aria-label="Workplace French — Practice" onClick={() => onNavigate('today')}>Workplace French</button>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <button type="button" className={practiceActive ? 'is-active' : ''} aria-current={practiceActive ? 'page' : undefined} onClick={() => onNavigate('today')}>Practice</button>
        <button type="button" className={screen === 'curriculum' ? 'is-active' : ''} aria-current={screen === 'curriculum' ? 'page' : undefined} onClick={() => onNavigate('curriculum')}>Curriculum</button>
        <button type="button" className={screen === 'results' ? 'is-active' : ''} aria-current={screen === 'results' ? 'page' : undefined} onClick={() => onNavigate('results')}>Progress</button>
      </nav>
      <button ref={triggerRef} type="button" className="menu-button" onClick={onMenu} aria-label="Open menu" aria-haspopup="dialog" aria-expanded={menuOpen} aria-controls="app-menu">
        <Icon name="menu" size={20} />
        <span className="menu-button-label">Menu</span>
      </button>
    </header>
  )
}

function MenuSheet({
  screen,
  dailyGoal,
  missMode,
  correctAdvanceMode,
  theme,
  onDailyGoalChange,
  onMissModeChange,
  onCorrectAdvanceModeChange,
  onThemeChange,
  onResetLocalData,
  onNavigate,
  closing,
  onClose,
}: {
  screen: Screen
  dailyGoal: number
  missMode: MissMode
  correctAdvanceMode: CorrectAdvanceMode
  theme: Theme
  onDailyGoalChange: (value: number) => void
  onMissModeChange: (value: MissMode) => void
  onCorrectAdvanceModeChange: (value: CorrectAdvanceMode) => void
  onThemeChange: (value: Theme) => void
  onResetLocalData: () => void
  onNavigate: (next: Screen) => void
  closing: boolean
  onClose: () => void
}) {
  const practiceActive = screen === 'today' || screen === 'quiz'
  return (
    <>
      <button type="button" className={`menu-backdrop ${closing ? 'is-closing' : ''}`} onClick={onClose} aria-label="Close menu" />
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
          <h2 id="menu-title">Menu</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close menu" autoFocus>
            <Icon name="close" size={20} />
          </button>
        </div>
        <section className="menu-group" aria-labelledby="menu-navigation-heading">
          <h3 id="menu-navigation-heading">Navigate</h3>
          <nav className="menu-links" aria-label="App sections">
            <button type="button" className={practiceActive ? 'is-active' : ''} aria-current={practiceActive ? 'page' : undefined} onClick={() => onNavigate('today')}><strong>Practice</strong></button>
            <button type="button" className={screen === 'curriculum' ? 'is-active' : ''} aria-current={screen === 'curriculum' ? 'page' : undefined} onClick={() => onNavigate('curriculum')}><strong>Curriculum</strong></button>
            <button type="button" className={screen === 'results' ? 'is-active' : ''} aria-current={screen === 'results' ? 'page' : undefined} onClick={() => onNavigate('results')}><strong>Progress</strong></button>
          </nav>
        </section>
        <section className="menu-group" aria-labelledby="menu-practice-heading">
          <h3 id="menu-practice-heading">Session options</h3>
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
        </section>
        <section className="menu-group" aria-labelledby="menu-appearance-heading">
          <h3 id="menu-appearance-heading">Appearance</h3>
          <div className="menu-setting menu-theme-setting">
            <span className="menu-setting-label">Theme</span>
            <label className="theme-switch">
              <span className="theme-switch-label">Dark mode</span>
              <input type="checkbox" role="switch" aria-label="Dark mode" aria-checked={theme === 'dark'} checked={theme === 'dark'} onChange={(event) => onThemeChange(event.target.checked ? 'dark' : 'light')} />
              <span className="switch-track" aria-hidden="true"><span className="switch-thumb" /></span>
            </label>
          </div>
        </section>
        <section className="menu-group menu-data-group" aria-labelledby="menu-data-heading">
          <h3 id="menu-data-heading">This browser</h3>
          <div className="menu-data-controls">
            <button type="button" className="button menu-reset-button" onClick={onResetLocalData}>Reset all local data</button>
            <p>Erases progress, streak, curriculum selection, and preferences from this browser.</p>
          </div>
          <p className="menu-disclaimer">Unofficial companion. Vocabulary cards use selected curriculum terms and glosses from public PFL2 PDFs; other activities are independently authored. Progress stays in this browser.</p>
          <p className="menu-last-updated"><time dateTime="2026-08-27">Last updated: 27 August 2026</time></p>
        </section>
      </aside>
    </>
  )
}

function ScreenHeader({ title, description, onBack }: { title: string; description: string; onBack?: () => void }) {
  return (
    <div className="screen-header">
      {onBack && <button type="button" className="back-button" onClick={onBack}><Icon name="arrowLeft" size={17} /> Back to practice</button>}
      <h1 tabIndex={-1}>{title}</h1>
      <p>{description}</p>
    </div>
  )
}

function StatBlock({ icon, value, label, accent = '' }: { icon: IconName; value: string | number; label: string; accent?: string }) {
  return (
    <div className={`stat-block ${accent}`}>
      <span className="stat-icon"><Icon name={icon} size={18} /></span>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function MemoryShelf({ counts, motion, showHint = true }: { counts: Record<Box, number>; motion?: ShelfMotion | null; showHint?: boolean }) {
  return (
    <section className="memory-shelf" aria-label="Five-box memory shelf">
      <div className="shelf-heading">
        <h2>Memory shelf</h2>
        {showHint && <p>Right answers move cards forward.</p>}
      </div>
      <div className="shelf-compartments">
        {BOXES.map((box) => {
          const count = counts[box]
          const isTarget = motion?.to === box
          const isSource = motion?.from === box && motion.to !== box
          return (
            <div className={`shelf-compartment ${isTarget ? 'is-target' : ''} ${isSource ? 'is-source' : ''}`} key={box}>
              <div className="compartment-copy">
                <span className="compartment-label">Box {box}</span>
                <strong aria-label={`${count} ${count === 1 ? 'card' : 'cards'}`}>{count}</strong>
                <span className="compartment-unit">{count === 1 ? 'card' : 'cards'}</span>
              </div>
              <div className="compartment-meter">
                <span className="compartment-cadence">{box === 1 ? 'New' : box === 2 ? '1-day review' : box === 3 ? '2-day review' : box === 4 ? '4-day review' : '14+ day review'}</span>
              </div>
              {isTarget && <span className="shelf-arrow" aria-hidden="true"><Icon name="arrow" size={15} /></span>}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function TodayScreen({
  counts,
  queueCounts,
  activeUnits,
  masteredSelectedCount,
  dailyGoal,
  practiceMode,
  missMode,
  enabledActivityTypes,
  activityCounts,
  selectedCardCount,
  readyCardCount,
  onStart,
  notice,
  motion,
  onChooseCurriculum,
  onActivityTypesChange,
}: {
  counts: Record<Box, number>
  queueCounts: ReturnType<typeof getQueueCounts>
  activeUnits: CurriculumUnit[]
  masteredSelectedCount: number
  dailyGoal: number
  practiceMode: PracticeMode
  missMode: MissMode
  enabledActivityTypes: readonly ActivityType[]
  activityCounts: Record<ActivityType, number>
  selectedCardCount: number
  readyCardCount: number
  onStart: () => void
  notice: string | null
  motion: ShelfMotion | null
  onChooseCurriculum: () => void
  onActivityTypesChange: (value: ActivityType[]) => void
}) {
  const actionPanelRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const panel = actionPanelRef.current
    if (!panel) return undefined
    const updateHeight = () => document.documentElement.style.setProperty('--mobile-cta-height', `${panel.getBoundingClientRect().height}px`)
    updateHeight()
    if (typeof ResizeObserver === 'undefined') return () => document.documentElement.style.removeProperty('--mobile-cta-height')
    const observer = new ResizeObserver(updateHeight)
    observer.observe(panel)
    return () => {
      observer.disconnect()
      document.documentElement.style.removeProperty('--mobile-cta-height')
    }
  }, [])

  const dueCount = queueCounts.overdue + queueCounts.due
  const sessionSize = readyCardCount
  const hasCards = readyCardCount > 0
  const hasFutureCards = queueCounts.future > 0
  const modeDescription = practiceMode === 'conjugation' ? 'conjugation cards' : practiceMode === 'vocabulary' ? 'vocabulary cards' : 'cards'
  const missDescription = missMode === 'step-back' ? 'Missed cards step back one box.' : 'Missed cards return to Box 1.'
  const masteredOnly = activeUnits.length === 0 && masteredSelectedCount > 0
  const selectedUnitCount = activeUnits.length + masteredSelectedCount
  return (
    <section className="page today-page">
      <header className="today-header">
        <div>
          <span className="today-kicker">Practice tool</span>
          <h1 tabIndex={-1}>Choose and practice.</h1>
        </div>
        <div className="today-summary" aria-label="Practice queue summary">
          <span><strong>{dueCount}</strong> due</span><span className="summary-divider" aria-hidden="true" /><span><strong>{queueCounts.newCards}</strong> new</span>
        </div>
      </header>
      <section className="today-focus-panel">
        <div className="today-study-column">
          <section className="practice-setup surface-panel" aria-labelledby="practice-setup-heading">
            <div className="setup-heading">
              <span className="today-kicker">Set up your practice</span>
              <h2 id="practice-setup-heading">Pick the material and activities you want.</h2>
            </div>
            <section className="setup-section" aria-labelledby="curriculum-step-heading">
              <div className="setup-section-heading">
                <span className="setup-step" aria-hidden="true">1</span>
                <div><span className="setup-label">Curriculum</span><h3 id="curriculum-step-heading">What do you want to practice?</h3></div>
              </div>
              <button type="button" className="selection-control" onClick={onChooseCurriculum}>
                <span className="selection-control-copy">
                  <strong>{selectedUnitCount > 0 ? <ActiveCurriculumLabel units={activeUnits} /> : 'Choose curriculum'}</strong>
                  <small>{selectedUnitCount > 0 ? `${selectedUnitCount} unit${selectedUnitCount === 1 ? '' : 's'} selected` : 'Select one or more units'}</small>
                </span>
                <Icon name="arrow" size={17} />
              </button>
            </section>
            <fieldset className="setup-section home-activity-picker" disabled={selectedUnitCount === 0}>
              <legend className="setup-section-heading">
                <span className="setup-step" aria-hidden="true">2</span>
                <span><span className="setup-label">Activities</span><span className="setup-legend-title">How do you want to practice?</span></span>
              </legend>
              <p className="setup-helper">{selectedUnitCount === 0 ? 'Choose curriculum first to see the activities available.' : 'Choose one or more. Unavailable activities will unlock when you add curriculum that supports them.'}</p>
              <div className="home-activity-options">
                {activityOptions.map(({ type, label, description }) => {
                  const checked = enabledActivityTypes.includes(type)
                  const available = activityCounts[type]
                  const unavailable = available === 0
                  return (
                    <label className={`activity-option home-activity-option ${checked ? 'is-selected' : ''} ${unavailable ? 'is-unavailable' : ''}`} aria-disabled={unavailable && !checked} key={type}>
                      <input type="checkbox" aria-label={label} checked={checked} disabled={(unavailable && !checked) || (checked && enabledActivityTypes.length === 1)} onChange={() => onActivityTypesChange(checked ? enabledActivityTypes.filter((item) => item !== type) : [...enabledActivityTypes, type])} />
                      <span className="custom-check" aria-hidden="true"><Icon name="check" size={13} /></span>
                      <span className="activity-option-copy"><strong>{label}</strong><small>{description}</small></span>
                      <span className="activity-option-count" aria-label={`${available} available`}>{available}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          </section>
          <MemoryShelf counts={counts} motion={motion} showHint={false} />
          <div className="today-disclosures">
            <details className="context-disclosure">
              <summary><span>How it works</span><Icon name="chevron" size={16} /></summary>
              <p>The Leitner system keeps every card in one of five boxes. Correct answers move it forward and schedule it farther into the future, so familiar cards appear less often. {missDescription}</p>
              <p>This tool brings cards back when they are due, adds new practice items when there is room, and saves each card’s place in this browser.</p>
            </details>
            <details className="context-disclosure">
              <summary><span>Session details</span><Icon name="chevron" size={16} /></summary>
              <p>Selected curriculum: {activeUnits.length > 0 ? <ActiveCurriculumLabel units={activeUnits} /> : masteredOnly ? `${masteredSelectedCount} mastered unit${masteredSelectedCount === 1 ? '' : 's'} on refresh` : 'No curriculum selected'}. Mode: {practiceModeLabel(practiceMode)}. Session limit: up to {dailyGoal} cards.</p>
              <p>Due cards come first, then new cards fill any open spots. A session may be shorter when fewer cards are ready.</p>
            </details>
          </div>
          {notice && <p className="inline-notice today-message" role="alert">{notice}</p>}
          {!hasCards && !notice && activeUnits.length > 0 && <p className="quiet-note today-message">{selectedCardCount === 0 ? `No ${modeDescription} are authored for the selected units yet. Switch practice mode or choose A-01–A-03.` : hasFutureCards ? 'No cards are due right now. Come back when the next review is ready.' : 'No cards are available right now.'}</p>}
          {!hasCards && !notice && masteredOnly && <p className="quiet-note today-message">Mastered objectives return for occasional refreshes. {hasFutureCards ? 'The next refresh is scheduled.' : 'No refresh is due right now.'}</p>}
          {activeUnits.length === 0 && !masteredOnly && <p className="empty-guidance today-message">Choose at least one curriculum unit above.</p>}
          {activeUnits.length > 0 && selectedCardCount === 0 && <p className="empty-guidance today-message">Choose an available activity or add another curriculum unit.</p>}
        </div>
        <section ref={actionPanelRef} className="next-card-panel">
          <div className="next-card-copy">
            <span className="focus-kicker">Start practicing</span>
            <h2>{masteredOnly ? hasCards ? `${sessionSize} refresh item${sessionSize === 1 ? '' : 's'} ready` : 'All caught up' : activeUnits.length === 0 ? 'Choose your curriculum.' : selectedCardCount === 0 ? `No ${modeDescription} here yet` : hasCards ? `${sessionSize} practice item${sessionSize === 1 ? '' : 's'} ready` : 'All caught up'}</h2>
            {hasCards && <p>{enabledActivityTypes.length} activit{enabledActivityTypes.length === 1 ? 'y' : 'ies'} selected · up to {dailyGoal} items</p>}
          </div>
          <button type="button" className="button button-primary button-large" onClick={activeUnits.length === 0 && !masteredOnly ? onChooseCurriculum : onStart} disabled={!hasCards && (activeUnits.length > 0 || masteredOnly)}>
            {hasCards ? 'Start practice' : masteredOnly ? 'All caught up' : activeUnits.length === 0 ? 'Choose curriculum' : 'No practice ready'}
            {(hasCards || activeUnits.length === 0) && <Icon name="arrow" size={17} />}
          </button>
        </section>
      </section>
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
  const [expandedLevels, setExpandedLevels] = useState<Record<Level, boolean>>({ A: true, B: false, C: false })
  const selected = new Set(selectedIds)

  return (
    <section className="page curriculum-page">
      <ScreenHeader title="Choose curriculum" description="Pick one or more units. This only controls which material appears when you practice." onBack={onBack} />
      <div className="selection-summary surface-panel">
        <span className="screen-kicker">Your curriculum</span>
        <strong className="selection-total">{selectedIds.length + masteredSelectedCount}</strong>
        <span className="selection-label">unit{selectedIds.length + masteredSelectedCount === 1 ? '' : 's'} selected</span>
        <p>{selectedCardCount} practice item{selectedCardCount === 1 ? '' : 's'} available · {practiceModeLabel(practiceMode)}</p>
        <button type="button" className="button button-primary button-full" onClick={onBack} disabled={selectedIds.length === 0 && masteredSelectedCount === 0}>Use this curriculum <Icon name="arrow" size={16} /></button>
      </div>
      <div className="curriculum-list">
        {(['A', 'B', 'C'] as Level[]).map((level) => {
          const units = curriculumUnits.filter((unit) => unit.level === level)
          const groups = [...new Set(units.map((unit) => unit.group))]
          const selectableUnits = units.filter((unit) => !masteredIds.has(unit.id))
          const selectedInLevel = selectableUnits.filter((unit) => selected.has(unit.id)).length
          const allLevelMastered = selectableUnits.length === 0
          const expanded = expandedLevels[level]
          return (
            <section className="level-section" key={level}>
              <button type="button" className="level-header" onClick={() => setExpandedLevels((current) => ({ ...current, [level]: !current[level] }))} aria-expanded={expanded}>
                <span className={`level-badge level-${level.toLowerCase()}`}>{level}</span>
                <span className="level-header-copy"><strong>Level {level} · {levelNames[level]}</strong><small>{levelDescriptions[level]} · {allLevelMastered ? 'All mastered' : `${selectedInLevel} / ${selectableUnits.length} selected`}</small></span>
                <Icon name="chevron" size={18} />
              </button>
              <div className={`level-body ${expanded ? 'is-expanded' : ''}`} aria-hidden={!expanded} inert={!expanded}>
                <div className="level-body-inner">
                  <div className="level-actions">
                    <span>{allLevelMastered ? 'Every unit is mastered.' : selectedInLevel === selectableUnits.length ? 'Every available unit is active.' : 'Select the whole level'}</span>
                    <button type="button" className="text-button" onClick={() => onToggleLevel(level)} disabled={allLevelMastered} aria-pressed={!allLevelMastered && selectedInLevel === selectableUnits.length}>{allLevelMastered ? 'All mastered' : selectedInLevel === selectableUnits.length ? 'Deselect all' : 'Select all'}</button>
                  </div>
                  {groups.map((group) => {
                    const groupUnits = units.filter((unit) => unit.group === group)
                    const selectableGroupUnits = groupUnits.filter((unit) => !masteredIds.has(unit.id))
                    const allGroupMastered = selectableGroupUnits.length === 0
                    return (
                      <div className="unit-group" key={group}>
                        <div className="unit-group-heading">
                          <span>{groupLabel(group)}</span>
                          {allGroupMastered && <span>All mastered</span>}
                        </div>
                        <div className="unit-options">
                          {groupUnits.map((unit) => {
                            const mastered = masteredIds.has(unit.id)
                            const inputId = `curriculum-${unit.id}`
                            return (
                              <div className={`unit-option ${selected.has(unit.id) ? 'is-selected' : ''} ${mastered ? 'is-mastered' : ''}`} key={unit.id}>
                                <label className="unit-selection" htmlFor={inputId}>
                                  <input id={inputId} type="checkbox" checked={selected.has(unit.id)} disabled={mastered} onChange={() => onToggleLesson(unit.id)} />
                                  <span className="custom-check" aria-hidden="true"><Icon name="check" size={13} /></span>
                                  <span className="unit-copy"><strong lang="fr">{unit.title}</strong><small>{unit.id.toUpperCase()}{mastered ? ' · Mastered · occasional refresh' : ''}</small></span>
                                </label>
                                <span className="unit-count">{mastered ? 'Mastered' : unitCardCounts[unit.id] ?? 0}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )
        })}
      </div>
      <div className="taxonomy-note"><Icon name="book" size={18} /><p><strong>Unofficial companion.</strong> Unit names follow the archived Government of Canada PFL2 taxonomy, and the vocabulary terms and glosses come from its public PDFs. This app is not affiliated with or endorsed by the Government of Canada.</p></div>
    </section>
  )
}

function BoxJourney({ feedback }: { feedback: Feedback }) {
  const distance = Math.abs(feedback.nextBox - feedback.previousBox)
  const direction = feedback.nextBox > feedback.previousBox ? 'forward' : feedback.nextBox < feedback.previousBox ? 'back' : 'same'
  const fromStep = feedback.previousBox - 1
  const toStep = feedback.nextBox - 1
  const journeyStyle = {
    '--journey-from': `calc(${fromStep * 100}% + ${fromStep * 6}px)`,
    '--journey-to': `calc(${toStep * 100}% + ${toStep * 6}px)`,
  } as CSSProperties
  const movementLabel = direction === 'same'
    ? `Card stays in Box ${feedback.nextBox}`
    : `Card moves ${direction} from Box ${feedback.previousBox} to Box ${feedback.nextBox}`

  return (
    <div className={`box-journey is-${feedback.correct ? 'correct' : 'incorrect'} is-${direction} ${distance > 1 ? 'is-long' : ''}`} style={journeyStyle} role="img" aria-label={movementLabel}>
      <div className="box-journey-track" aria-hidden="true">
        {BOXES.map((box) => (
          <div className={`journey-box ${box === feedback.previousBox ? 'is-source' : ''} ${box === feedback.nextBox ? 'is-target' : ''}`} key={box}>
            <span>Box</span>
            <strong>{box}</strong>
          </div>
        ))}
        <div className="journey-card-wrap"><span className="journey-card"><i /><i /></span></div>
      </div>
      <span className="box-journey-label">Box {feedback.previousBox} <span aria-hidden="true">→</span> Box {feedback.nextBox}</span>
    </div>
  )
}

function SuccessOverlay({
  question,
  feedback,
  index,
  total,
  advanceMode,
  onContinue,
}: {
  question: ActiveQuestion
  feedback: Feedback
  index: number
  total: number
  advanceMode: CorrectAdvanceMode
  onContinue: () => void
}) {
  const actionRef = useRef<HTMLButtonElement>(null)
  const continueRef = useRef(onContinue)
  const shouldAutoAdvance = feedback.stage === 'first' && advanceMode === 'automatic'
  const autoAdvanceDelay = question.exercise?.kind === 'correction' ? CORRECTION_AUTO_ADVANCE_MS : CORRECT_AUTO_ADVANCE_MS
  const fullAnswer = answerDisplayFor(question, feedback.answer)
  const movement = feedback.stage === 'repair'
    ? 'This retry is practice; the shelf changes only on the original answer.'
    : feedback.previousBox === feedback.nextBox ? `Stay in Box ${feedback.nextBox}.` : `Move to Box ${feedback.nextBox}.`
  const title = feedback.stage === 'repair' ? 'Correct on retry' : 'Correct'

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
  }, [autoAdvanceDelay, question.card.id, shouldAutoAdvance])

  return (
    <div className="success-overlay">
      <div className="success-panel" role={shouldAutoAdvance ? undefined : 'dialog'} aria-modal={shouldAutoAdvance ? undefined : true} aria-labelledby={shouldAutoAdvance ? undefined : 'success-title'}>
        <div className="success-mark" aria-hidden="true"><Icon name="check" size={56} /></div>
        {feedback.stage === 'first' && <BoxJourney feedback={feedback} />}
        <div className="success-copy" role="status" aria-live="polite" aria-labelledby="success-title" aria-atomic="true">
          <strong id="success-title">{title}</strong>
          <span className="success-answer" lang={question.answerLanguage}>{fullAnswer}</span>
          {(question.exercise?.feedback ?? question.answerExplanation) && <span className="success-explanation">{question.exercise?.feedback ?? question.answerExplanation}</span>}
          <span className="success-movement">{movement}</span>
          {shouldAutoAdvance && <span className="success-next">Next card…</span>}
        </div>
        {!shouldAutoAdvance && <button ref={actionRef} type="button" className="button button-primary success-next-button" onClick={onContinue}>{index + 1 === total ? 'Results' : 'Next'} <Icon name="arrow" size={15} /></button>}
      </div>
    </div>
  )
}

function FeedbackPanel({
  question,
  feedback,
  index,
  total,
  onStartRepair,
  onContinue,
}: {
  question: ActiveQuestion
  feedback: Feedback
  index: number
  total: number
  onStartRepair: () => void
  onContinue: () => void
}) {
  const actionRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    actionRef.current?.focus()
  }, [feedback.correct, feedback.stage])

  const fullAnswer = answerDisplayFor(question, feedback.answer)
  const selectedAnswer = answerDisplayFor(question, feedback.selectedChoice)
  const authoredExplanation = question.exercise?.feedback ?? question.answerExplanation
  const fallbackExplanation = question.format === 'typed'
    ? feedback.correct ? 'You recalled the answer without choices.' : 'Check the spelling, then type the answer again.'
    : question.format === 'arrange'
      ? feedback.correct ? 'You built the French answer in the correct order.' : 'Review the word order, then build it again.'
      : question.format === 'correction'
        ? feedback.correct ? 'You identified the segment that needs attention.' : 'Review the marked segments and choose the one that needs attention.'
        : question.format === 'cloze'
          ? feedback.correct ? 'You chose the form that completes the sentence.' : `The blank needs the ${question.card.kind === 'conjugation' ? question.card.person : 'matching'} form.`
          : question.card.kind === 'conjugation'
            ? feedback.correct ? `You matched the ${question.card.person} form.` : `The prompt asks for ${question.card.person}.`
            : question.direction === 'english-to-french'
              ? 'You matched the English meaning to its French form.'
              : 'You matched the French phrase to its English meaning.'
  const explanation = !feedback.correct && feedback.stage === 'first'
    ? question.exercise ? 'Use the context and try again; the explanation appears after your retry.' : fallbackExplanation
    : authoredExplanation ?? fallbackExplanation
  const retryNote = question.format === 'typed'
    ? 'Type it again without looking at the correction.'
    : question.format === 'arrange'
      ? 'Build it again without looking at the correction.'
      : 'Take another shot — the choices are waiting for you.'
  const movement = feedback.stage === 'first'
    ? feedback.correct
      ? feedback.previousBox === feedback.nextBox ? `Stay in Box ${feedback.nextBox}.` : `Move to Box ${feedback.nextBox}.`
      : 'You get one more try before moving on.'
    : 'This retry is practice; the shelf changes only on the original answer.'
  const title = feedback.stage === 'repair'
    ? feedback.correct ? 'Correct on retry' : 'Still not quite'
    : feedback.correct ? 'Correct' : 'Not quite'

  return (
    <div className={`feedback-panel ${feedback.correct ? 'is-correct' : 'is-incorrect'} ${feedback.stage === 'repair' && !feedback.correct ? 'is-repair' : ''}`}>
      {feedback.stage === 'first' && <BoxJourney feedback={feedback} />}
      <div className="feedback-mark" aria-hidden="true"><Icon name={feedback.correct ? 'check' : 'close'} size={30} /></div>
      <div className="feedback-copy" role={feedback.correct ? 'status' : 'alert'} aria-live={feedback.correct ? 'polite' : 'assertive'} aria-labelledby="feedback-title" aria-atomic="true">
        <strong id="feedback-title">{title}</strong>
        {feedback.stage === 'repair' && !feedback.correct && <div className="feedback-comparison">
          <div><span>You chose</span><strong lang={question.answerLanguage}>{selectedAnswer}</strong></div>
          <div><span>Correct</span><strong lang={question.answerLanguage}>{fullAnswer}</strong></div>
        </div>}
        {feedback.correct && <span className="feedback-answer" lang={question.answerLanguage}>{fullAnswer}</span>}
        {feedback.stage === 'first' && !feedback.correct && <span className="feedback-retry-note">{retryNote}</span>}
        <span className="feedback-explanation">{explanation}</span>
        <span className="feedback-movement">{movement}</span>
      </div>
      {!feedback.correct && feedback.stage === 'first'
        ? <button ref={actionRef} type="button" className="button button-primary feedback-next" onClick={onStartRepair}>Try again</button>
        : <button ref={actionRef} type="button" className="button button-primary feedback-next" onClick={onContinue}>{index + 1 === total ? 'Results' : 'Next'} <Icon name="arrow" size={15} /></button>}
    </div>
  )
}

function QuizScreen({
  question,
  unit,
  currentBox,
  index,
  total,
  feedback,
  repairing,
  onAnswer,
  onStartRepair,
  onContinue,
  onSkip,
  onExit,
  onMenu,
  menuOpen,
  menuTriggerRef,
  viewMode,
  onTogglePresentation,
}: {
  question: ActiveQuestion
  unit?: CurriculumUnit
  currentBox: Box
  index: number
  total: number
  feedback: Feedback | null
  repairing: boolean
  onAnswer: (choice: string) => void
  onStartRepair: () => void
  onContinue: () => void
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
  const [phraseHelpOpen, setPhraseHelpOpen] = useState(false)

  useEffect(() => {
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

  const questionLabel = exerciseLabel(question) ?? (question.vocabularyPractice === 'recognition'
    ? 'Vocabulary · Recognition'
    : question.format === 'typed'
      ? question.kind === 'conjugation' ? 'Conjugation · Typed recall' : 'Vocabulary · Typed recall'
      : question.format === 'arrange'
        ? 'Vocabulary · Build the answer'
        : question.format === 'cloze'
          ? 'Conjugation · Fill the blank'
          : question.direction === 'english-to-french'
            ? 'Vocabulary · English → French'
            : 'Vocabulary · French → English')
  const questionInstruction = question.vocabularyPractice === 'recognition'
    ? 'Choose the example or form that matches the term.'
    : question.exercise?.kind === 'correction'
      ? 'Read the full text, then choose the underlined part that contains the error.'
    : question.exercise?.kind === 'reading'
      ? 'Read the passage, then choose the best answer.'
      : question.exercise?.kind === 'scenario'
        ? 'What should you say next?'
        : question.exercise?.kind === 'best-response'
          ? 'Choose the most appropriate response.'
            : question.exercise?.kind === 'transformation'
            ? 'Choose the best reformulation.'
            : question.exercise?.kind === 'contextual-cloze'
              ? 'Try each option in the blank. Choose the one that makes the French sentence complete.'
              : question.exercise?.kind === 'ordered'
                ? 'Tap the words to build the directive.'
                : question.format === 'typed'
                  ? question.kind === 'conjugation' ? 'Type the present-tense form. This answer needs no accents.' : 'Type the French answer. Use the accent buttons if needed.'
                  : question.format === 'arrange'
                    ? 'Tap the words to build the French answer.'
                    : question.format === 'cloze'
                      ? 'Choose the present-tense form that completes the sentence.'
                      : question.direction === 'english-to-french'
                        ? 'How do you say this in French?'
                        : 'What does it mean in English?'
  const answerGroupLabel = question.vocabularyPractice === 'recognition'
    ? 'Choose the matching example'
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
    if (remainingTokenIndexes.length === 0 && !feedback) onAnswer(arrangedAnswer)
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

  return (
    <section className="page quiz-page">
      <div className={`quiz-topline ${viewMode === 'presentation' ? 'is-presentation' : ''}`}>
        <button type="button" className="back-button" onClick={onExit}><Icon name="arrowLeft" size={17} /> Back to practice</button>
        <div className="quiz-context">
          <span>Level {unit?.level ?? question.card.level}</span>
          {unit && <span>{unit.id.toUpperCase()}</span>}
          <span className="quiz-progress-label">Card {index + 1} of {total}</span>
          <progress className="quiz-progress-bar" max={total} value={index + 1} aria-label={`Session progress: card ${index + 1} of ${total}`} />
        </div>
        <div className="quiz-topline-actions">
          <button type="button" className="presentation-button" onClick={onTogglePresentation} aria-pressed={viewMode === 'presentation'} aria-label={viewMode === 'presentation' ? 'Exit presentation mode' : 'Enter presentation mode'}>
            <Icon name={viewMode === 'presentation' ? 'minimize' : 'expand'} size={17} />
            <span>{viewMode === 'presentation' ? 'Exit presentation' : 'Present'}</span>
          </button>
          {viewMode !== 'presentation' && <button ref={menuTriggerRef} type="button" className="menu-button quiz-settings-button" onClick={onMenu} aria-label="Open settings" aria-haspopup="dialog" aria-expanded={menuOpen} aria-controls="app-menu">
            <Icon name="settings" size={20} />
          </button>}
        </div>
      </div>
      <ol className="quiz-box-rail" aria-label={`Memory path. Current position: Box ${currentBox}`}>
        {BOXES.map((box) => (
          <li key={box} aria-current={box === currentBox ? 'step' : undefined}>
            <span>Box</span>
            <strong>{box}</strong>
          </li>
        ))}
      </ol>
      <div className="quiz-workspace">
        <div className="quiz-prompt-column">
          <div key={question.card.id} className={`prompt-card question-type-${question.kind} exercise-format-${question.format} exercise-kind-${question.exercise?.kind ?? 'none'}`}>
            <div className="question-meta">
              <span className="question-type-label">{questionLabel}</span>
              {unit && <span className="question-unit-context"><strong>{unit.id.toUpperCase()}</strong><span lang="fr">{unit.title}</span></span>}
            </div>
            <ExerciseContext question={question} />
            <div className="prompt-copy">
              {question.exercise?.kind === 'contextual-cloze' && <span className="prompt-task-label">Complete the French sentence</span>}
              <div className={`prompt-headline ${question.kind === 'conjugation' ? 'is-conjugation' : ''}`}>
                <h1 ref={questionHeadingRef} tabIndex={-1} lang={question.promptLanguage}>{question.prompt}</h1>
                {question.card.kind === 'conjugation' && question.format !== 'cloze' && <span className="conjugation-person">{question.card.person}</span>}
              </div>
              {question.exercise?.kind !== 'scenario' && <p>{questionInstruction}</p>}
            </div>
          </div>
        </div>
        <div className="quiz-answer-column">
          {repairing && <div className="repair-prompt" role="status" aria-live="polite">
            <strong>Try it again</strong>
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
          {(question.format === 'choice' || question.format === 'cloze' || question.format === 'correction') && <div className="answer-choice-area">
            <div className="choice-list" role="group" aria-label={answerGroupLabel}>
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
                    <span className="choice-number">{feedback && isCorrect ? <Icon name="check" size={16} /> : choiceIndex + 1}</span>
                    <span lang={question.answerLanguage}>{choiceLabel}</span>
                    {feedback && isSelected && !isCorrect && <Icon name="close" size={18} />}
                  </button>
                )
              })}
            </div>
          </div>}
          {question.format === 'typed' && <div className="question-help-area">
            <form className="typed-answer-form" onSubmit={submitTypedAnswer}>
              <label htmlFor="typed-answer">Your answer</label>
              <input ref={typedInputRef} id="typed-answer" className="typed-answer-input" value={typedAnswer} onChange={(event) => setTypedAnswer(event.target.value)} onSelect={captureAccentSelection} onBlur={captureAccentSelection} lang={question.answerLanguage} inputMode="text" enterKeyHint="done" autoComplete="off" autoCapitalize="none" spellCheck={false} disabled={Boolean(feedback)} />
              <div className="accent-palette" role="group" aria-label="French accented characters">
                <span className="accent-palette-label">French accents</span>
                {FRENCH_ACCENTS.map((character) => <button key={character} type="button" className="accent-button" aria-label={`Insert ${character}`} onPointerDown={(event) => handleAccentPointerDown(event, character)} onMouseDown={handleAccentMouseDown} onClick={() => handleAccentClick(character)} disabled={Boolean(feedback)}>{character}</button>)}
              </div>
              <button type="submit" className="button button-primary" disabled={!typedAnswer.trim() || Boolean(feedback)}>Check answer</button>
            </form>
          </div>}
          {question.format === 'arrange' && <div className="question-help-area arrange-help-area">
            <div className="arrange-answer">
              <div className="arranged-sentence" aria-label="Your arranged answer" lang={question.answerLanguage}>
                {selectedTokenIndexes.length === 0 && <span>Tap words below to build the answer.</span>}
                {selectedTokenIndexes.map((tokenIndex) => <button type="button" className="word-token is-selected" key={tokenIndex} onClick={() => setSelectedTokenIndexes((current) => current.filter((indexToKeep) => indexToKeep !== tokenIndex))} disabled={Boolean(feedback)} aria-label={`Remove ${question.tokens?.[tokenIndex]}`}>{question.tokens?.[tokenIndex]}</button>)}
              </div>
              <div className="token-bank" aria-label="Available words">
                {remainingTokenIndexes.map((tokenIndex) => <button type="button" className="word-token" key={tokenIndex} onClick={() => setSelectedTokenIndexes((current) => [...current, tokenIndex])} disabled={Boolean(feedback)}>{question.tokens?.[tokenIndex]}</button>)}
              </div>
              <button type="button" className="button button-primary arrange-check" onClick={submitArrangedAnswer} disabled={remainingTokenIndexes.length > 0 || Boolean(feedback)}>Check answer</button>
            </div>
          </div>}
          {!feedback && !repairing && <div className="quiz-support-actions">
            <div className="skip-action">
              <button type="button" className="button button-secondary skip-button" onClick={onSkip}>Skip for now</button>
              <span>No penalty. This item stays in your pile.</span>
            </div>
            {answerHint && answerHintId && <AnswerHintPopover hint={answerHint} id={answerHintId} open={phraseHelpOpen} onToggle={() => setPhraseHelpOpen((open) => !open)} />}
          </div>}
          {feedback && !feedback.correct && <FeedbackPanel question={question} feedback={feedback} index={index} total={total} onStartRepair={onStartRepair} onContinue={onContinue} />}
        </div>
      </div>
    </section>
  )
}

function ProgressionOverviewScreen({ state, shelf, activeUnits, onToday, onCurriculum }: { state: StoredState; shelf: Record<Box, number>; activeUnits: CurriculumUnit[]; onToday: () => void; onCurriculum: () => void }) {
  const studiedCount = Object.keys(state.progress).length
  return (
    <section className="page results-page progress-overview-page">
      <ScreenHeader title="Your progress" description="Cards studied, current box counts, and active curriculum." onBack={onToday} />
      <div className="results-grid">
        <StatBlock icon="book" value={studiedCount} label="cards studied" accent="accent-blue" />
        <StatBlock icon="clock" value={state.streak.count} label={state.streak.count === 1 ? 'day in a row' : 'days in a row'} accent="accent-yellow" />
        <StatBlock icon="spark" value={shelf[5]} label="cards in Box 5" accent="accent-green" />
        <StatBlock icon="cards" value={activeUnits.length} label={activeUnits.length === 1 ? 'active unit' : 'active units'} accent="accent-ink" />
      </div>
      <div className="progress-summary surface-panel">
        <span className="screen-kicker">Current curriculum</span>
        <strong><ActiveCurriculumLabel units={activeUnits} /></strong>
        <p>{activeUnits.length === 0 ? 'Choose a curriculum to start a session.' : `${activeUnits.length} active unit${activeUnits.length === 1 ? '' : 's'}.`}</p>
        <div className="progress-actions"><button type="button" className="button button-primary" onClick={onToday}>Practice <Icon name="practice" size={16} /></button><button type="button" className="button button-secondary" onClick={onCurriculum}>Curriculum <Icon name="cards" size={16} /></button></div>
      </div>
      <MemoryShelf counts={shelf} />
    </section>
  )
}

function ResultsScreen({ results, shelf, hasMoreCards, onDone, onKeepGoing }: { results: SessionStats & { box5Count: number }; shelf: Record<Box, number>; hasMoreCards: boolean; onDone: () => void; onKeepGoing: () => void }) {
  const accuracy = results.total === 0 ? 0 : Math.round((results.correct / results.total) * 100)
  return (
    <section className="page results-page session-results-page">
      <ScreenHeader title="Session complete" description="First-try accuracy, repairs, skips, and shelf movement." />
      <div className="results-score surface-panel">
        <span className="screen-kicker">First-try accuracy</span>
        <strong>{accuracy}%</strong>
        <p>{results.correct} correct answer{results.correct === 1 ? '' : 's'} out of {results.total} answered item{results.total === 1 ? '' : 's'}. {results.skipped > 0 && `${results.skipped} skipped item${results.skipped === 1 ? '' : 's'} remain in your queue. `}Repairs are practice, not first-try answers.</p>
        <div className="results-actions"><button type="button" className="button button-primary" onClick={onDone}>Done <Icon name="check" size={16} /></button><button type="button" className="button button-secondary" onClick={onKeepGoing} disabled={!hasMoreCards}>{hasMoreCards ? 'Keep going' : 'All caught up'}{hasMoreCards && <Icon name="arrow" size={16} />}</button></div>
      </div>
      <div className="results-grid">
        <StatBlock icon="arrow" value={results.promotions} label="cards moved forward" accent="accent-blue" />
        <StatBlock icon="close" value={results.misses} label="missed answers" accent="accent-red" />
        <StatBlock icon="check" value={results.repairs} label="misses repaired" accent="accent-yellow" />
        <StatBlock icon="book" value={results.box5Count} label="cards in Box 5" accent="accent-green" />
      </div>
      <MemoryShelf counts={shelf} />
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
  const [sessionIndex, setSessionIndex] = useState(0)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [repairing, setRepairing] = useState(false)
  const [repairContext, setRepairContext] = useState<Feedback | null>(null)
  const [sessionStats, setSessionStats] = useState<SessionStats>({ total: 0, correct: 0, promotions: 0, misses: 0, repairs: 0, skipped: 0 })
  const [results, setResults] = useState<SessionStats & { box5Count: number } | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [shelfMotion, setShelfMotion] = useState<ShelfMotion | null>(null)
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
  const unitCardCounts = useMemo(() => allTargets.reduce<Record<string, number>>((counts, card) => {
    if (cardMatchesMode(card, state.practiceMode, state.enabledActivityTypes)) counts[card.lessonId] = (counts[card.lessonId] ?? 0) + 1
    return counts
  }, {}), [state.enabledActivityTypes, state.practiceMode])
  const selectedCardCount = useMemo(() => allTargets.filter((card) => activeLessonIds.includes(card.lessonId) && cardMatchesMode(card, state.practiceMode, state.enabledActivityTypes)).length, [activeLessonIds, state.enabledActivityTypes, state.practiceMode])
  const displayMode = screen === 'quiz' || (screen === 'results' && results) ? sessionMode : state.practiceMode
  const shelf = useMemo(() => shelfCounts(state.progress, activeLessonIds, allTargets, displayMode, state.enabledActivityTypes), [activeLessonIds, state.enabledActivityTypes, state.progress, displayMode])
  const sessionSelection = useMemo(() => {
    const selectedIds = sessionLessonIds.length > 0 ? sessionLessonIds : [...activeLessonIds, ...masteredSelectedLessonIds]
    const mastered = new Set(selectedIds.filter((id) => masteredLessonIds.has(id)))
    return { active: selectedIds.filter((id) => !mastered.has(id)), mastered }
  }, [activeLessonIds, masteredLessonIds, masteredSelectedLessonIds, sessionLessonIds])
  const sessionQueueCounts = useMemo(() => getQueueCounts(allTargets, state.progress, sessionSelection.active, today, sessionMode, sessionActivityTypes, sessionSelection.mastered), [sessionActivityTypes, sessionMode, sessionSelection, state.progress, today])
  const sessionShelf = useMemo(() => shelfCounts(state.progress, focusedSession && sessionLessonIds.length > 0 ? sessionLessonIds : sessionSelection.active, allTargets, displayMode, sessionActivityTypes), [displayMode, focusedSession, sessionActivityTypes, sessionLessonIds, sessionSelection.active, state.progress])
  const currentQuestion = session[sessionIndex]
  const currentChoices = currentQuestion?.choices ?? []
  const currentUnit = currentQuestion ? levelForLesson(currentQuestion.card.lessonId) : undefined

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
    setSessionLessonIds([...requestedLessonIds])
    setFocusedSession(focused)
    setSessionMode(sessionPracticeMode)
    setSessionActivityTypes([...sessionTypes])
    setSessionIndex(0)
    setFeedback(null)
    setRepairing(false)
    setRepairContext(null)
    setSessionStats({ total: nextQueue.length, correct: 0, promotions: 0, misses: 0, repairs: 0, skipped: 0 })
    setViewMode('normal')
    setNotice(null)
    setShelfMotion(null)
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
        ? 'Choose at least one curriculum unit before starting.'
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
    setShelfMotion({ from: result.previousBox, to: result.nextBox, token: Date.now() })
    setSessionStats((current) => ({ ...current, correct: current.correct + (correct ? 1 : 0), promotions: current.promotions + (result.promoted ? 1 : 0), misses: current.misses + (result.missed ? 1 : 0) }))
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
    setResults({ ...stats, box5Count: shelfCounts(nextState.progress, nextActiveLessonIds, allTargets, sessionMode, nextState.enabledActivityTypes)[5] })
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
      setShelfMotion(null)
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
    setShelfMotion(null)
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
    if (!window.confirm('Reset all local data? This erases your progress, streak, curriculum selection, and preferences from this browser.')) return
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
    setSessionMode('mixed')
    setSessionActivityTypes([...ACTIVITY_TYPES])
    setSessionIndex(0)
    setFeedback(null)
    setRepairing(false)
    setRepairContext(null)
    setSessionStats({ total: 0, correct: 0, promotions: 0, misses: 0, repairs: 0, skipped: 0 })
    setResults(null)
    setNotice(null)
    setShelfMotion(null)
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
    if (screen === 'quiz' && currentQuestion) return <QuizScreen question={currentQuestion} unit={currentUnit} currentBox={state.progress[currentQuestion.card.id]?.box ?? 1} index={sessionIndex} total={session.length} feedback={feedback} repairing={repairing} onAnswer={handleAnswer} onStartRepair={beginRepair} onContinue={continueSession} onSkip={skipCurrentCard} onExit={exitSession} onMenu={openMenu} menuOpen={menuOpen} menuTriggerRef={menuTriggerRef} viewMode={viewMode} onTogglePresentation={togglePresentationMode} />
    if (screen === 'results') return results ? <ResultsScreen results={results} shelf={sessionShelf} hasMoreCards={hasMoreCards} onDone={() => setScreen('today')} onKeepGoing={() => startSession(sessionLessonIds)} /> : <ProgressionOverviewScreen state={state} shelf={shelf} activeUnits={activeUnits} onToday={() => setScreen('today')} onCurriculum={() => setScreen('curriculum')} />
    return <TodayScreen counts={shelf} queueCounts={queueCounts} activeUnits={activeUnits} masteredSelectedCount={masteredSelectedLessonIds.size} dailyGoal={state.dailyGoal} practiceMode={state.practiceMode} missMode={state.missMode} enabledActivityTypes={state.enabledActivityTypes} activityCounts={activityCounts} selectedCardCount={selectedCardCount} readyCardCount={readyCardCount} onStart={() => startSession()} notice={notice} motion={shelfMotion} onChooseCurriculum={() => setScreen('curriculum')} onActivityTypesChange={updateActivityTypes} />
  }

  return (
    <div className={`app-shell ${screen === 'quiz' ? 'is-quiz' : ''} ${viewMode === 'presentation' && screen === 'quiz' ? 'is-presentation' : ''}`}>
      <div className="app-view" inert={menuOpen || Boolean(feedback?.correct)}>
        <a className="skip-link" href="#main-content">Skip to practice</a>
        {screen !== 'quiz' && <MobileHeader onMenu={openMenu} menuOpen={menuOpen} triggerRef={menuTriggerRef} screen={screen} onNavigate={navigate} />}
        <main id="main-content" className={`app-content ${screen === 'quiz' ? 'is-quiz' : ''}`} tabIndex={-1}>{renderScreen()}</main>
      </div>
      {menuOpen && <MenuSheet screen={screen} dailyGoal={state.dailyGoal} missMode={state.missMode} correctAdvanceMode={state.correctAdvanceMode} theme={state.theme} onDailyGoalChange={updateDailyGoal} onMissModeChange={updateMissMode} onCorrectAdvanceModeChange={updateCorrectAdvanceMode} onThemeChange={updateTheme} onResetLocalData={resetLocalData} onNavigate={navigate} closing={menuClosing} onClose={closeMenu} />}
      {screen === 'quiz' && currentQuestion && feedback?.correct && <SuccessOverlay question={currentQuestion} feedback={feedback} index={sessionIndex} total={session.length} advanceMode={state.correctAdvanceMode} onContinue={continueSession} />}
    </div>
  )
}
