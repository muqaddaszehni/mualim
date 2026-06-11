# Mualim

A phone-first study app for the HKSI Licensing Examination Paper 1 (Fundamentals of Securities and Futures Regulation), built for 3–4 question micro-sessions backed by spaced repetition.

**Live app:** https://muqaddaszehni.github.io/mualim/ — open on a phone and "Add to Home Screen"; it installs as a PWA and works offline.

## Features

- **Micro-sessions ("sits")** — 4 items per sit: due spaced-repetition reviews first (compressed Leitner, 1h → 4h → 1d → 3d → 7d), then new material weighted by the official exam topic weightings, topics always interleaved, ~3 MCQs + 1 active-recall flashcard.
- **Question bank** — 700 exam-style MCQs + 250 flashcards generated from the official HKSI Study Guide v3.5, each with an explanation of why the answer is right (and the distractors wrong) plus a PDF page reference. Every item was independently fact-checked against the source text.
- **Mock exam** — the real format: 60 questions drawn per official topic weightings, 90-minute countdown with auto-submit, scored against the 70% pass mark with a per-topic breakdown.
- **Final-week mode** — set your exam date; in the last 7 days the app stops introducing new material and drills your weakest topics.
- **Progress** — per-topic accuracy and coverage, weak-topic flags, mock-exam history, daily streak. All progress is stored on-device (localStorage); there is no backend and no account.

## Development

```bash
npm install
npm run dev        # http://localhost:5173/mualim/
npm test           # vitest suite
npm run build      # type-check + production build (PWA)
```

Pushing to `main` deploys to GitHub Pages via Actions (tests must pass).

## Architecture

The study **engine** (`src/engine/` — scheduler, session builder, mock-exam allocation, persistence) is fully content-agnostic and unit-tested; all exam rules come from a **content pack** (`public/packs/hksi-paper1/`). Supporting a new exam means generating a new pack folder — no engine changes. See `CLAUDE.md` and `docs/superpowers/` (design spec + implementation plan) for the full picture, including the content-generation pipeline and its anti-hallucination verification process.

Note: the copyrighted HKSI source PDF and the intermediate generation artifacts are deliberately not committed (`.gitignore`); the committed pack JSON is the app's source of truth.

## Disclaimer

Personal study tool. Question content is derived from the HKSI Study Guide for educational use; it is not official HKSI material and may contain errors — always confirm against the current official study guide.
