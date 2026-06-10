export interface TopicInfo {
  id: number
  name: string
  weightPercent: number
  pdfStart: number
  pdfEnd: number
}

export interface PackManifest {
  id: string
  name: string
  examQuestionCount: number
  examTimeLimitMinutes: number
  passMarkPercent: number
  topics: TopicInfo[]
}

export interface MCQ {
  id: string
  type: 'mcq'
  topic: number
  section: string
  pageRef: number
  question: string
  options: string[]
  answer: number
  explanation: string
}

export interface Flashcard {
  id: string
  type: 'flashcard'
  topic: number
  section: string
  pageRef: number
  front: string
  back: string
  explanation: string
}

export type Item = MCQ | Flashcard

export interface ItemStats {
  box: number
  attempts: number
  correct: number
  streak: number
  lastSeen: number
  dueAt: number
}

export interface MockResult {
  date: number
  percent: number
  passed: boolean
  perTopic: Record<number, { correct: number; total: number }>
}

export interface AppState {
  statsById: Record<string, ItemStats>
  streak: { count: number; lastDay: string }
  examDate: number | null
  mockResults: MockResult[]
}
