param(
  [string]$Version = "22.11.0"
)

Write-Host "[ensure-node] Checking for Node.js v$Version..."

$workspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$nodeDirName = "node-v$Version-win-x64"
$nodeDir = Join-Path $workspaceRoot $nodeDirName
$nodeExe = Join-Path $nodeDir 'node.exe'

if (Test-Path $nodeExe) {
  Write-Host "[ensure-node] Found: $nodeExe"
  exit 0
}

Write-Host "[ensure-node] node.exe not found. Downloading..." -ForegroundColor Yellow

$zipName = "node-v$Version-win-x64.zip"
$downloadUrl = "https://nodejs.org/dist/v$Version/$zipName"
$tmpZip = Join-Path $env:TEMP $zipName

try {
  Write-Host "[ensure-node] Downloading $downloadUrl -> $tmpZip"
  Invoke-WebRequest -Uri $downloadUrl -OutFile $tmpZip -UseBasicParsing
} catch {
  Write-Warning "[ensure-node] Primary download failed: $_"
  if ($Version -ne '22.11.0') {
    Write-Host "[ensure-node] Retrying with fallback version 22.11.0" -ForegroundColor Yellow
    & $PSCommandPath -Version 22.11.0
    exit $LASTEXITCODE
  } else {
    Write-Error "[ensure-node] Download failed for fallback as well." ; exit 1
  }
}

Write-Host "[ensure-node] Extracting..."
try {
  Expand-Archive -Path $tmpZip -DestinationPath $workspaceRoot -Force
} catch {
  Write-Error "[ensure-node] Extraction failed: $_" ; exit 1
}

Remove-Item $tmpZip -ErrorAction SilentlyContinue

if (Test-Path $nodeExe) {
  Write-Host "[ensure-node] Installed Node.js to $nodeDir"
  & $nodeExe -v
  exit 0
} else {
  Write-Error "[ensure-node] node.exe still not found after extraction." ; exit 1
}
