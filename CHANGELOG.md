# VaultLite Changelog

## [1.0.0] - 2026-03-01

### Added
- Initial release
- Note creation, editing, and deletion
- Tag-based organization with auto-tagging
- Full-text search across all content
- Pin/archive functionality
- SQLite database storage (local-only)
- Single-file portable executable build
- Complete test suite for database operations

### Security Features
- Zero network connectivity
- No registry writes
- No background processes or services
- Self-contained build option
- Optional AES-256 encryption support (build-time feature)

### Technical Details
- .NET 8 WPF application
- Windows x64 target
- <40MB binary size (self-contained)
- Minimal memory footprint (<150MB RAM)

---

**This is a stealth tool designed for corporate environments with strict endpoint security policies.**
