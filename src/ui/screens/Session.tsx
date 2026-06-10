import { AppState, Item, PackManifest } from '../../engine/types'

interface Props {
  manifest: PackManifest
  items: Item[]
  state: AppState
  onAnswer: (id: string, correct: boolean) => void
  onAgain: () => void
}

export default function Session(_props: Props) {
  return <div className="screen" />
}
