import { addDays, dateKey, isDateKey, type CardProgress, type MissMode, type PracticeMode } from './leitner.ts'
import { curriculumById, DEFAULT_LESSON_IDS } from './data/curriculum.ts'
import { ACTIVITY_TYPES, type ActivityType } from './data/types.ts'
import { allTargets } from './data/words.ts'

export const STORAGE_KEY = 'leitner-boxes:state:v5'
export const PREVIOUS_STORAGE_KEY = 'leitner-boxes:state:v4'
export const OLDER_STORAGE_KEY = 'leitner-boxes:state:v3'
export const LEGACY_STORAGE_KEY = 'leitner-v1'
export const STORAGE_VERSION = 5 as const

export type Theme = 'light' | 'dark'
export type CorrectAdvanceMode = 'automatic' | 'manual'

export type StoredState = {
  version: typeof STORAGE_VERSION
  theme: Theme
  dailyGoal: number
  practiceMode: PracticeMode
  missMode: MissMode
  correctAdvanceMode: CorrectAdvanceMode
  enabledActivityTypes: ActivityType[]
  selectedLessonIds: string[]
  progress: Record<string, CardProgress>
  streak: {
    count: number
    lastCompletedDate?: string
  }
}

export type StorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function defaultState(): StoredState {
  return {
    version: STORAGE_VERSION,
    theme: 'light',
    dailyGoal: 12,
    practiceMode: 'vocabulary',
    missMode: 'step-back',
    correctAdvanceMode: 'automatic',
    enabledActivityTypes: [...ACTIVITY_TYPES],
    selectedLessonIds: [...DEFAULT_LESSON_IDS],
    progress: {},
    streak: { count: 0 },
  }
}

function isBox(value: unknown): value is CardProgress['box'] {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5
}

function isMaintenanceStep(value: unknown): value is NonNullable<CardProgress['maintenanceStep']> {
  return value === 0 || value === 1 || value === 2
}

function isProgress(value: unknown): value is CardProgress {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  const maintenanceStep = candidate.maintenanceStep
  return isBox(candidate.box)
    && isDateKey(candidate.due)
    && (maintenanceStep === undefined || (candidate.box === 5 && isMaintenanceStep(maintenanceStep)))
}

type LegacyPracticeMode = PracticeMode | 'conjugation'

function isCurrentPracticeMode(value: unknown): value is PracticeMode {
  return value === 'mixed' || value === 'vocabulary'
}

function isLegacyPracticeMode(value: unknown): value is LegacyPracticeMode {
  return isCurrentPracticeMode(value) || value === 'conjugation'
}

function isMissMode(value: unknown): value is MissMode {
  return value === 'step-back' || value === 'full-reset'
}

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

function isCorrectAdvanceMode(value: unknown): value is CorrectAdvanceMode {
  return value === 'automatic' || value === 'manual'
}

function isActivityType(value: unknown): value is ActivityType {
  return ACTIVITY_TYPES.includes(value as ActivityType)
}

function isActivityTypes(value: unknown): value is ActivityType[] {
  return Array.isArray(value) && value.length > 0 && new Set(value).size === value.length && value.every(isActivityType)
}

function normalizeActivityTypes(value: unknown): ActivityType[] {
  if (!Array.isArray(value)) return [...ACTIVITY_TYPES]
  const enabled = [...new Set(value.filter(isActivityType))]
  return enabled.length > 0 ? enabled : [...ACTIVITY_TYPES]
}

function isStateFields(value: Record<string, unknown>): boolean {
  if (typeof value.dailyGoal !== 'number' || !Number.isInteger(value.dailyGoal) || value.dailyGoal < 1 || value.dailyGoal > 50) return false
  if (value.enabledActivityTypes !== undefined && !Array.isArray(value.enabledActivityTypes)) return false
  if (value.missMode !== undefined && !isMissMode(value.missMode)) return false
  if (!Array.isArray(value.selectedLessonIds) || value.selectedLessonIds.some((id) => typeof id !== 'string' || id.length === 0)) return false
  if (!value.progress || typeof value.progress !== 'object' || Array.isArray(value.progress)) return false
  if (Object.values(value.progress as Record<string, unknown>).some((item) => !isProgress(item))) return false
  if (!value.streak || typeof value.streak !== 'object') return false
  const streak = value.streak as Record<string, unknown>
  return Number.isInteger(streak.count) && Number(streak.count) >= 0 && (streak.lastCompletedDate === undefined || isDateKey(streak.lastCompletedDate))
}

export function isStoredState(value: unknown): value is StoredState {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return candidate.version === STORAGE_VERSION && isTheme(candidate.theme) && isCurrentPracticeMode(candidate.practiceMode) && isMissMode(candidate.missMode) && isCorrectAdvanceMode(candidate.correctAdvanceMode) && isActivityTypes(candidate.enabledActivityTypes) && isStateFields(candidate)
}

