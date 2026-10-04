---
trigger: always_on
---

# Content Rules

## Theory Accuracy

- NEVER fabricate theory claims. Every nontrivial claim in lessons or explanations must be derivable from the `music-core` model.
- Structured explanations come from `music-core/explain` as data objects, not free-typed prose.
- When a claim is a convention or has competing interpretations, say so and cite the source in `docs/KNOWLEDGE_SOURCES.md`.
- Use `TODO: confirm source` for any unverified claim. Do not ship it without resolution.

## Explanation Philosophy

- "Why is this C major?" → lists intervals from the actual chord formula.
- "Why does G work after C?" → explains function (V → I) using actual scale degrees and shared/moving tones.
- No free-typed theory text disconnected from model data.
- Two reading levels: beginner (plain language, no jargon) and standard (intervals, Roman numerals, function names).

## Sargam and Multilingual

- Sargam labels in Latin (Sa Re Ga Ma Pa Dha Ni) AND Devanagari (सा रे ग म प ध नि), selectable by user.
- Sa is a variable (any pitch class). Do not hardcode Sa=C.
- Derive Western names via `Sa + offset` with correct spelling.

## Copy Voice

- From the user's point of view. Plain verbs. Sentence case. Active voice.
- Buttons say what happens: "Save my version", not "Submit". The same action keeps the same name throughout the flow.
- Errors say what went wrong and how to fix it. No apologies.
- Empty states invite action: "Pick a chord to see it on every instrument."
- Musical terms with an always-available plain-language tooltip or "What's this?"

## Banned Phrases

- "passionate about", "results-driven", "cutting-edge", "world-class", "leverage", "synergy".
- No corporate buzzwords. This is a learning tool for curious beginners.

## Content Provenance

- Seed songs: public domain only. Verify status for each and record in `docs/KNOWLEDGE_SOURCES.md`.
- Never include copyrighted lyrics or full copyrighted melodies.
- Write original explanations. Cite sources. Do not paste textbook content.
