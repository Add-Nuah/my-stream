import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());

// Health check for Render deployment
app.get('/', (req, res) => {
    res.send('Cinema Server is running...');
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://ourstreame.netlify.app/", // Replace with your Netlify URL in production
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`Connected: ${socket.id}`);

    // Automatically join the private room
    const ROOM_ID = "private-cinema";
    socket.join(ROOM_ID);

    // --- 1. Chat Logic ---
    socket.on("send-message", (data) => {
        // Broadcast to everyone in the room except the sender
        socket.to(ROOM_ID).emit("receive-message", data);
    });

    // --- 2. Auto-Sync Logic ---
    socket.on("video-control", (data) => {
        console.log(`Action: ${data.action} | Time: ${data.time || 'N/A'}`);
        
        // Broadcast the action to the partner
        socket.to(ROOM_ID).emit("sync-video", {
            action: data.action,
            time: data.time,
            timestamp: Date.now()
        });
    });

    socket.on('disconnect', () => {
        console.log(`Disconnected: ${socket.id}`);
    });
});

// Render provides a port via process.env.PORT
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is live on port ${PORT}`);
});