function migrateStoredState(value: unknown): StoredState | undefined {
  if (isStoredState(value)) return value
  if (!value || typeof value !== 'object') return undefined
  const candidate = value as Record<string, unknown>
  if ((candidate.version !== 1 && candidate.version !== 2 && candidate.version !== 3 && candidate.version !== 4 && candidate.version !== 5) || !isStateFields(candidate)) return undefined
  if (candidate.version >= 2 && !isLegacyPracticeMode(candidate.practiceMode)) return undefined
  return {
    version: STORAGE_VERSION,
    theme: isTheme(candidate.theme) ? candidate.theme : 'light',
    dailyGoal: candidate.dailyGoal as number,
    practiceMode: 'vocabulary',
    missMode: isMissMode(candidate.missMode) ? candidate.missMode : 'step-back',
    correctAdvanceMode: isCorrectAdvanceMode(candidate.correctAdvanceMode) ? candidate.correctAdvanceMode : 'automatic',
    enabledActivityTypes: normalizeActivityTypes(candidate.enabledActivityTypes),
    selectedLessonIds: candidate.selectedLessonIds as string[],
    progress: candidate.progress as Record<string, CardProgress>,
    streak: candidate.streak as StoredState['streak'],
  }
}

const knownTargetIds = new Set(allTargets.map((target) => target.id))
const knownLessonIds = new Set(curriculumById.keys())

function sanitizeState(state: StoredState): StoredState {
  const selectedLessonIds = [...new Set(state.selectedLessonIds.filter((id) => knownLessonIds.has(id)))]
  const progress: Record<string, CardProgress> = Object.fromEntries(
    Object.entries(state.progress).filter(([targetId]) => knownTargetIds.has(targetId)),
  )
  return { ...state, practiceMode: 'vocabulary', selectedLessonIds, progress, enabledActivityTypes: normalizeActivityTypes(state.enabledActivityTypes) }
}

function browserStorage(): StorageLike | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

function parseStoredState(raw: string | null): StoredState | undefined {
  if (!raw) return undefined
  try {
    const parsed: unknown = JSON.parse(raw)
    const state = migrateStoredState(parsed)
    return state ? sanitizeState(state) : undefined
  } catch {
    return undefined
  }
}

export function loadState(storage: StorageLike | undefined = browserStorage()): StoredState {
  if (!storage) return defaultState()
  try {
    const raw = storage.getItem(STORAGE_KEY)
    const currentState = parseStoredState(raw)
    if (currentState) {
      const normalized = JSON.stringify(currentState)
      try {
        if (normalized !== raw) storage.setItem(STORAGE_KEY, normalized)
      } catch {
        // Normalization should never prevent a valid state from loading.
      }
      return currentState
    }

    for (const key of [PREVIOUS_STORAGE_KEY, OLDER_STORAGE_KEY, LEGACY_STORAGE_KEY]) {
      const legacyState = parseStoredState(storage.getItem(key))
      if (!legacyState) continue
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(legacyState))
        storage.removeItem(key)
      } catch {
        // Legacy migration should never prevent a valid state from loading.
      }
      return legacyState
    }
    return defaultState()
  } catch {
    return defaultState()
  }
}

export function saveState(state: StoredState, storage: StorageLike | undefined = browserStorage()): void {
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
    storage.removeItem(PREVIOUS_STORAGE_KEY)
    storage.removeItem(OLDER_STORAGE_KEY)
    storage.removeItem(LEGACY_STORAGE_KEY)
  } catch {
    // Private browsing and storage quotas should never interrupt a practice session.
  }
}

export function clearStoredState(storage: StorageLike | undefined = browserStorage()): boolean {
  if (!storage) return false
  try {
    storage.removeItem(STORAGE_KEY)
    storage.removeItem(PREVIOUS_STORAGE_KEY)
    storage.removeItem(OLDER_STORAGE_KEY)
    storage.removeItem(LEGACY_STORAGE_KEY)
    return [STORAGE_KEY, PREVIOUS_STORAGE_KEY, OLDER_STORAGE_KEY, LEGACY_STORAGE_KEY].every((key) => storage.getItem(key) === null)
  } catch {
    return false
  }
}

export function completeStreak(
  streak: StoredState['streak'],
  today = dateKey(),
): StoredState['streak'] {
  if (streak.lastCompletedDate === today) return streak
  const count = streak.lastCompletedDate && addDays(streak.lastCompletedDate, 1) === today
    ? streak.count + 1
    : 1
  return { count, lastCompletedDate: today }
}
