# VaultLite Portable Windows Build Guide

## Goal
Produce a portable local-first desktop package:

- `VaultLite.exe`
- `resources/`
- `data/` (runtime-created: `vault.db`, `attachments/`)

No cloud dependency, no telemetry, local-only operation.

---

## 1) Prerequisites (Windows build machine)
- Node.js 20+
- Rust stable toolchain
- WebView2 runtime (usually already present on modern Windows)
- Visual Studio Build Tools (C++ workload)

## 2) Install dependencies
```bash
npm install
```

## 3) Build frontend + Tauri bundle
```bash
npm run build
npx tauri build
```

Output artifact appears under:
- `src-tauri/target/release/bundle/`

## 4) Prepare portable directory
Create:
```text
VaultLite/
  VaultLite.exe
  resources/
  data/
    attachments/
```

Copy executable and resources from bundle output.

## 5) First run behavior
On first launch, app initializes:
- `./data/vault.db` (SQLite + FTS5)
- seed data (if empty DB)

## 6) Data portability
Use built-in **Import/Export** panel for ZIP backup + full restore.

## 7) Security posture
- All data local
- No external network calls in app logic
- Optional local vault lock and inactivity auto-lock

## 8) Performance targets checklist
- Launch under 2s on typical dev laptop
- Search under 150ms on expected corpus
- Smooth scroll in list/review views
- Keep baseline memory under 250MB during normal use
