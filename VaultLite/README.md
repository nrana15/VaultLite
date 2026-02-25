# VaultLite

Offline-first technical knowledge OS for technical learning, retention, and production debugging workflows.

## Status
MVP phases 1–7 are implemented and pushed.

## Core Stack
- **Desktop:** Tauri + React + TypeScript
- **UI:** TailwindCSS, lucide-react
- **State:** Zustand
- **Storage:** SQLite + FTS5 (local only)
- **Testing:** Vitest

## Implemented Features

### 1) Knowledge Vault
- Notes/snippets with required `knowledge_type`
- Knowledge types include Concept, Process, SQL Query, Architecture, Debug Pattern, Interview Question, Production Pattern, etc.
- Vault create/list/search flow
- FTS5 index with sync triggers on item/tag changes

### 2) Review Engine (SM-2)
- Flashcard generation from vault items
- Full-screen review mode
- Ratings: Again / Hard / Good / Easy
- SM-2 scheduling updates per review
- Review event tracking

### 3) Daily Recall Mode
- Daily training pack:
  - 5 random Concepts
  - 2 SQL Query items
  - 1 Architecture item
- Type-before-reveal workflow
- Local similarity scoring (no cloud calls)

### 4) Developer Mode
- **Flow Builder** (nodes + connections, saved as JSON)
- **Production Pattern Tracker**
  - Problem description
  - Root cause
  - Fix
  - SQL used
  - Prevention
  - Lessons learned

### 5) Analytics
- Total concepts
- Retention rate
- Review streak
- Most difficult topics
- Heatmap (recent review activity)

### 6) Security & Privacy
- Local-only data storage (`./data`)
- Optional vault lock with inactivity auto-lock
- AES-GCM encryption helpers (PBKDF2-derived keys, versioned payload format)
- No telemetry or cloud sync implemented

### 7) Import / Export
- ZIP export for vault datasets
- Full restore import path
- FTS rebuild after restore
- Review date sanity recalculation on import

### 8) Performance & Release Readiness
- Perf instrumentation helper (`src/utils/perf.ts`)
- In-app readiness checklist
- Portable Windows packaging guide (`docs/PORTABLE_WINDOWS.md`)

---

## Project Structure
```text
src/
  components/
  features/
    vault/
    review/
    analytics/
    developer/
    settings/
  database/
  services/
  state/
  utils/
src-tauri/
data/
  attachments/
test/
```

## Local Data Layout
- `./data/vault.db`
- `./data/attachments/`

## Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Test
```bash
npm run test
```

## Desktop Bundle (Tauri)
```bash
npx tauri build
```

See `docs/PORTABLE_WINDOWS.md` for portable Windows packaging steps.
