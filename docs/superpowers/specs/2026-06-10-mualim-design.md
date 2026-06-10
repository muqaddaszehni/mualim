# Mualim — HKSI Paper 1 Micro-Study App — Design

**Date:** 2026-06-10
**User context:** Exam in ~3 weeks (early July 2026). Source: `P1 v3.5 eng full.pdf` (441 pages, text-extractable, effective for exams from 30 June 2026). Real exam: 60 MCQs, 90 minutes, 70% pass mark.

## Goal

A phone-first web app for studying the HKSI LE Paper 1 study guide in 3–4 question micro-sessions ("toilet-break sits"), built on spaced repetition and active recall, plus a timed mock-exam mode. Open-anytime via a home-screen icon, works offline, progress on-device.

## Architecture

- **Stack:** React + Vite + TypeScript. Fully static, no backend.
- **PWA:** manifest + service worker → Add to Home Screen, full-screen launch, offline (question bank bundled).
- **Hosting:** GitHub Pages, deployed via GitHub Actions on push to `main`.
- **Storage:** localStorage (single device, a few KB of per-item stats).
- **Future-proofing ("examify anything"):** strict engine/content separation.
  - `src/engine/` — scheduler, session builder, scoring. Content-agnostic; reads all exam rules from the content pack manifest. No HKSI-specific logic.
  - `src/ui/` — screens, theme.
  - `public/packs/hksi-paper1/` — `manifest.json` (exam name, question count, time limit, pass mark, topic list + weights), `questions.json`, `flashcards.json`.
  - A new exam later = a new pack folder; zero engine changes.

## Visual design

"Dark focus" direction (user-selected from mockups): dark background (#101418 / #1a2026 cards), teal accent (#4fd1c5), system sans, streak counter in the header, thin progress bar per sit. Mobile-first layout; mockup reference in `.superpowers/brainstorm/*/content/visual-style.html`.

## Content pipeline (build-time, one-off)

1. **Extract** per-topic text with `pdftotext` using page ranges from the guide's TOC.
2. **Generate** items with parallel subagents — generously parallel, one agent per topic chunk — each agent reading only its extracted source text (never general knowledge). Harvest the guide's own sample/revision questions per topic as style gold standard.
3. **Weight** question counts by official LE Paper 1 topic weightings. Weightings must be confirmed during build from the guide or HKSI's published syllabus; if unavailable, fall back to per-topic page-count proportion. Do not invent weights.
4. **Targets:** ~700 MCQs + ~250 flashcards. Flashcards skew toward numeric facts (fines, day-limits, thresholds, capital requirements).
5. **Item schema:** `id`, `type` (mcq | flashcard), `topic`, `section`, `pageRef`, `question`, `options[4]` (MCQ only, exactly one correct), `answer`, `explanation` (why right is right and wrongs are wrong, citing "Study Guide p.X").

## Anti-hallucination & testing (non-negotiable)

- **Engine TDD:** unit tests written before implementation for scheduler, session builder, scoring. Examples: wrong answer → box 1 + re-queued same day; no sit contains 4 same-topic items; mock exam draws exactly per weights; final-week mode prioritises weak items.
- **Content schema tests:** automated validation — exactly one correct answer, 4 distinct options, explanation present, `pageRef` within the topic's actual page range.
- **Verification gate — 100% of items:** every question/flashcard is checked by an independent verification agent given only the extracted source text for that page range, answering "is the stated correct answer supported by this text?" Generator and verifier are always separate contexts. Fail → regenerate + re-verify; fail twice → drop the item (never patch).
- **Coverage test:** per-topic counts match planned weightings.
- **Real-data rule:** "done" claims only after the built app is run with the real generated pack (and PWA install + offline tested on the deployed URL).

## Study engine

- **Scheduler:** Leitner boxes compressed for a 3-week horizon. Correct → up a box; intervals 4h → 1d → 3d → 7d. Wrong → box 1, reappears same day.
- **Session builder:** each sit = 4 items, priority: (1) due reviews, (2) new items from under-covered high-weight topics, (3) interleaving constraint — never 4 items from one topic. Mix ≈ 3 MCQs + 1 flashcard.
- **Active recall:** flashcards are answer-before-flip with self-grade (knew it / didn't); MCQs show explanation immediately after every answer.
- **Exam-countdown mode:** user sets exam date on first launch (stored in localStorage, editable from Home); final week shifts from new material to weak-item revision (lowest-accuracy topics first).
- **Per-item stats:** attempts, correct streak, last seen, box level.

## Screens

1. **Home** — streak, items due, days to exam, big "Start sit", links to Mock exam and Progress.
2. **Session** — dark-focus question screen: tap an option → instant colour feedback + explanation + page ref → next. Flashcard: prompt → flip → self-grade.
3. **Mock exam** — 60 questions drawn per weights, 90-min countdown, no per-question feedback; final score vs 70% pass mark + per-topic breakdown.
4. **Progress** — per-topic accuracy bars, weakest topics flagged, bank coverage.

## Decisions log

- Phone-first, hosted (GitHub Pages), single-device progress — chosen over laptop-local and synced-multi-device.
- MCQs + flashcards — chosen over MCQ-only and full mix (cloze/true-false).
- Mock exam mode included.
- Comprehensive bank (~700 + ~250) — chosen over lean (~300 + ~100).
- React + Vite — chosen over zero-build static (future "examify anything" platform) and over Anki export (no mock exam, clunky MCQ).
- Content generation and verification must use parallel agents generously (user request).

## Out of scope

Accounts, sync, backend, analytics, other papers (future packs), iOS/Android native apps, editing questions in-app.
