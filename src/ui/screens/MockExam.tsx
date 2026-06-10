import { useEffect, useState } from 'react'
import { Item, MCQ, MockResult, PackManifest } from '../../engine/types'
import { buildMockExam, mulberry32, scoreMockExam } from '../../engine/mockExam'

interface Props {
  manifest: PackManifest
  items: Item[]
  onFinish: (r: MockResult) => void
}

export default function MockExam({ manifest, items, onFinish }: Props) {
  const [exam, setExam] = useState<MCQ[] | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [idx, setIdx] = useState(0)
  const [endsAt, setEndsAt] = useState(0)
  const [msLeft, setMsLeft] = useState(0)
  const [result, setResult] = useState<MockResult | null>(null)

  const start = () => {
    const ex = buildMockExam(
      items.filter((i): i is MCQ => i.type === 'mcq'),
      manifest,
      mulberry32(Date.now() % 2147483647),
    )
    setExam(ex)
    setAnswers(Array(ex.length).fill(null))
    setIdx(0)
    const ends = Date.now() + manifest.examTimeLimitMinutes * 60_000
    setEndsAt(ends)
    setMsLeft(ends - Date.now())
  }

  const submit = () => {
    if (!exam || result) return
    const r = scoreMockExam(exam, answers, manifest, Date.now())
    setResult(r)
    onFinish(r)
  }

  useEffect(() => {
    if (!exam || result) return
    const t = setInterval(() => setMsLeft(endsAt - Date.now()), 1000)
    return () => clearInterval(t)
  }, [exam, endsAt, result])

  useEffect(() => {
    if (exam && !result && endsAt > 0 && msLeft <= 0) submit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msLeft, result])

  if (!exam)
    return (
      <div className="screen">
        <header><h1>Mock exam</h1><a href="#/">Home</a></header>
        <p className="center">
          {manifest.examQuestionCount} questions · {manifest.examTimeLimitMinutes} minutes · pass {manifest.passMarkPercent}%
          <br />No feedback until the end — just like the real thing.
        </p>
        <button className="primary" onClick={start}>Start</button>
      </div>
    )

  if (result)
    return (
      <div className="screen">
        <header><h1>Result</h1><a href="#/">Home</a></header>
        <div className={`big-score ${result.passed ? 'pass' : 'fail'}`}>{result.percent}%</div>
        <p className="center">{result.passed ? 'PASS 🎉' : `FAIL — pass mark is ${manifest.passMarkPercent}%`}</p>
        <table><tbody>
          {manifest.topics.map(t => {
            const pt = result.perTopic[t.id]
            return pt ? (
              <tr key={t.id}>
                <td>{t.id}. {t.name}</td>
                <td>{pt.correct}/{pt.total}</td>
              </tr>
            ) : null
          })}
        </tbody></table>
      </div>
    )

  const q = exam[idx]
  const answered = answers.filter(a => a !== null).length
  const mins = Math.max(0, Math.floor(msLeft / 60_000))
  const secs = Math.max(0, Math.floor((msLeft % 60_000) / 1000))
  return (
    <div className="screen">
      <header>
        <span>{idx + 1} / {exam.length} · {answered} answered</span>
        <span className="timer">{mins}:{String(secs).padStart(2, '0')}</span>
      </header>
      <div className="bar"><div style={{ width: `${(answered / exam.length) * 100}%` }} /></div>
      <p className="q">{q.question}</p>
      {q.options.map((o, i) => (
        <button
          key={i}
          className={answers[idx] === i ? 'opt selected' : 'opt'}
          onClick={() => setAnswers(a => a.map((v, j) => (j === idx ? i : v)))}
        >
          {String.fromCharCode(65 + i)}&nbsp;&nbsp;{o}
        </button>
      ))}
      <div className="row">
        <button className="secondary" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Back</button>
        {idx < exam.length - 1
          ? <button className="secondary" onClick={() => setIdx(idx + 1)}>Next</button>
          : <button className="primary" onClick={submit}>Submit</button>}
      </div>
    </div>
  )
}
