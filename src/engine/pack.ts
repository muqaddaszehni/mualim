import { Item, PackManifest } from './types'

export const weightsOf = (m: PackManifest): Record<number, number> =>
  Object.fromEntries(m.topics.map(t => [t.id, t.weightPercent]))

export function validatePack(manifest: PackManifest, items: Item[]): string[] {
  const errors: string[] = []
  const wsum = manifest.topics.reduce((s, t) => s + t.weightPercent, 0)
  if (Math.abs(wsum - 100) > 0.5) errors.push(`topic weights sum to ${wsum}, expected 100`)
  const topicById = new Map(manifest.topics.map(t => [t.id, t]))
  const seen = new Set<string>()
  for (const i of items) {
    const where = i.id || '(missing id)'
    if (seen.has(i.id)) errors.push(`${where}: duplicate id`)
    seen.add(i.id)
    const t = topicById.get(i.topic)
    if (!t) {
      errors.push(`${where}: unknown topic ${i.topic}`)
      continue
    }
    if (i.pageRef < t.pdfStart || i.pageRef > t.pdfEnd)
      errors.push(`${where}: pageRef ${i.pageRef} outside topic range ${t.pdfStart}-${t.pdfEnd}`)
    if (!i.explanation?.trim()) errors.push(`${where}: empty explanation`)
    if (i.type === 'mcq') {
      if (i.options.length !== 4) errors.push(`${where}: needs exactly 4 options`)
      if (new Set(i.options.map(o => o.trim())).size !== i.options.length)
        errors.push(`${where}: duplicate options`)
      if (!Number.isInteger(i.answer) || i.answer < 0 || i.answer > 3)
        errors.push(`${where}: bad answer index`)
      if (!i.question?.trim()) errors.push(`${where}: empty question`)
    } else {
      if (!i.front?.trim() || !i.back?.trim()) errors.push(`${where}: empty front/back`)
    }
  }
  return errors
}
