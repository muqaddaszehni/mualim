import { Item, MockResult, PackManifest } from '../../engine/types'

interface Props {
  manifest: PackManifest
  items: Item[]
  onFinish: (r: MockResult) => void
}

export default function MockExam(_props: Props) {
  return <div className="screen" />
}
