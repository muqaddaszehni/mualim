import { describe, it, expect } from 'vitest'
import { allocate, buildMockExam, scoreMockExam, mulberry32 } from '../src/engine/mockExam'
import { MCQ, PackManifest } from '../src/engine/types'

const HKSI_WEIGHTS = [
  { id: 1, weightPercent: 3.5 }, { id: 2, weightPercent: 3.5 }, { id: 3, weightPercent: 13.5 },
  { id: 4, weightPercent: 23.5 }, { id: 5, weightPercent: 18.5 }, { id: 6, weightPercent: 16.5 },
  { id: 7, weightPercent: 10 }, { id: 8, weightPercent: 6.5 }, { id: 9, weightPercent: 4.5 },
]

const manifest: PackManifest = {
  id: 'hksi-paper1', name: 'HKSI P1', examQuestionCount: 60, examTimeLimitMinutes: 90, passMarkPercent: 70,
  topics: HKSI_WEIGHTS.map(w => ({ ...w, name: `T${w.id}`, pdfStart: 1, pdfEnd: 442 })),
}

const mcq = (id: string, topic: number, answer = 0): MCQ => ({
  id, type: 'mcq', topic, section: 's', pageRef: 1, question: 'q',
  options: ['a', 'b', 'c', 'd'], answer, explanation: 'e',
})

const bank: MCQ[] = manifest.topics.flatMap(t =>
  Array.from({ length: 20 }, (_, i) => mcq(`t${t.id}-${i}`, t.id)))

describe('allocate', () => {
  it('reproduces the official HKSI allocation for 60 questions', () => {
    expect(allocate(60, HKSI_WEIGHTS)).toEqual({ 1: 2, 2: 2, 3: 8, 4: 14, 5: 11, 6: 10, 7: 6, 8: 4, 9: 3 })
  })
  it('always sums to the total', () => {
    const out = allocate(7, HKSI_WEIGHTS)
    expect(Object.values(out).reduce((a, b) => a + b, 0)).toBe(7)
  })
})

describe('buildMockExam', () => {
  it('draws 60 unique questions matching the allocation', () => {
    const exam = buildMockExam(bank, manifest, mulberry32(42))
    expect(exam).toHaveLength(60)
    expect(new Set(exam.map(q => q.id)).size).toBe(60)
    const perTopic: Record<number, number> = {}
    for (const q of exam) perTopic[q.topic] = (perTopic[q.topic] ?? 0) + 1
    expect(perTopic).toEqual({ 1: 2, 2: 2, 3: 8, 4: 14, 5: 11, 6: 10, 7: 6, 8: 4, 9: 3 })
  })
  it('is deterministic for a given seed', () => {
    const a = buildMockExam(bank, manifest, mulberry32(7)).map(q => q.id)
    const b = buildMockExam(bank, manifest, mulberry32(7)).map(q => q.id)
    expect(a).toEqual(b)
  })
})

describe('scoreMockExam', () => {
  it('scores percent, pass/fail at 70%, and per-topic breakdown', () => {
    const exam = [mcq('a', 1, 0), mcq('b', 1, 1), mcq('c', 2, 2), mcq('d', 2, 3)]
    const r = scoreMockExam(exam, [0, 1, 2, 0], manifest, 123)
    expect(r.percent).toBe(75)
    expect(r.passed).toBe(true)
    expect(r.perTopic).toEqual({ 1: { correct: 2, total: 2 }, 2: { correct: 1, total: 2 } })
    expect(r.date).toBe(123)
    const fail = scoreMockExam(exam, [0, null, null, null], manifest, 0)
    expect(fail.percent).toBe(25)
    expect(fail.passed).toBe(false)
  })
})
