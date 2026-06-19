/**
 * CCE — Engineer Control Center
 * ─────────────────────────────
 * Landing page : /
 * HUD App      : /app
 *
 * Run locally : node server.js
 * Deploy      : Railway (auto via GitHub)
 */

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const cors       = require('cors');
const path       = require('path');
const fs         = require('fs');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });
const PORT   = process.env.PORT || 3000;

// ─── Public URL (used for QR codes) ──────────────────────────────────────────
// On Railway: set PUBLIC_URL env var to your domain
// e.g. https://web-production-83ed2.up.railway.app
const PUBLIC_URL = process.env.PUBLIC_URL
  || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null)
  || `http://localhost:${PORT}`;

// ─── Persistent JSON Storage ──────────────────────────────────────────────────
// On Railway, filesystem is ephemeral — state resets on redeploy.
// Set AUTH_KEY env var to keep your key stable across deploys.
const DATA_FILE = path.join(__dirname, 'data', 'state.json');

function loadState() {
  if (!fs.existsSync(DATA_FILE)) return defaultState();
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return defaultState(); }
}

function saveState(s) {
  try {
    if (!fs.existsSync(path.join(__dirname, 'data')))
      fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(s, null, 2));
  } catch (e) {
    // Railway ephemeral FS — write may fail, that's OK
    console.warn('[state] Could not persist to disk:', e.message);
  }
}

function defaultState() {
  return {
    // AUTH_KEY env var keeps the key stable across Railway deploys
    authKey: process.env.AUTH_KEY || ('ENG-' + Math.random().toString(36).substring(2, 8).toUpperCase()),
    sessions: [],
    devices: [
      { id: 'd1',  name: 'Main PC',          watts: 450,  active: false, category: 'compute',  icon: 'monitor' },
      { id: 'd2',  name: 'Monitor L',         watts: 35,   active: false, category: 'compute',  icon: 'monitor' },
      { id: 'd3',  name: 'Monitor R',         watts: 35,   active: false, category: 'compute',  icon: 'monitor' },
      { id: 'd4',  name: 'Audio Interface',   watts: 15,   active: false, category: 'audio',    icon: 'audio'   },
      { id: 'd5',  name: 'Mixer',             watts: 25,   active: false, category: 'audio',    icon: 'audio'   },
      { id: 'd6',  name: 'Studio Speakers',   watts: 120,  active: false, category: 'audio',    icon: 'speaker' },
      { id: 'd7',  name: 'Subwoofer',         watts: 200,  active: false, category: 'audio',    icon: 'speaker' },
      { id: 'd8',  name: 'Synth / Keys',      watts: 30,   active: false, category: 'audio',    icon: 'music'   },
      { id: 'd9',  name: 'Studio Lights',     watts: 80,   active: false, category: 'lighting', icon: 'light'   },
      { id: 'd10', name: 'Air Conditioning',  watts: 1500, active: false, category: 'climate',  icon: 'ac'      },
    ],
    faucetSessions: [],
    settings: { maxWatts: 3000, costPerKwh: 0.13, currency: 'USD' },
  };
}

let state = loadState();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Health check (Railway uses this) ────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

// ─── Landing page → / ────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── HUD App → /app ──────────────────────────────────────────────────────────
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

// ─── Auth (disabled — open access) ───────────────────────────────────────────
app.post('/api/auth/verify', (req, res) => {
  // Auth removed — always grant access
  res.json({ ok: true, valid: true, token: uuidv4() });
});

// ─── Download (protected by valid purchase key) ───────────────────────────────
app.get('/download', (req, res) => {
  const key = (req.query.key || '').trim().toUpperCase();
  const downloadKeys = (process.env.DOWNLOAD_KEYS || state.authKey)
    .split(',').map(k => k.trim().toUpperCase());

  if (!downloadKeys.includes(key)) {
    return res.status(403).send('Access denied. Purchase the app to get your download key.');
  }

  const zipPath = path.join(__dirname, 'downloads', 'engineer-control-center.zip');
  if (!fs.existsSync(zipPath)) {
    return res.status(404).send('Download file not found. Contact support.');
  }
  res.download(zipPath, 'engineer-control-center.zip');
});

// ─── Devices ──────────────────────────────────────────────────────────────────
app.get('/api/devices', (req, res) => {
  res.json(state.devices);
});

app.patch('/api/devices/:id', (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  const device = state.devices.find(d => d.id === id);
  if (!device) return res.status(404).json({ error: 'Device not found' });
  device.active = active;
  saveState(state);
  io.emit('devices:update', state.devices);
  res.json(device);
});

app.post('/api/devices/all', (req, res) => {
  const { active } = req.body;
  state.devices.forEach(d => d.active = active);
  saveState(state);
  io.emit('devices:update', state.devices);
  res.json({ ok: true });
});

// ─── Faucet ───────────────────────────────────────────────────────────────────
app.get('/api/faucet/sessions', (req, res) => {
  res.json(state.faucetSessions.slice(-20));
});

app.post('/api/faucet/sessions', (req, res) => {
  const session = { ...req.body, id: uuidv4(), savedAt: Date.now() };
  state.faucetSessions.push(session);
  if (state.faucetSessions.length > 50) state.faucetSessions.shift();
  saveState(state);
  res.json(session);
});

// ─── Settings ─────────────────────────────────────────────────────────────────
app.get('/api/settings', (req, res) => {
  res.json(state.settings);
});

app.patch('/api/settings', (req, res) => {
  Object.assign(state.settings, req.body);
  saveState(state);
  io.emit('settings:update', state.settings);
  res.json(state.settings);
});

// ─── WebSocket ────────────────────────────────────────────────────────────────
io.on('connection', socket => {
  console.log(`[WS] Client connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`[WS] Client left: ${socket.id}`));
});

// ─── Catch-all → landing ──────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  const border = '═'.repeat(52);
  console.log(`\n╔${border}╗`);
  console.log(`║  ⚡ CCE — ENGINEER CONTROL CENTER                    ║`);
  console.log(`╠${border}╣`);
  console.log(`║  🌐 Public URL: ${PUBLIC_URL.padEnd(35)}║`);
  console.log(`║  ⚡ HUD App:    ${(PUBLIC_URL + '/app').padEnd(35)}║`);
  console.log(`║  🔑 Auth Key:   ${state.authKey.padEnd(35)}║`);
  console.log(`║  🚀 Port:       ${String(PORT).padEnd(35)}║`);
  console.log(`╚${border}╝\n`);
});
