import { AppState, Item, PackManifest } from '../../engine/types'

interface Props {
  manifest: PackManifest
  items: Item[]
  state: AppState
}

export default function Progress({ manifest, items, state }: Props) {
  const rows = manifest.topics.map(t => {
    const ti = items.filter(i => i.topic === t.id)
    const seen = ti.filter(i => state.statsById[i.id])
    const attempts = seen.reduce((s, i) => s + state.statsById[i.id].attempts, 0)
    const correct = seen.reduce((s, i) => s + state.statsById[i.id].correct, 0)
    return {
      t,
      coverage: ti.length ? seen.length / ti.length : 0,
      accuracy: attempts ? correct / attempts : null,
    }
  })
  const weakest = rows
    .filter(r => r.accuracy !== null && r.accuracy < 0.7)
    .sort((a, b) => a.accuracy! - b.accuracy!)
    .slice(0, 2)
    .map(r => r.t.id)

  return (
    <div className="screen">
      <header><h1>Progress</h1><a href="#/">Home</a></header>
      {rows.map(({ t, coverage, accuracy }) => (
        <div className="topic-row" key={t.id}>
          <span>
            {t.id}. {t.name} {weakest.includes(t.id) && <span className="warn">⚠ weak</span>}
          </span>
          <span className="meta">
            {accuracy === null
              ? 'not started'
              : `${Math.round(accuracy * 100)}% right · ${Math.round(coverage * 100)}% seen`}
          </span>
          <div className="bar"><div style={{ width: `${(accuracy ?? 0) * 100}%` }} /></div>
        </div>
      ))}
      {state.mockResults.length > 0 && (
        <>
          <h2>Mock exams</h2>
          <table><tbody>
            {state.mockResults.map((r, i) => (
              <tr key={i}>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>{r.percent}%</td>
                <td className={r.passed ? 'pass' : 'fail'}>{r.passed ? 'PASS' : 'FAIL'}</td>
              </tr>
            ))}
          </tbody></table>
        </>
      )}
    </div>
  )
}
