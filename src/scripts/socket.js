import { io } from "socket.io-client";

const SOCKET_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3001" 
    : "https://my-stream-ig0h.onrender.com"; // Your actual Render URL

export const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'] // Helps with connection stability
});