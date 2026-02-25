# VaultLite (Ultra-Pro scaffold)

Offline-first technical knowledge OS for Windows desktop.

## Stack
- Tauri + React + TypeScript
- Tailwind CSS
- Zustand
- SQLite (FTS5 schema in `src/database/schema.sql`)

## Current baseline
- Premium 3-pane UI scaffold
- Domain types with required `knowledge_type`
- Database schema + seed data for Avaloq-oriented examples
- FTS5 sync triggers for create/update/delete/tag changes
- Vault CRUD baseline (create/list/search) with knowledge-type-aware editor
- Tauri SQLite wiring + migration bootstrap (`data/vault.db`)
- Review engine: due queue + full-screen SM-2 rating flow
- Daily Recall mode with typed answer + local similarity scoring
- Developer mode: flow builder (JSON) + production pattern tracker
- SM-2 scheduling engine (Anki style)
- Unit tests for SM-2, search query builder, import/export restore plan

## Run
```bash
npm install
npm run dev
```

## Test
```bash
npm run test
```

## Data layout (portable)
- `./data/vault.db`
- `./data/attachments/`

## Next implementation steps
1. DB migration runner + SQLite service wiring
2. Vault CRUD + FTS5 sync triggers
3. Review full-screen flow with rating controls
4. Daily reinforcement typing mode with similarity scoring
5. Analytics and optional AES vault lock
6. Zip import/export and full restore
