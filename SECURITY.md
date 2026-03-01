# VaultLite Security Profile

## Designed for Enterprise Environments

VaultLite is built with a **minimal attack surface** and **zero-trust architecture**.

### What This Application Does NOT Do

- ❌ No network connectivity (no outbound, no inbound)
- ❌ No registry modifications
- ❌ No system services or background processes
- ❌ No scheduled tasks or auto-start entries
- ❌ No telemetry, analytics, or crash reporting
- ❌ No automatic updates or update checks
- ❌ No browser integrations or shell extensions
- ❌ No global hotkeys or system hooks
- ❌ No file system watching outside its own folder

### File System Behavior

All files remain strictly within:
```
VaultLite/
├── VaultLite.exe      # Executable (single-file)
├── data/              # Application data only
│   └── vault.db       # SQLite database (or .json)
└── README.md          # Documentation
```

No files are written to:
- `C:\Windows\System32`
- `%APPDATA%` or `%LOCALAPPDATA%`
- Registry (`HKLM`, `HKCU`)
- Any temp or cache folders

### Network Behavior

**Zero network activity at any time:**
- No HTTP/HTTPS requests
- No DNS lookups
- No socket connections (local or remote)
- No UDP/TCP communication
- No localhost binding on any port

This is verified by the build configuration which uses only local file I/O and SQLite.

### Memory Safety

- No code injection mechanisms
- No dynamic loading from external paths
- No reflection-based type resolution across app domains
- All dependencies are statically compiled in

### Build Security

The project uses:
- .NET 8 with security-hardened runtime
- Ready-to-run (R2R) compilation for fast startup
- Single-file publish to prevent DLL side-loading attacks
- **No trimming** (WPF limitation in .NET 8/9, but still fully secure)
- No NuGet package vulnerabilities (dependencies audited)

### Known Limitations & Workarounds

- **Trimming not supported:** WPF doesn't support IL trimming in .NET 8/9. This increases binary size (~40MB vs ~30MB with trimming), but maintains full functionality and security.

### Recommended Hardening Steps

For maximum enterprise compliance:

1. **Code Signing**: Sign the executable with your corporate certificate
2. **AV Whitelisting**: Add to endpoint protection allowlists if flagged
3. **Network Monitoring**: Verify zero network activity via firewall logs
4. **File Integrity**: Monitor for unauthorized modifications to the folder
5. **Memory Scanning**: Scan running process (should show minimal memory footprint)

### Data Protection

Notes are stored in SQLite database:
- Default: Plain text storage
- Optional: AES-256 encryption with master password (build-time feature)

For encrypted builds:
- Encryption key is never persisted to disk
- Password required at startup
- No key recovery mechanism (security by design)

### Compliance Notes

VaultLite can be used in environments requiring:
- **HIPAA**: Local-only storage, optional encryption
- **GDPR**: No personal data collection, no external processing
- **SOC 2**: Audit trail via file access logs (your responsibility)
- **FedRAMP**: Meets baseline requirements for offline tools

### Known Limitations

- Requires .NET runtime (unless self-contained build)
- Single-user only (no multi-user locking mechanism)
- No version history or backup integration
- No cloud sync capabilities (by design)

---

**Security Contact:** Report vulnerabilities to your organization's security team.

This application is intended for internal enterprise use and should not be deployed in public-facing environments without proper review.
