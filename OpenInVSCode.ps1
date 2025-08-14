param(
  [switch]$InstallExtensions = $true,
  [string]$VSCodePath = "$env:LOCALAPPDATA\Programs\Microsoft VS Code\Code.exe"
)

# Projectmap = map waar dit script staat
$ProjectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectPath

# Zoek VS Code: standaardlocatie -> Program Files -> 'code' op PATH
if (!(Test-Path $VSCodePath)) {
  $VSCodePath = "C:\Program Files\Microsoft VS Code\Code.exe"
}
$CodeCmd = if (Test-Path $VSCodePath) { '"{0}"' -f $VSCodePath } else { "code" }

Write-Host "Opening VS Code..." -ForegroundColor Cyan

# Als er een workspace bestaat, open die; anders de map
$workspace = Join-Path $ProjectPath "screenfun.code-workspace"
if (Test-Path $workspace) {
  $openArgs = @("--reuse-window", "`"$workspace`"")
} else {
  $openArgs = @("--reuse-window", "`"$ProjectPath`"")
}

# (Optioneel) extensies voor PR’s & Git-hulp installeren
if ($InstallExtensions) {
  try {
    & $CodeCmd --install-extension github.vscode-pull-request-github | Out-Null
    & $CodeCmd --install-extension eamodio.gitlens | Out-Null
    & $CodeCmd --install-extension esbenp.prettier-vscode | Out-Null
  } catch { }
}

# Start VS Code
& $CodeCmd @openArgs
