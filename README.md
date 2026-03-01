# VaultLite

**A minimal, portable, offline-only Windows desktop knowledge application designed for corporate environments with strict security policies.**

## Security Profile ✅

### Zero-Network Architecture
- ❌ NO outbound network calls
- ❌ NO localhost port binding  
- ❌ NO DNS lookups or HTTP requests
- ❌ NO telemetry, analytics, or crash reporting

### Zero-Registry Installation
- ❌ NO registry writes (HKLM/HKCU)
- ❌ NO services or background processes
- ❌ NO scheduled tasks or auto-start entries
- ❌ NO shell extensions or browser integrations

### Portable Deployment
✅ Single executable folder  
✅ Copy & run — no installer needed  
✅ No elevated permissions required  
✅ All data stays in app directory  

## Features

### Core Functionality
- ✅ Create, edit, delete notes
- ✅ Tag-based organization (auto-tagging on creation)
- ✅ Full-text search across all content (in-memory + SQLite index)
- ✅ Pin important notes (always appear at top of list)
- ✅ Archive/restore functionality

### Security Features
- ✅ Optional AES-256 encryption with master password
- ✅ Password required at startup for encrypted vaults
- ✅ No key storage outside app memory
- ✅ Password recovery impossible if forgotten (security by design)

## Requirements

**Build Machine:**
- Windows 10 or later
- .NET 8 SDK installed
- Visual Studio 2022 or .NET CLI

**Runtime:**
- Windows 7 SP1+ with .NET 8 Desktop Runtime **OR**
- Self-contained build (includes .NET runtime, no installation needed)

## Building (Complete Instructions)

### Option 1: Self-Contained Single File Build (Recommended for Deployment)

```powershell
# Navigate to the project directory
cd VaultLite/VaultLite

# Publish as single-file executable (self-contained, ~40MB target)
dotnet publish -c Release `
    -r win-x64 `
    --self-contained true `
    -p:PublishSingleFile=true `
    -p:IncludeNativeLibrariesForSelfExtract=true `
    -p:PublishReadyToRun=true `
    -o ../../publish

# Result: publish/VaultLite.exe (~38-42MB)
```

**Note:** WPF doesn't support trimming in .NET 8/9, so we omit that optimization. The binary is still well under 50MB and fully portable.

### Option 2: Framework-Dependent Build (Smaller binary, requires runtime)

```powershell
cd VaultLite/VaultLite
dotnet publish -c Release -r win-x64 `
    --self-contained false `
    -p:PublishSingleFile=true `
    -o ../../publish

# Result: publish/VaultLite.exe (~5-10MB, requires .NET 8 runtime installed)
```

### Option 3: With Encryption Support (Password protection enabled)

The app automatically detects encrypted databases and shows password unlock dialog. No special build flags needed — encryption is always compiled in.

## Portable Deployment

After building:

1. Copy the entire `publish/` folder to any Windows machine
2. Double-click `VaultLite.exe`
3. **No installation required**
4. All data stored in `./data/vault.db` (relative to executable)

### File Structure After Build
```
publish/
├── VaultLite.exe          # Single-file executable (~35-40MB)
├── data/                  # Data directory (auto-created on first run)
│   └── vault.db           # SQLite database (encrypted if password set)
└── README.md              # This file
```

## First-Time Usage

1. **Launch** - Double-click `VaultLite.exe`
2. **Create Note** - Click "+ New" button, type title/content
3. **Add Tags** - Enter comma-separated tags in tag input field
4. **Pin Important Notes** - Click "Pin" button to keep at top of list
5. **Search** - Type in search box for instant results (no indexing service)
6. **Archive** - Use Archive/Restore to move notes out of main view

## Security Setup (Optional Encryption)

### Enabling Password Protection

VaultLite automatically detects if the database contains encrypted content:

1. Launch VaultLite — if encrypted, password dialog appears immediately
2. Enter master password (minimum 8 chars, 3 of 4 complexity rules):
   - ✅ Uppercase letter (A-Z)
   - ✅ Lowercase letter (a-z)  
   - ✅ Digit (0-9)
   - ✅ Special character (!@#$%^&*)
3. Vault unlocks and loads notes decrypted in memory

### Password Requirements

- Minimum 8 characters
- Must include at least 3 of: uppercase, lowercase, digits, special chars
- **No password recovery** — if forgotten, all data is permanently inaccessible (by design)

## Testing the Build

Run verification script on Windows:

```powershell
cd VaultLite
.\test.ps1
```

Checks performed:
- ✅ Executable exists and size <40MB
- ✅ No external .dll dependencies
- ✅ Data directory structure correct
- ✅ Zero network dependencies detected

## Troubleshooting

### "Missing .dll" errors on startup
→ Use self-contained build: `--self-contained true`

### File access denied
→ Run as normal user — no admin rights needed. Ensure data folder has write permissions.

### Slow startup (>2 seconds)
→ Enable ReadyToRun compilation: `-p:PublishReadyToRun=true`

### Build fails with .NET errors
→ Verify .NET 8 SDK is installed: `dotnet --version`  
→ Install from: https://dotnet.microsoft.com/download/dotnet/8.0

## CI/CD Pipeline

GitHub Actions workflow included at `.github/workflows/build.yml`:
- Automated builds on push/PR to main branch
- Test execution before publishing
- Artifact upload for distribution

---

**Built for stealth, security, and simplicity. No bloat. No tracking. Just your notes.**

*Designed specifically for corporate banking environments with strict endpoint security policies.*

## Stealth Profile

✅ Zero registry writes  
✅ No services or background processes  
✅ No network activity (ever)  
✅ No auto-updates or telemetry  
✅ Single portable folder  
✅ No elevated permissions needed  

## Security

To enable password protection:

1. Build with encryption support
2. Launch app - prompted for master password
3. All notes encrypted with AES-256 before storage

Note: Password recovery is impossible if forgotten. Store securely.

## File Structure

```
VaultLite/
├── VaultLite.exe          # Single-file executable
├── data/                  # Data directory (auto-created)
│   └── vault.db           # SQLite database
└── README.md              # This file
```

## Troubleshooting

### "Missing .dll" errors
Use self-contained build: `--self-contained true`

### File access denied
Run as normal user - no admin rights needed. Ensure data folder has write permissions.

### Slow startup
Enable ReadyToRun compilation: `-p:PublishReadyToRun=true`

## Testing

```powershell
cd VaultLite/VaultLite
dotnet test
```

Or manually verify:
1. Create note → Verify in database
2. Search notes → Check results
3. Pin/Archive → Confirm state persistence
4. Delete note → Ensure removal from DB

## License

Proprietary. For internal use only.

---

Built for stealth, security, and simplicity. No bloat. No tracking. Just your notes.
