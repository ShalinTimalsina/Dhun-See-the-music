---
trigger: always_on
---

# Security Rules

## Banned Patterns

- No `eval()`, `new Function()`, `dangerouslySetInnerHTML`. Ever.
- No `innerHTML` with user-provided or imported content.
- All user input sanitized (HTML entities escaped).

## Data Validation

- Zod schemas for EVERY persisted or imported object, with `schemaVersion`.
- JSON import/export validated against Zod schema before processing.
- Schema migration functions for version upgrades.

## Local-First Privacy

- All user data stays on device in V1 (IndexedDB via Dexie). No analytics that send musical or personal data without explicit opt-in.
- Microphone access (later phases) requested only when needed, with a clear explanation.
- No accounts, no server-side storage in V1.

## Web Audio and MIDI Safety

- `AudioContext` created only after user gesture.
- Web MIDI API feature-detected (Chrome/Edge only). Degrade gracefully on unsupported browsers.
- No audio autoplay. No sound without explicit user action.

## Content Security

- Strict CSP where feasible.
- No secrets in client bundles.
- No network requests triggered by user-entered musical data (chords, songs, melodies).
- Dynamic imports only for known internal packages (no dynamic URL imports).

## PWA Security

- Service worker caches only known app shell and sample files.
- No third-party scripts cached by service worker.
