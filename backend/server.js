const express = require('express');
const WebSocket = require('ws');
const net = require('net');
const path = require('path');

const app = express();
const wss = new WebSocket.Server({ port: 8080 });

// Serve static files from React app
app.use(express.static(path.join(__dirname, 'build')));

// WebSocket to handle connections
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

// Endpoint to start camera feed (example)
app.post('/start-camera', (req, res) => {
  const ffmpeg = spawn('ffmpeg', ['-i', 'rtsp://your_camera_url', '-f', 'mpegts', 'udp://localhost:1234']);
  res.sendStatus(200);
});

function checkConnection() {
  net.isIP('192.168.0.1') ? setConnected(true) : setConnected(false);
}

setInterval(checkConnection, 5000);

function setConnected(status) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ connected: status }));
    }
  });
}

app.listen(3000, () => console.log('Server listening on port 3000'));
