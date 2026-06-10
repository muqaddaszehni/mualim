import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { validatePack } from '../src/engine/pack'
import { allocate } from '../src/engine/mockExam'
import { Flashcard, MCQ, PackManifest } from '../src/engine/types'

const dir = 'public/packs/hksi-paper1'
const ready = existsSync(`${dir}/questions.json`)

const MCQ_TARGETS: Record<number, number> = { 1: 24, 2: 24, 3: 95, 4: 165, 5: 130, 6: 116, 7: 70, 8: 45, 9: 31 }
const FC_TARGET = 250

describe.skipIf(!ready)('hksi-paper1 content pack', () => {
  const manifest: PackManifest = JSON.parse(readFileSync(`${dir}/manifest.json`, 'utf8'))
  const questions: MCQ[] = JSON.parse(readFileSync(`${dir}/questions.json`, 'utf8'))
  const flashcards: Flashcard[] = JSON.parse(readFileSync(`${dir}/flashcards.json`, 'utf8'))

  it('passes full schema validation with zero errors', () => {
    expect(validatePack(manifest, [...questions, ...flashcards])).toEqual([])
  })
  it('meets per-topic MCQ coverage within 5% of target (drops allowed, silence not)', () => {
    for (const t of manifest.topics) {
      const n = questions.filter(q => q.topic === t.id).length
      expect(n, `topic ${t.id}`).toBeGreaterThanOrEqual(Math.floor(MCQ_TARGETS[t.id] * 0.95))
    }
    expect(flashcards.length).toBeGreaterThanOrEqual(Math.floor(FC_TARGET * 0.95))
  })
  it('every topic has enough MCQs for its mock-exam allocation', () => {
    const alloc = allocate(manifest.examQuestionCount, manifest.topics)
    for (const t of manifest.topics) {
      expect(questions.filter(q => q.topic === t.id).length).toBeGreaterThanOrEqual(alloc[t.id])
    }
  })
  it('explanations cite the source', () => {
    const cited = questions.filter(q => /PDF p\.\s?\d+/.test(q.explanation)).length
    expect(cited / questions.length).toBeGreaterThan(0.95)
  })
})
