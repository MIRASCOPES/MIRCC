# ⚡ CCE — Engineer Control Center

A fully local engineering HUD for energy & water management. No cloud. No subscriptions. Runs entirely on your machine.

## ✅ Requirements
- [Node.js](https://nodejs.org) (v16 or higher)

## 🚀 Quick Start

**Windows:** Double-click `START.bat`  
**Mac/Linux:** Run `bash START.sh`

Then open your browser:

| Page | URL |
|------|-----|
| 🌐 Marketing Website | http://localhost:3000/ |
| ⚡ HUD App | http://localhost:3000/app |

## 🔐 Authentication
Your unique key is printed in the terminal on startup and shown on the login screen as a QR code.
- **QR Code** — scan with any QR scanner app
- **Auth Key** — type the `ENG-XXXXXX` key shown in the terminal

## 🖊️ Pen / Stylus Support
The HUD is optimized for digital pens and styluses:
- Large tap targets (56px minimum)
- Ink ripple effect on every tap
- Works with Surface Pen, Apple Pencil, Wacom, etc.

## 💾 Data
All data is saved locally to `data/state.json`. No internet connection required after install.

## ⚡ Features
- 🌐 Landing website at `/` — showcase the app with full marketing page
- ⚡ HUD at `/app` — toggle studio devices, energy monitoring, live cost calculator
- 💧 Faucet system with H₂/O₂ chemistry calculator
- 📊 Real-time load stats & cost estimator (hourly/daily/weekly/monthly)
- 🔄 Real-time sync across multiple browser tabs via WebSocket
- 💾 Session history for faucet usage
- 🔒 QR + key authentication

## 🛑 Stop the Server
Press `Ctrl+C` in the terminal window.
