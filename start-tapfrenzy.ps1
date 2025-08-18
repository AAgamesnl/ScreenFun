param(
  [int]$Port = 3000,
  [string]$NodePath = "C:\Users\ayoub.elyaakoubi\Documents\node-v22.18.0-win-x64\node.exe"
)

# Resolve project directory to the folder of this script
$ProjectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectPath

Write-Host "=== TapFrenzy launcher ===" -ForegroundColor Cyan
Write-Host "Project: $ProjectPath"
Write-Host "Node:    $NodePath"
Write-Host "Port:    $Port"

if (!(Test-Path $NodePath)) {
  Write-Host "Node.exe niet gevonden op: $NodePath" -ForegroundColor Red
  Write-Host "Pas -NodePath aan of wijzig het pad bovenaan in dit script." -ForegroundColor Yellow
  Read-Host "Druk op Enter om te sluiten"
  exit 1
}

$NodeDir = Split-Path $NodePath -Parent
$NpmCli = Join-Path $NodeDir "node_modules\npm\bin\npm-cli.js"
if (!(Test-Path $NpmCli)) {
  Write-Host "npm-cli niet gevonden op: $NpmCli" -ForegroundColor Red
  Write-Host "Controleer of je de Node ZIP correct hebt uitgepakt (met node_modules\npm)." -ForegroundColor Yellow
  Read-Host "Druk op Enter om te sluiten"
  exit 1
}

# 1) Dependencies indien nodig
if (!(Test-Path ".\node_modules")) {
  Write-Host "`n[Step] npm install (eerste keer)..."
  & $NodePath $NpmCli install --no-audit --no-fund --cache "$ProjectPath\.npm-cache"
  if ($LASTEXITCODE -ne 0) { Write-Host "npm install faalde." -ForegroundColor Red; Read-Host "Enter om te sluiten"; exit 1 }
}

# 2) Build TypeScript → dist/
Write-Host "`n[Step] tsc build..."
$TscJs = ".\node_modules\typescript\bin\tsc"
if (!(Test-Path $TscJs)) {
  Write-Host "TypeScript niet gevonden. Installeer dependencies opnieuw." -ForegroundColor Yellow
  & $NodePath $NpmCli install typescript --save-dev --no-audit --no-fund --cache "$ProjectPath\.npm-cache"
}
& $NodePath $TscJs
if ($LASTEXITCODE -ne 0) { Write-Host "TypeScript build faalde." -ForegroundColor Red; Read-Host "Enter om te sluiten"; exit 1 }

# 3) Start server in een nieuw PowerShell venster
$env:PORT = "$Port"
$ServerCmd = "`"$NodePath`" `"$ProjectPath\dist\server.js`""
Write-Host "`n[Step] Server starten..."
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit","-Command",$ServerCmd -WorkingDirectory $ProjectPath

# --- GEEN automatische browser-open meer ---
Write-Host "`nServer gestart. Open zelf in je browser:" -ForegroundColor Green
Write-Host "  http://localhost:$Port/host.html" -ForegroundColor Cyan
Write-Host "Laat het servervenster open tijdens het spelen." -ForegroundColor Cyan
