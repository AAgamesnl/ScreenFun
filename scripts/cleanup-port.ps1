param(
    [int]$Port = 3000
)

$ErrorActionPreference = 'SilentlyContinue'

$pids = @()

# Attempt using Get-NetTCPConnection
try {
    $conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($conns) {
        $pids += $conns | Select-Object -ExpandProperty OwningProcess -Unique
    }
} catch {}

# Fallback to netstat parsing if needed
if (-not $pids) {
    $lines = netstat -ano | Select-String ":$Port"
    foreach ($m in $lines) {
        $parts = ($m.Line -split '\s+') | Where-Object { $_ }
        if ($parts.Length -ge 5) {
            $pid = $parts[-1]
            if ($pid -match '^[0-9]+$') { $pids += $pid }
        }
    }
}

$pids = $pids | Sort-Object -Unique
foreach ($pid in $pids) {
    try { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } catch {}
}

Start-Sleep -Seconds 1
exit 0
