/**
 * shrinedaemon/src/index.js
 * – Express REST API
 * – WebSocket “pulse”
 * – Static UI serving (Shrine/)
 */

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const path      = require('path');
const express   = require('express');
const http      = require('http');
const WebSocket = require('ws');
const { GoogleGenerativeAI } = require('@google/generative-ai');

////////////////////////////////////////////////////////////////////////////////
// 1) Build Express app + HTTP server
////////////////////////////////////////////////////////////////////////////////

const app    = express();
const server = http.createServer(app);

// Initialize Gemini
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

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

// Gemini generation endpoint
app.post('/generate', express.json(), async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ 
        error: 'Gemini API key not configured. Set GEMINI_API_KEY in .env' 
      });
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ text });
  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: err.message });
  }
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
