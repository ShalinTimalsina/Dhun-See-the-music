---
name: new-lesson
description: Author a new lesson following the SEE-HEAR-UNDERSTAND-PLAY-EXPERIMENT-PRACTICE-SAVE loop with live interactive widgets.
---

# Workflow: New Lesson

1. **Identify the lesson's position** in the dependency-aware lesson graph (levels 1–8 from the spec). Check prerequisites
2. **Define the learning objective** — what concept does this lesson teach? What should the user be able to DO after completing it?
3. **Author the lesson as typed data** in `packages/music-content/`:
   - Lessons are data files, not static text with screenshots
   - Every lesson includes embedded live widgets (piano, fretboard, etc.)
   - Follow the core loop strictly:

   | Step           | What happens                                                                                        |
   | -------------- | --------------------------------------------------------------------------------------------------- |
   | **SEE**        | Show the concept on instruments (piano, guitar, harmonium) with role-language highlights            |
   | **HEAR**       | Play the concept (note, chord, scale, interval) — user clicks to hear                               |
   | **UNDERSTAND** | Structured "Why?" explanation from `music-core/explain`, at the user's reading level                |
   | **PLAY**       | User plays the concept on an interactive instrument                                                 |
   | **EXPERIMENT** | User modifies something (change key, change voicing, try different chord) and sees/hears the result |
   | **PRACTICE**   | Exercise tied to the concept (identify interval, name chord quality, etc.) with scoring             |
   | **SAVE**       | Save progress to notebook. Mark lesson status                                                       |

4. **Wire theory content** through `music-core` — no hardcoded explanations, no static images of chords
5. **Verify provenance** — every theory claim citable in `docs/KNOWLEDGE_SOURCES.md`
6. **Test the lesson flow** — Playwright test for happy path through all 7 steps
7. **Prerequisite gating is advisory** — users can always explore freely, but the lesson graph suggests order
8. **Run Definition of Done checklist**
