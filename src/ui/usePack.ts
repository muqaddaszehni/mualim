import { useEffect, useState } from 'react'
import { Item, PackManifest } from '../engine/types'

export interface Pack {
  manifest: PackManifest
  items: Item[]
}

export function usePack(): Pack | null {
  const [pack, setPack] = useState<Pack | null>(null)
  useEffect(() => {
    const base = `${import.meta.env.BASE_URL}packs/hksi-paper1/`
    Promise.all(
      ['manifest.json', 'questions.json', 'flashcards.json'].map(f => fetch(base + f).then(r => r.json())),
    ).then(([manifest, q, f]) => setPack({ manifest, items: [...q, ...f] }))
  }, [])
  return pack
}
