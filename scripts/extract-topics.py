#!/usr/bin/env python3
"""Chunk the HKSI P1 study guide into ~12-page text files with per-chunk
question targets (largest-remainder split of per-topic targets)."""
import json, math, pathlib, subprocess

PDF = "P1 v3.5 eng full.pdf"
OUT = pathlib.Path("content-src")
OUT.mkdir(exist_ok=True)

TOPICS = {1: (14, 39), 2: (40, 66), 3: (67, 108), 4: (109, 177), 5: (178, 243),
          6: (244, 293), 7: (294, 339), 8: (340, 402), 9: (403, 442)}
MCQ = {1: 24, 2: 24, 3: 95, 4: 165, 5: 130, 6: 116, 7: 70, 8: 45, 9: 31}
FC = {1: 9, 2: 9, 3: 34, 4: 59, 5: 46, 6: 41, 7: 25, 8: 16, 9: 11}
CHUNK = 12

def page_text(n):
    return subprocess.run(["pdftotext", "-f", str(n), "-l", str(n), "-layout", PDF, "-"],
                          capture_output=True, text=True).stdout

def split_counts(total, sizes):
    exact = [total * s / sum(sizes) for s in sizes]
    out = [math.floor(e) for e in exact]
    rem = sorted(range(len(sizes)), key=lambda i: exact[i] - out[i], reverse=True)
    for i in range(total - sum(out)):
        out[rem[i]] += 1
    return out

tasks = []
for t, (a, b) in TOPICS.items():
    bounds = [(s, min(s + CHUNK - 1, b)) for s in range(a, b + 1, CHUNK)]
    sizes = [e - s + 1 for s, e in bounds]
    mc = split_counts(MCQ[t], sizes)
    fc = split_counts(FC[t], sizes)
    for k, (s, e) in enumerate(bounds, 1):
        f = OUT / f"t{t}-c{k}.txt"
        f.write_text("".join(f"\n=== PDF PAGE {n} ===\n{page_text(n)}" for n in range(s, e + 1)))
        tasks.append({"topic": t, "chunk": k, "file": str(f.resolve()),
                      "pdfStart": s, "pdfEnd": e,
                      "mcqCount": mc[k - 1], "flashcardCount": fc[k - 1]})

json.dump(tasks, open(OUT / "tasks.json", "w"), indent=1)
print(f"{len(tasks)} chunks; MCQ={sum(t['mcqCount'] for t in tasks)} FC={sum(t['flashcardCount'] for t in tasks)}")
