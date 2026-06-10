import { ItemStats } from './types'

export const BOX_INTERVALS_HOURS = [1, 4, 24, 72, 168]
export const MAX_BOX = 4
const H = 3600_000

export function newStats(): ItemStats {
  return { box: 0, attempts: 0, correct: 0, streak: 0, lastSeen: 0, dueAt: 0 }
}

export function gradeItem(prev: ItemStats, wasCorrect: boolean, now: number): ItemStats {
  const box = wasCorrect ? Math.min(prev.box + 1, MAX_BOX) : 0
  return {
    box,
    attempts: prev.attempts + 1,
    correct: prev.correct + (wasCorrect ? 1 : 0),
    streak: wasCorrect ? prev.streak + 1 : 0,
    lastSeen: now,
    dueAt: now + BOX_INTERVALS_HOURS[box] * H,
  }
}
