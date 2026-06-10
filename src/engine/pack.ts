import { Item, PackManifest } from './types'

export const weightsOf = (m: PackManifest): Record<number, number> =>
  Object.fromEntries(m.topics.map(t => [t.id, t.weightPercent]))

export function validatePack(manifest: PackManifest, items: Item[]): string[] {
  const errors: string[] = []
  const wsum = manifest.topics.reduce((s, t) => s + t.weightPercent, 0)
  if (Math.abs(wsum - 100) > 0.5) errors.push(`topic weights sum to ${wsum}, expected 100`)
  const topicById = new Map(manifest.topics.map(t => [t.id, t]))
  const seen = new Set<string>()
  for (const i of items as unknown as Record<string, unknown>[]) {
    const id = typeof i.id === 'string' && i.id ? i.id : null
    const where = id ?? '(missing id)'
    if (id === null) {
      errors.push(`${where}: missing id`)
    } else if (seen.has(id)) {
      errors.push(`${where}: duplicate id`)
    } else {
      seen.add(id)
    }
    const t = topicById.get(i.topic as number)
    if (!t) {
      errors.push(`${where}: unknown topic ${i.topic}`)
      continue
    }
    if (typeof i.pageRef !== 'number' || i.pageRef < t.pdfStart || i.pageRef > t.pdfEnd)
      errors.push(`${where}: pageRef ${i.pageRef} outside topic range ${t.pdfStart}-${t.pdfEnd}`)
    if (!(i.explanation as string)?.trim()) errors.push(`${where}: empty explanation`)
    if (i.type !== 'mcq' && i.type !== 'flashcard') {
      errors.push(`${where}: bad type`)
    } else if (i.type === 'mcq') {
      if (!Array.isArray(i.options)) {
        errors.push(`${where}: options is not an array`)
      } else if ((i.options as unknown[]).some(o => typeof o !== 'string')) {
        errors.push(`${where}: non-string option`)
      } else {
        if ((i.options as string[]).length !== 4) errors.push(`${where}: needs exactly 4 options`)
        if (new Set((i.options as string[]).map(o => o.trim())).size !== (i.options as string[]).length)
          errors.push(`${where}: duplicate options`)
      }
      if (!Number.isInteger(i.answer) || (i.answer as number) < 0 || (i.answer as number) > 3)
        errors.push(`${where}: bad answer index`)
      if (!(i.question as string)?.trim()) errors.push(`${where}: empty question`)
    } else {
      if (!(i.front as string)?.trim() || !(i.back as string)?.trim()) errors.push(`${where}: empty front/back`)
    }
  }
  return errors
}
