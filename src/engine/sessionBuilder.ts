import { Item, ItemStats } from './types'

export interface SessionOpts {
  now: number
  size?: number
  examDate?: number
}

const FINAL_WEEK_MS = 7 * 24 * 3600_000

const accuracy = (s: ItemStats) => (s.attempts ? s.correct / s.attempts : 0)

export function buildSession(
  items: Item[],
  stats: Record<string, ItemStats>,
  weights: Record<number, number>,
  opts: SessionOpts,
): Item[] {
  const size = opts.size ?? 4
  const { now } = opts
  const picked: Item[] = []
  const has = (i: Item) => picked.some(p => p.id === i.id)

  // 1. Due reviews first, soonest due leading
  const due = items
    .filter(i => stats[i.id] && stats[i.id].dueAt <= now)
    .sort((a, b) => stats[a.id].dueAt - stats[b.id].dueAt)
  for (const i of due) if (picked.length < size) picked.push(i)

  // 2. Final week: weak seen items instead of new material
  const finalWeek = opts.examDate !== undefined && opts.examDate - now < FINAL_WEEK_MS
  if (picked.length < size && finalWeek) {
    const weak = items
      .filter(i => stats[i.id] && stats[i.id].attempts > 0 && !has(i))
      .sort((a, b) => accuracy(stats[a.id]) - accuracy(stats[b.id]))
    for (const i of weak) if (picked.length < size) picked.push(i)
  }

  // 3. New items from under-covered, high-weight topics (also the final-week
  //    fallback when there is too little seen material to fill a sit)
  if (picked.length < size) {
    const unseen = items.filter(i => !stats[i.id] && !has(i))
    const seenFrac = (t: number) => {
      const all = items.filter(i => i.topic === t)
      return all.length ? all.filter(i => stats[i.id]).length / all.length : 1
    }
    const topics = [...new Set(unseen.map(i => i.topic))].sort(
      (a, b) => (weights[b] ?? 0) * (1 - seenFrac(b)) - (weights[a] ?? 0) * (1 - seenFrac(a)))
    while (picked.length < size) {
      let added = false
      for (const t of topics) {
        if (picked.length >= size) break
        const pool = unseen.filter(i => i.topic === t && !has(i))
        if (!pool.length) continue
        const flashcards = picked.filter(i => i.type === 'flashcard').length
        const prefer = picked.length === size - 1 && flashcards === 0 ? 'flashcard' : 'mcq'
        picked.push(pool.find(i => i.type === prefer) ?? pool[0])
        added = true
      }
      if (!added) break
    }
  }

  // 4. Interleaving: never a single-topic sit when an alternative exists
  if (picked.length > 1 && new Set(picked.map(i => i.topic)).size === 1) {
    const alt = items.find(i => !has(i) && i.topic !== picked[0].topic)
    if (alt) picked[picked.length - 1] = alt
  }

  return picked.slice(0, size)
}
