@echo off
cls
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║     Engineer Control Center  v2.0        ║
echo  ║              Setup ^& Launch              ║
echo  ╚══════════════════════════════════════════╝
echo.

:: ── 1. Check Node.js ────────────────────────────
echo  ^▸ Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo.
  echo   [ERROR] Node.js is not installed.
  echo   Please install it from: https://nodejs.org
  echo   Then run this script again.
  echo.
  pause
  exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo   OK  Node.js %NODE_VER% found
echo.

:: ── 2. Install dependencies ─────────────────────
if not exist node_modules (
  echo  ^▸ Installing dependencies (first time only)...
  npm install --silent
  if %errorlevel% neq 0 (
    echo.
    echo   [ERROR] npm install failed. Make sure you have internet access.
    pause
    exit /b 1
  )
  echo   OK  Dependencies installed
) else (
  echo  ^▸ Dependencies already installed  OK
)
echo.

:: ── 3. Set up .env ──────────────────────────────
if not exist .env (
  if exist .env.example (
    copy .env.example .env >nul
    echo  ^▸ Created .env from template  OK
  )
) else (
  echo  ^▸ Config file (.env^) exists  OK
)
echo.

:: ── 4. Launch server ────────────────────────────
echo  ^▸ Starting server...
echo.
echo   ┌─────────────────────────────────────┐
echo   │  App running at: http://localhost:3000  │
echo   │  Press Ctrl+C to stop the server    │
echo   └─────────────────────────────────────┘
echo.

:: Auto-open browser after 2 seconds
start "" /b cmd /c "timeout /t 2 >nul && start http://localhost:3000"

node server.js
pause
