import { describe, it, expect } from 'vitest'
import { buildSession } from '../src/engine/sessionBuilder'
import { Flashcard, Item, ItemStats, MCQ } from '../src/engine/types'

const mcq = (id: string, topic: number): MCQ => ({
  id, type: 'mcq', topic, section: 's', pageRef: 14, question: 'q',
  options: ['a', 'b', 'c', 'd'], answer: 0, explanation: 'e',
})
const fc = (id: string, topic: number): Flashcard => ({
  id, type: 'flashcard', topic, section: 's', pageRef: 14, front: 'f', back: 'b', explanation: 'e',
})
const st = (over: Partial<ItemStats>): ItemStats => ({
  box: 1, attempts: 1, correct: 1, streak: 1, lastSeen: 0, dueAt: 0, ...over,
})
const W = { 1: 50, 2: 50 }
const DAY = 86400_000

describe('buildSession', () => {
  it('puts due items first, soonest-due leading', () => {
    const items: Item[] = [mcq('a', 1), mcq('b', 1), mcq('c', 2), fc('d', 2)]
    const stats = { a: st({ dueAt: 5 }), b: st({ dueAt: 3 }) }
    const s = buildSession(items, stats, W, { now: 10 })
    expect(s[0].id).toBe('b')
    expect(s[1].id).toBe('a')
    expect(s).toHaveLength(4)
  })
  it('fresh bank: 4 items, exactly 1 flashcard, more than one topic', () => {
    const items: Item[] = [
      ...[1, 2].flatMap(t => Array.from({ length: 5 }, (_, i) => mcq(`m${t}-${i}`, t))),
      fc('f1', 1), fc('f2', 2),
    ]
    const s = buildSession(items, {}, W, { now: 0 })
    expect(s).toHaveLength(4)
    expect(s.filter(i => i.type === 'flashcard')).toHaveLength(1)
    expect(new Set(s.map(i => i.topic)).size).toBeGreaterThan(1)
  })
  it('never fills a whole sit from one topic when an alternative exists', () => {
    const items: Item[] = [mcq('a', 1), mcq('b', 1), mcq('c', 1), mcq('d', 1), mcq('e', 2)]
    const stats = { a: st({}), b: st({}), c: st({}), d: st({}) } // all due now
    const s = buildSession(items, stats, W, { now: 10 })
    expect(new Set(s.map(i => i.topic)).size).toBeGreaterThan(1)
  })
  it('final week: prefers weak seen items over new material', () => {
    const now = 100 * DAY
    const items: Item[] = [
      mcq('weak1', 1), mcq('weak2', 1), mcq('strong', 1), mcq('mid', 2),
      mcq('new1', 2), mcq('new2', 2),
    ]
    const notDue = now + 10 * DAY
    const stats = {
      weak1: st({ attempts: 4, correct: 0, dueAt: notDue }),
      weak2: st({ attempts: 4, correct: 1, dueAt: notDue }),
      strong: st({ attempts: 4, correct: 4, dueAt: notDue }),
      mid: st({ attempts: 4, correct: 2, dueAt: notDue }),
    }
    const s = buildSession(items, stats, W, { now, examDate: now + 3 * DAY })
    expect(s.map(i => i.id).slice(0, 3)).toEqual(['weak1', 'weak2', 'mid'])
    expect(s).toHaveLength(4)
  })
  it('respects size and small banks', () => {
    const items: Item[] = [mcq('a', 1), mcq('b', 2)]
    expect(buildSession(items, {}, W, { now: 0 })).toHaveLength(2)
    expect(buildSession(items, {}, W, { now: 0, size: 1 })).toHaveLength(1)
  })
})
