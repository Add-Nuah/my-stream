import { io } from "socket.io-client";

// When testing locally, use "http://localhost:3001"
// When deployed, use your Render URL: "https://your-app.onrender.com"
const SOCKET_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3001" 
    : "https://your-render-backend-url.onrender.com"; 

export const socket = io(SOCKET_URL);