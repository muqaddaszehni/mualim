import { useEffect, useState } from 'react'
import { Item, PackManifest } from '../engine/types'

export interface Pack {
  manifest: PackManifest
  items: Item[]
}

export function usePack(): { pack: Pack | null; error: string | null } {
  const [pack, setPack] = useState<Pack | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const base = `${import.meta.env.BASE_URL}packs/hksi-paper1/`
    Promise.all(
      ['manifest.json', 'questions.json', 'flashcards.json'].map(f =>
        fetch(base + f).then(r => {
          if (!r.ok) throw new Error(`${f}: HTTP ${r.status}`)
          return r.json()
        }),
      ),
    )
      .then(([manifest, q, f]) => setPack({ manifest, items: [...q, ...f] }))
      .catch(e => setError(`Failed to load question pack (${e instanceof Error ? e.message : e})`))
  }, [])
  return { pack, error }
}
