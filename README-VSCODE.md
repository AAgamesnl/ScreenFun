# VS Code quick-open & PR flow

## Wat is dit?
Kant‑en‑klare bestanden om je project met één dubbelklik in **VS Code** te openen en snel een **pull request** lokaal te checken.

## Bestanden
- `OpenInVSCode.cmd` — dubbelklik om de workspace/map direct in VS Code te openen.
- `OpenInVSCode.ps1` — script dat (optioneel) PR-extensies installeert en VS Code start.
- `screenfun.code-workspace` — workspace met handige settings & extensies.
- `.vscode/settings.json` — basis Git/format settings.
- `.vscode/tasks.json` — taken voor PR fetch/checkout en je lokale startscript.

## Gebruik
1. Kopieer alle bestanden uit deze map naar de **root van je project** (naast `start-screenfun.ps1`).
2. **Dubbelklik** `OpenInVSCode.cmd` (of run `OpenInVSCode.ps1`).
3. In VS Code:
   - `Ctrl+Shift+P` → **GitHub: Sign in** (éénmalig).
   - **Terminal → Run Task… → “Git: Fetch+Checkout PR (by number)”** → vul PR-nummer in.
   - **Terminal → Run Task… → “Start: Local server (PowerShell)”** om lokaal te draaien.

## Troubleshooting
- Scripts geblokkeerd? Start via `.cmd` (gebruikt ExecutionPolicy Bypass) of voer 1× uit:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
  ```
- `code` niet gevonden? Pas het pad aan in `OpenInVSCode.ps1` naar jouw `Code.exe`.
