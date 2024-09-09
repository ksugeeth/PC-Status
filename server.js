const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

let pcState = {
    chuckle: {
        user: '',
        status: 'Free',
        endTime: null
    },
    giggle: {
        user: '',
        status: 'Free',
        endTime: null
    }
};

// Create an HTTP server and a WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Broadcast state to all connected clients
function broadcastState() {
    const state = JSON.stringify(pcState);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(state);
        }
    });
}

wss.on('connection', (ws) => {
    // Send the current state to the new client
    ws.send(JSON.stringify(pcState));

    ws.on('message', (message) => {
        // Handle incoming messages if needed
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

app.get('/status', (req, res) => {
    res.json(pcState);
});

app.post('/update', (req, res) => {
    const { pc, user, remainingTime } = req.body;
    if (pcState[pc]) {
        pcState[pc].user = user;
        pcState[pc].status = `${user} is using this PC`;
        pcState[pc].endTime = Date.now() + remainingTime * 1000;
        broadcastState();  // Broadcast the updated state
    }
    res.sendStatus(200);
});

app.post('/clear', (req, res) => {
    const { pc } = req.body;
    if (pcState[pc]) {
        pcState[pc].user = '';
        pcState[pc].status = 'Free';
        pcState[pc].endTime = null;
        broadcastState();  // Broadcast the cleared state
    }
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
