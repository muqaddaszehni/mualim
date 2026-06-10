import { AppState, Item, PackManifest } from '../../engine/types'

interface Props {
  manifest: PackManifest
  items: Item[]
  state: AppState
  onSetExamDate: (ts: number) => void
}

export default function Home({ items, state, onSetExamDate }: Props) {
  const now = Date.now()
  const due = items.filter(i => {
    const s = state.statsById[i.id]
    return s && s.dueAt <= now
  }).length
  const days = state.examDate ? Math.max(0, Math.ceil((state.examDate - now) / 86400_000)) : null
  return (
    <div className="screen">
      <header>
        <h1>Mualim</h1>
        <span className="streak">⚡ {state.streak.count}-day streak</span>
      </header>
      <div className="stats-row">
        <div className="stat"><b>{due}</b><span>due now</span></div>
        <div className="stat"><b>{days ?? '—'}</b><span>days to exam</span></div>
      </div>
      <label className="exam-date">
        Exam date:
        <input
          type="date"
          defaultValue={state.examDate ? new Date(state.examDate).toISOString().slice(0, 10) : ''}
          onChange={e => e.target.value && onSetExamDate(new Date(e.target.value).getTime())}
        />
      </label>
      <a className="primary" href="#/sit">Start sit</a>
      <a className="secondary" href="#/mock">Mock exam</a>
      <a className="secondary" href="#/progress">Progress</a>
    </div>
  )
}
