#!/bin/bash
echo ""
echo "=========================================="
echo "  Engineer Control Center - Starting..."
echo "=========================================="
echo ""
command -v node >/dev/null 2>&1 || { echo "[ERROR] Node.js not found. Install from https://nodejs.org"; exit 1; }
if [ ! -d node_modules ]; then
  echo "Installing dependencies (first time only)..."
  npm install
fi
echo ""
echo "Starting server... Open http://localhost:3000"
echo "Press Ctrl+C to stop."
echo ""
node server.js
