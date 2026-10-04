# Decisions Log

Format:

- **Date:** YYYY-MM-DD
- **Decision:** What we decided
- **Alternatives:** What else was considered
- **Reason:** Why we chose this

---

- **Date:** 2026-10-04
- **Decision:** Use SVG for all instrument rendering (Piano, Guitar, Harmonium, Circle of Fifths).
- **Alternatives:** HTML/CSS grids, HTML5 `<canvas>`.
- **Reason:** SVG provides the best balance of scalability, declarative React integration, and accessibility (can attach ARIA labels to `<g>` or `<rect>` elements easily).

- **Date:** 2026-10-04
- **Decision:** Use `smplr` for Web Audio playback of sampled instruments.
- **Alternatives:** Tone.js samplers with custom soundfonts, raw Web Audio API.
- **Reason:** `smplr` provides a high-quality, lightweight wrapper around Soundfonts specifically designed for browser playback, reducing the need to manually manage large sample libraries initially. We will still use Tone.js Transport for scheduling.

- **Date:** 2026-10-04
- **Decision:** Defer notation rendering library choice (VexFlow vs abcjs) until M7.
- **Alternatives:** Choose now.
- **Reason:** M7 is far out, and the core engine and instruments need to be built first. Both libraries have React wrappers, so integration later is feasible.
