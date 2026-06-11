@echo off
setlocal

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0push-to-github.ps1" %*
set "EXIT_CODE=%ERRORLEVEL%"

echo.
if not "%EXIT_CODE%"=="0" (
  echo Push failed. Press any key to close...
  pause >nul
  exit /b %EXIT_CODE%
)

echo Done. Press any key to close...
pause >nul
exit /b 0
