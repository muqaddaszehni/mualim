import { useEffect, useState } from 'react'
import { AppState, MockResult } from '../engine/types'
import { addMockResult, loadState, recordAnswer, saveState, setExamDate } from '../engine/storage'
import { usePack } from './usePack'
import Home from './screens/Home'
import Session from './screens/Session'
import MockExam from './screens/MockExam'
import Progress from './screens/Progress'

function useHashRoute() {
  const [route, setRoute] = useState(() => location.hash.slice(1) || '/')
  useEffect(() => {
    const onChange = () => setRoute(location.hash.slice(1) || '/')
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export default function App() {
  const { pack, error } = usePack()
  const [state, setState] = useState<AppState>(() => loadState())
  const [sitKey, setSitKey] = useState(0)
  const route = useHashRoute()

  if (error) return <div className="screen"><p className="center">{error}</p></div>
  if (!pack) return <div className="screen"><p className="center">Loading…</p></div>

  const update = (fn: (s: AppState) => AppState) =>
    setState(s => {
      const n = fn(s)
      saveState(n)
      return n
    })
  const onAnswer = (id: string, correct: boolean) => update(s => recordAnswer(s, id, correct, Date.now()))
  const onFinish = (r: MockResult) => update(s => addMockResult(s, r))

  if (route === '/sit')
    return <Session key={sitKey} manifest={pack.manifest} items={pack.items} state={state}
      onAnswer={onAnswer} onAgain={() => setSitKey(k => k + 1)} />
  if (route === '/mock') return <MockExam manifest={pack.manifest} items={pack.items} onFinish={onFinish} />
  if (route === '/progress') return <Progress manifest={pack.manifest} items={pack.items} state={state} />
  return <Home manifest={pack.manifest} items={pack.items} state={state}
    onSetExamDate={ts => update(s => setExamDate(s, ts))} />
}
