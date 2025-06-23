/**
 * shrinedaemon/src/index.js
 * – Express REST API
 * – WebSocket “pulse”
 * – Static UI serving (Shrine/)
 */

const path      = require('path');
const express   = require('express');
const http      = require('http');
const WebSocket = require('ws');

////////////////////////////////////////////////////////////////////////////////
// 1) Build Express app + HTTP server
////////////////////////////////////////////////////////////////////////////////

const app    = express();
const server = http.createServer(app);

////////////////////////////////////////////////////////////////////////////////
// 2) REST API endpoints
////////////////////////////////////////////////////////////////////////////////

// Example status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status:    'OK',
    timestamp: Date.now()
  });
});

// TODO: add more app.get / app.post routes here as needed

////////////////////////////////////////////////////////////////////////////////
// 3) Static UI: Shrine of Secrets front-end
////////////////////////////////////////////////////////////////////////////////

// Assume your front-end files (index.html, images/, tree.txt) live in ../ui
const staticRoot = path.join(__dirname, '../ui');

// Serve all files under Shrine/ as static assets
app.use(express.static(staticRoot));

// Fallback: for any non-API route, return index.html (SPA routing support)
app.get('*', (req, res) => {
  // If the request is for /api or /pulse, let those handlers run instead
  if (req.path.startsWith('/api') || req.path.startsWith('/pulse')) {
    return res.status(404).end();
  }
  res.sendFile(path.join(staticRoot, 'index.html'));
});

////////////////////////////////////////////////////////////////////////////////
// 4) WebSocket “pulse”
////////////////////////////////////////////////////////////////////////////////

const wss = new WebSocket.Server({
  server,
  path: '/pulse'
});

wss.on('connection', socket => {
  console.log('🔌 Pulse client connected');

  // Send a “heartbeat” every second
  const interval = setInterval(() => {
    socket.send(JSON.stringify({
      type:  'pulse',
      time:  Date.now()
    }));
  }, 1000);

  socket.on('close', () => {
    clearInterval(interval);
    console.log('❌ Pulse client disconnected');
  });

  socket.on('error', err => {
    console.error('🛑 WebSocket error:', err);
  });
});

////////////////////////////////////////////////////////////////////////////////
// 5) Launch on port 3000
////////////////////////////////////////////////////////////////////////////////

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Shrine + API + WebSocket running at http://localhost:${PORT}/`);
});
