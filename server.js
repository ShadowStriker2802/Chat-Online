const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

// Use Render-assigned port dynamically
const PORT = process.env.PORT || 5000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve index.html when visiting "/"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle WebSocket connections properly
server.on('upgrade', (request, socket, head) => {
    if (request.url === "/ws") {  // Ensure WebSocket listens only at "/ws"
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();  // Reject other upgrade requests
    }
});

// WebSocket event handling
wss.on('connection', (ws) => {
    console.log('New WebSocket client connected.');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);

        // Broadcast message to all clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => console.log('Client disconnected.'));
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
