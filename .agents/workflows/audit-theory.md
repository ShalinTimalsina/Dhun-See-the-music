---
name: audit-theory
description: Verify theory claims and explanations against the music-core model and KNOWLEDGE_SOURCES.md. No fabricated theory.
---

# Workflow: Audit Theory

1. **Identify all theory claims** in the target (lesson, explanation, UI tooltip, "Why?" panel)
2. **For each claim, verify it is model-derived:**
   - Does `music-core/explain` produce this explanation from actual data?
   - Can you trace the claim to interval arithmetic, scale degrees, or chord formulas in the code?
   - If the claim is free-typed prose not connected to model data → flag and rewrite
3. **Check provenance:**
   - Is the source cited in `docs/KNOWLEDGE_SOURCES.md`?
   - Is it an authoritative theory text, university/conservatory open material, or established educator?
4. **Check for competing interpretations:**
   - Does this convention have alternatives? (e.g., chord naming, Roman numeral styles)
   - If yes, does the UI note the convention used and mention the alternative?
   - Never silently merge competing conventions
5. **Check sargam accuracy:**
   - Are swara offsets correct from Sa?
   - Is Sa treated as a variable, not hardcoded to C?
   - Are both Latin and Devanagari labels correct?
6. **Check reading levels:**
   - Beginner: plain language, no jargon, no unexplained symbols
   - Standard: intervals, Roman numerals, function names — all defined on first use
7. **Document findings** — list verified claims, flagged claims, and corrections made
