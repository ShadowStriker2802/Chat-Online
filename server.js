const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket("https://chat-online-bsxm.onrender.com/"); // Your live server URL

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname)));

// Serve index.html when visiting "/"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

server.on('upgrade', (request, socket, head) => {
    if (request.url === "/ws") { // Ensure WebSocket only runs on "/ws" path
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy(); // Prevent unknown upgrade requests
    }
});


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

// Start Server
server.listen(5000, () => {
    console.log('Server running on port 5000');
});
