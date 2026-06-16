@echo off
echo.
echo ==========================================
echo   Engineer Control Center - Starting...
echo ==========================================
echo.
where node >nul 2>&1 || (echo [ERROR] Node.js not found. Install from https://nodejs.org & pause & exit /b 1)
if not exist node_modules (
  echo Installing dependencies (first time only)...
  npm install
)
echo.
echo Starting server... Open http://localhost:3000
echo Press Ctrl+C to stop.
echo.
node server.js
pause
