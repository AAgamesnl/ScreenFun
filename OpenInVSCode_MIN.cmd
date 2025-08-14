@echo off
setlocal
set "DIR=%~dp0"
set "CODE1=%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe"
set "CODE2=C:\Program Files\Microsoft VS Code\Code.exe"

rem Kies VS Code pad of 'code' op PATH
if exist "%CODE1%" (
  set "CODE=%CODE1%"
) else if exist "%CODE2%" (
  set "CODE=%CODE2%"
) else (
  set "CODE=code"
)

rem Open workspace als die bestaat, anders de map
if exist "%DIR%screenfun.code-workspace" (
  "%CODE%" --reuse-window "%DIR%screenfun.code-workspace"
) else (
  "%CODE%" --reuse-window "%DIR%"
)
endlocal
