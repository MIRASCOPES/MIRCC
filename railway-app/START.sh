#!/bin/bash

clear
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     Engineer Control Center  v2.0        ║"
echo "║              Setup & Launch              ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 1. Check Node.js ────────────────────────────
echo "▸ Checking Node.js..."
if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "  [ERROR] Node.js is not installed."
  echo "  Please install it from: https://nodejs.org"
  echo "  Then run this script again."
  echo ""
  read -p "Press Enter to exit..."
  exit 1
fi
NODE_VER=$(node -v)
echo "  ✓ Node.js $NODE_VER found"
echo ""

# ── 2. Install dependencies ─────────────────────
if [ ! -d "node_modules" ]; then
  echo "▸ Installing dependencies (first time only)..."
  npm install --silent
  if [ $? -ne 0 ]; then
    echo ""
    echo "  [ERROR] npm install failed. Make sure you have internet access."
    read -p "Press Enter to exit..."
    exit 1
  fi
  echo "  ✓ Dependencies installed"
else
  echo "▸ Dependencies already installed ✓"
fi
echo ""

# ── 3. Set up .env ──────────────────────────────
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "▸ Created .env from template ✓"
  fi
else
  echo "▸ Config file (.env) exists ✓"
fi
echo ""

# ── 4. Launch server ────────────────────────────
echo "▸ Starting server..."
echo ""
echo "  ┌─────────────────────────────────────┐"
echo "  │  App running at: http://localhost:3000  │"
echo "  │  Press Ctrl+C to stop the server    │"
echo "  └─────────────────────────────────────┘"
echo ""

# Auto-open browser after a short delay
(sleep 2 && \
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open http://localhost:3000
  elif command -v open >/dev/null 2>&1; then
    open http://localhost:3000
  fi
) &

node server.js
