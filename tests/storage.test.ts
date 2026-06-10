import { describe, it, expect } from 'vitest'
import { addMockResult, defaultState, loadState, recordAnswer, saveState, setExamDate } from '../src/engine/storage'

const fakeStorage = () => {
  const m = new Map<string, string>()
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => { m.set(k, v) },
  }
}

const T0 = Date.UTC(2026, 5, 10, 12, 0, 0) // 2026-06-10 noon UTC
const DAY = 86400_000

describe('storage', () => {
  it('returns default state when empty or corrupt', () => {
    expect(loadState(fakeStorage())).toEqual(defaultState())
    const bad = fakeStorage()
    bad.setItem('mualim:v1', '{{{')
    expect(loadState(bad)).toEqual(defaultState())
  })
  it('round-trips state', () => {
    const s = fakeStorage()
    const state = recordAnswer(defaultState(), 'q1', true, T0)
    saveState(state, s)
    expect(loadState(s)).toEqual(state)
  })
  it('recordAnswer grades the item', () => {
    const state = recordAnswer(defaultState(), 'q1', true, T0)
    expect(state.statsById.q1.box).toBe(1)
    expect(state.statsById.q1.attempts).toBe(1)
  })
  it('streak: starts at 1, increments next day, resets after a gap, stable same day', () => {
    let s = recordAnswer(defaultState(), 'a', true, T0)
    expect(s.streak.count).toBe(1)
    s = recordAnswer(s, 'b', true, T0 + 1000)
    expect(s.streak.count).toBe(1)
    s = recordAnswer(s, 'c', true, T0 + DAY)
    expect(s.streak.count).toBe(2)
    s = recordAnswer(s, 'd', true, T0 + 3 * DAY)
    expect(s.streak.count).toBe(1)
  })
  it('setExamDate and addMockResult update state immutably', () => {
    const base = defaultState()
    const withDate = setExamDate(base, 123)
    expect(withDate.examDate).toBe(123)
    expect(base.examDate).toBeNull()
    const r = { date: 1, percent: 80, passed: true, perTopic: {} }
    expect(addMockResult(base, r).mockResults).toEqual([r])
  })
})
