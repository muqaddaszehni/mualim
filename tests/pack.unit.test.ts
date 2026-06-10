import { describe, it, expect } from 'vitest'
import { validatePack, weightsOf } from '../src/engine/pack'
import { PackManifest, Item } from '../src/engine/types'

const manifest: PackManifest = {
  id: 'test', name: 'Test', examQuestionCount: 4, examTimeLimitMinutes: 10, passMarkPercent: 70,
  topics: [
    { id: 1, name: 'T1', weightPercent: 60, pdfStart: 10, pdfEnd: 20 },
    { id: 2, name: 'T2', weightPercent: 40, pdfStart: 21, pdfEnd: 30 },
  ],
}

const goodMcq: Item = {
  id: 'q1', type: 'mcq', topic: 1, section: 's', pageRef: 12, question: 'Q?',
  options: ['a', 'b', 'c', 'd'], answer: 2, explanation: 'because',
}
const goodFc: Item = {
  id: 'f1', type: 'flashcard', topic: 2, section: 's', pageRef: 22, front: 'F?', back: 'B', explanation: 'ctx',
}

describe('validatePack', () => {
  it('accepts a valid pack', () => {
    expect(validatePack(manifest, [goodMcq, goodFc])).toEqual([])
  })
  it('rejects weights not summing to 100', () => {
    const bad = { ...manifest, topics: [{ ...manifest.topics[0], weightPercent: 10 }, manifest.topics[1]] }
    expect(validatePack(bad, [])).toHaveLength(1)
  })
  it('rejects duplicate ids, bad topic, out-of-range pageRef', () => {
    const errs = validatePack(manifest, [
      goodMcq,
      { ...goodMcq },
      { ...goodMcq, id: 'q2', topic: 9 },
      { ...goodMcq, id: 'q3', pageRef: 99 },
    ])
    expect(errs.some(e => e.includes('duplicate id'))).toBe(true)
    expect(errs.some(e => e.includes('unknown topic'))).toBe(true)
    expect(errs.some(e => e.includes('outside topic range'))).toBe(true)
  })
  it('rejects malformed MCQs and flashcards', () => {
    const errs = validatePack(manifest, [
      { ...goodMcq, id: 'a', options: ['a', 'b', 'c'] },
      { ...goodMcq, id: 'b', options: ['x', 'x', 'y', 'z'] },
      { ...goodMcq, id: 'c', answer: 5 },
      { ...goodMcq, id: 'd', explanation: ' ' },
      { ...goodFc, id: 'e', back: '' },
    ] as Item[])
    expect(errs.length).toBeGreaterThanOrEqual(5)
  })
  it('rejects structurally broken JSON items', () => {
    const errs = validatePack(manifest, [
      { id: 'x1', type: 'mystery', topic: 1, section: 's', pageRef: 12, explanation: 'e' },
      { id: 'x2', type: 'mcq', topic: 1, section: 's', pageRef: 12, question: 'Q?', options: null, answer: 0, explanation: 'e' },
      { id: 'x3', type: 'mcq', topic: 1, section: 's', pageRef: 12, question: 'Q?', options: ['a', 2, 'c', 'd'], answer: 0, explanation: 'e' },
      { type: 'flashcard', topic: 1, section: 's', pageRef: 12, front: 'F', back: 'B', explanation: 'e' },
      { id: 'x5', type: 'mcq', topic: 1, section: 's', pageRef: 'twelve', question: 'Q?', options: ['a', 'b', 'c', 'd'], answer: 0, explanation: 'e' },
    ] as unknown as Item[])
    expect(errs.length).toBeGreaterThanOrEqual(5)
    // must not throw
  })
  it('weightsOf maps topic id to weight', () => {
    expect(weightsOf(manifest)).toEqual({ 1: 60, 2: 40 })
  })
})
