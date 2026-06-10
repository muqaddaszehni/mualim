import { MCQ, MockResult, PackManifest } from './types'

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function allocate(total: number, topics: { id: number; weightPercent: number }[]): Record<number, number> {
  const sum = topics.reduce((s, t) => s + t.weightPercent, 0)
  const exact = topics.map(t => ({ id: t.id, w: t.weightPercent, x: (total * t.weightPercent) / sum }))
  const out: Record<number, number> = {}
  let used = 0
  for (const e of exact) {
    out[e.id] = Math.floor(e.x)
    used += out[e.id]
  }
  const order = [...exact].sort(
    (a, b) => (b.x - Math.floor(b.x)) - (a.x - Math.floor(a.x)) || b.w - a.w || a.id - b.id)
  for (let k = 0; k < total - used; k++) out[order[k].id]++
  return out
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildMockExam(questions: MCQ[], manifest: PackManifest, rand: () => number): MCQ[] {
  const alloc = allocate(manifest.examQuestionCount, manifest.topics)
  const exam: MCQ[] = []
  for (const t of manifest.topics) {
    const pool = shuffle(questions.filter(q => q.topic === t.id), rand)
    exam.push(...pool.slice(0, alloc[t.id]))
  }
  return shuffle(exam, rand)
}

export function scoreMockExam(
  exam: MCQ[], answers: (number | null)[], manifest: PackManifest, now: number,
): MockResult {
  const perTopic: Record<number, { correct: number; total: number }> = {}
  let correct = 0
  exam.forEach((q, i) => {
    const pt = (perTopic[q.topic] ??= { correct: 0, total: 0 })
    pt.total++
    if (answers[i] === q.answer) {
      pt.correct++
      correct++
    }
  })
  const percent = exam.length === 0 ? 0 : Math.round((correct / exam.length) * 1000) / 10
  return { date: now, percent, passed: percent >= manifest.passMarkPercent, perTopic }
}
