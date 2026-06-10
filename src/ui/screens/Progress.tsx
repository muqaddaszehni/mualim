import { AppState, Item, PackManifest } from '../../engine/types'

interface Props {
  manifest: PackManifest
  items: Item[]
  state: AppState
}

export default function Progress(_props: Props) {
  return <div className="screen" />
}
