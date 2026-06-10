import { AppState, MockResult } from './types'
import { gradeItem, newStats } from './scheduler'

const KEY = 'mualim:v1'
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

export function defaultState(): AppState {
  return { statsById: {}, streak: { count: 0, lastDay: '' }, examDate: null, mockResults: [] }
}

export function loadState(storage: StorageLike = localStorage): AppState {
  try {
    const raw = storage.getItem(KEY)
    return raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState()
  } catch {
    return defaultState()
  }
}

export function saveState(state: AppState, storage: StorageLike = localStorage): void {
  storage.setItem(KEY, JSON.stringify(state))
}

// Local calendar day, not UTC — a streak day should match the user's clock
const dayOf = (ts: number) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function recordAnswer(state: AppState, itemId: string, correct: boolean, now: number): AppState {
  const prev = state.statsById[itemId] ?? newStats()
  const today = dayOf(now)
  let streak = state.streak
  if (streak.lastDay !== today) {
    const yesterday = dayOf(now - 86400_000)
    streak = { count: streak.lastDay === yesterday ? streak.count + 1 : 1, lastDay: today }
  }
  return { ...state, streak, statsById: { ...state.statsById, [itemId]: gradeItem(prev, correct, now) } }
}

export function setExamDate(state: AppState, ts: number | null): AppState {
  return { ...state, examDate: ts }
}

export function addMockResult(state: AppState, r: MockResult): AppState {
  return { ...state, mockResults: [...state.mockResults, r] }
}
