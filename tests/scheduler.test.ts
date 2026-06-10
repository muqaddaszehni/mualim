import { describe, it, expect } from 'vitest'
import { gradeItem, newStats } from '../src/engine/scheduler'

const H = 3600_000

describe('scheduler', () => {
  it('first correct answer moves to box 1, due in 4h', () => {
    const s = gradeItem(newStats(), true, 0)
    expect(s.box).toBe(1)
    expect(s.dueAt).toBe(4 * H)
  })
  it('climbs the ladder 4h -> 1d -> 3d -> 7d and caps at 7d', () => {
    let s = newStats()
    for (const hours of [4, 24, 72, 168, 168]) {
      s = gradeItem(s, true, 0)
      expect(s.dueAt).toBe(hours * H)
    }
    expect(s.box).toBe(4)
  })
  it('wrong answer resets to box 0 and re-queues within the hour', () => {
    let s = newStats()
    s = gradeItem(s, true, 0)
    s = gradeItem(s, true, 0)
    s = gradeItem(s, false, 1000)
    expect(s.box).toBe(0)
    expect(s.dueAt).toBe(1000 + 1 * H)
    expect(s.streak).toBe(0)
  })
  it('keeps attempt/correct/streak counters', () => {
    let s = gradeItem(newStats(), true, 0)
    s = gradeItem(s, false, 1)
    s = gradeItem(s, true, 2)
    expect(s.attempts).toBe(3)
    expect(s.correct).toBe(2)
    expect(s.streak).toBe(1)
    expect(s.lastSeen).toBe(2)
  })
})
