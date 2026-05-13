/**
 * Mono Game Server - Modular Entry Point
 * 
 * This is the main server file that sets up Express and Socket.IO,
 * then delegates to specialized handler modules.
 */
const express = require('express');
const app = express();
app.use(express.json());
const http = require('http');
const server = http.createServer(app);
const socketIO = require("socket.io");
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const path = require('path');

// Import handler modules and RoomManager
const RoomManager = require('./server/RoomManager.cjs');
const { getLocalIp } = require('./server/utils.cjs');
const { setupRoomHandlers } = require('./server/roomHandlers.cjs');
const { setupGameHandlers } = require('./server/gameHandlers.cjs');
const { setupLanHandlers } = require('./server/lanHandlers.cjs');
const { setupDisconnectHandler } = require('./server/disconnectHandler.cjs');

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// --- Proxy Endpoints ---
app.get('/api/ddg-proxy', async (req, res) => {
  const word = req.query.q;
  if (!word) return res.json({});
  try {
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(word)}&format=json&l=es-es`);
    const data = await response.ok ? await response.json() : {};
    res.json(data);
  } catch (error) {
    res.json({});
  }
});

app.post('/api/hf-proxy', async (req, res) => {
  const { prompt, token } = req.body;
  if (!prompt || !token) return res.status(400).json({ error: 'Missing parameters' });
  try {
    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: `[INST] ${prompt} [/INST]`,
        parameters: { max_new_tokens: 15, return_full_text: false, temperature: 0.9 }
      })
    });
    
    const data = await response.json().catch(() => null);
    
    if (!response.ok) {
      console.error('HF Proxy inner error:', response.status, data);
      return res.status(response.status).json(data || { error: 'Unknown HF Error' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('HF proxy catastrophic failure:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/scrape-slang', async (req, res) => {
  const word = req.query.w;
  if (!word) return res.json({ text: '' });

  try {
    // We fetch raw HTML strings concurrently and silence any internal network errors
    const [argHtml, asiHtml] = await Promise.all([
      fetch(`https://www.diccionarioargentino.com/term/${encodeURIComponent(word)}`)
        .then(r => r.ok ? r.text() : '').catch(() => ''),
      fetch(`https://www.asihablamos.com/word/palabra/${encodeURIComponent(word)}.php`)
        .then(r => r.ok ? r.text() : '').catch(() => '')
    ]);

    // Strip script and style blocks entirely, then strip remaining HTML tags to extract pure string text
    // We also forcefully cut off any text appearing after 'Sinónimos' so it ignores easy synonyms.
    const cleanText = (argHtml + ' ' + asiHtml)
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]*>?/gm, ' ')
      .split(/Sin[oó]nimos/i)[0];

    res.json({ text: cleanText });
  } catch (error) {
    console.error('Slang proxy scrub failed:', error);
    res.json({ text: '' });
  }
});

// SPA fallback for client-side routing
app.use((req, res, next) => {
  if (req.path.startsWith('/socket.io') ||
    req.method !== 'GET' ||
    !req.accepts('html')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Initialize RoomManager
const roomManager = new RoomManager(io);

// Socket.IO connection handler
io.on('connection', (socket) => {
  const clientIp = socket.handshake.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || socket.handshake.address;
  console.log('A user connected:', socket.id, 'IP:', clientIp);

  // Setup all handler modules
  setupRoomHandlers(socket, roomManager, clientIp);
  setupGameHandlers(socket, roomManager);
  setupLanHandlers(socket, roomManager, clientIp);
  setupDisconnectHandler(socket, roomManager);
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  const ip = getLocalIp();
  console.log(`Server running on port ${PORT}`);
  console.log(`Local Access: http://localhost:${PORT}`);
  console.log(`Network Access: http://${ip}:${PORT}`);
});
