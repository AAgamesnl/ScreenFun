@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
set "PS1=%SCRIPT_DIR%start-screenfun.ps1"

:: Dubbelklik deze .cmd. Hij start PowerShell met execution policy bypass (alleen voor dit proces).
powershell.exe -ExecutionPolicy Bypass -File "%PS1%" %*
endlocal
