import { useMemo, useState } from 'react'
import { AppState, Item, PackManifest } from '../../engine/types'
import { buildSession } from '../../engine/sessionBuilder'
import { weightsOf } from '../../engine/pack'

interface Props {
  manifest: PackManifest
  items: Item[]
  state: AppState
  onAnswer: (id: string, correct: boolean) => void
  onAgain: () => void
}

export default function Session({ manifest, items, state, onAnswer, onAgain }: Props) {
  const session = useMemo(
    () => buildSession(items, state.statsById, weightsOf(manifest), {
      now: Date.now(),
      examDate: state.examDate ?? undefined,
    }),
    // build once per mount; App remounts via key for a new sit
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [flipped, setFlipped] = useState(false)

  if (!session.length)
    return (
      <div className="screen">
        <header><h1>Sit</h1><a href="#/">Home</a></header>
        <p className="center">Nothing left to study right now. 🎉</p>
        <a className="primary" href="#/">Home</a>
      </div>
    )

  if (idx >= session.length)
    return (
      <div className="screen">
        <header><h1>Sit complete</h1><a href="#/">Home</a></header>
        <p className="center">{session.length} down. Come back when something's due.</p>
        <button className="primary" onClick={onAgain}>Another sit</button>
        <a className="secondary" href="#/">Home</a>
      </div>
    )

  const item = session[idx]
  const next = () => {
    setIdx(idx + 1)
    setPicked(null)
    setFlipped(false)
  }

  return (
    <div className="screen">
      <header>
        <span>Topic {item.topic} · {item.section}</span>
        <span>{idx + 1} / {session.length}</span>
      </header>
      <div className="bar"><div style={{ width: `${(idx / session.length) * 100}%` }} /></div>

      {item.type === 'mcq' ? (
        <>
          <p className="q">{item.question}</p>
          {item.options.map((o, i) => (
            <button
              key={i}
              disabled={picked !== null}
              className={
                picked === null ? 'opt' : i === item.answer ? 'opt right' : i === picked ? 'opt wrong' : 'opt dim'
              }
              onClick={() => {
                setPicked(i)
                onAnswer(item.id, i === item.answer)
              }}
            >
              {String.fromCharCode(65 + i)}&nbsp;&nbsp;{o}
            </button>
          ))}
          {picked !== null && (
            <div className="explain">
              <p>{item.explanation}</p>
              <p className="ref">Study Guide PDF p.{item.pageRef}</p>
              <button className="primary" onClick={next}>Next</button>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="q">{item.front}</p>
          {!flipped ? (
            <button className="primary" onClick={() => setFlipped(true)}>Show answer</button>
          ) : (
            <div className="explain">
              <p className="answer">{item.back}</p>
              <p>{item.explanation}</p>
              <p className="ref">Study Guide PDF p.{item.pageRef}</p>
              <div className="row">
                <button className="wrong-btn" onClick={() => { onAnswer(item.id, false); next() }}>
                  Didn't know
                </button>
                <button className="right-btn" onClick={() => { onAnswer(item.id, true); next() }}>
                  Knew it
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
