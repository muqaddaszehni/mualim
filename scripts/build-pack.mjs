import { readFileSync, readdirSync, writeFileSync } from 'node:fs'

const files = readdirSync('content-gen').filter(f => f.endsWith('.json'))
const items = files.flatMap(f => JSON.parse(readFileSync(`content-gen/${f}`, 'utf8')))
const questions = items.filter(i => i.type === 'mcq')
const flashcards = items.filter(i => i.type === 'flashcard')
writeFileSync('public/packs/hksi-paper1/questions.json', JSON.stringify(questions, null, 1))
writeFileSync('public/packs/hksi-paper1/flashcards.json', JSON.stringify(flashcards, null, 1))
console.log(`chunks=${files.length} questions=${questions.length} flashcards=${flashcards.length}`)
