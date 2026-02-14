import { socket } from "./socket.js";

const chatDrawer = document.getElementById("chat-drawer");
const chatBtn = document.getElementById("chat-toggle");
const closeBtn = document.getElementById("close-chat");
const notifBadge = document.getElementById("notif-badge");
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

let isChatOpen = false;

export function initChat() {
    // Open Chat
    chatBtn.addEventListener("click", () => {
        isChatOpen = true;
        chatDrawer.classList.remove("hidden");
        notifBadge.classList.add("hidden"); 
        chatInput.focus();
    });

    // Close Chat
    closeBtn.addEventListener("click", () => {
        isChatOpen = false;
        chatDrawer.classList.add("hidden");
    });

    // Send Message
    sendBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    // Receive Message
    socket.on("receive-message", (data) => {
        appendMessage("Partner", data.text, "partner");
        
        if (!isChatOpen) {
            notifBadge.classList.remove("hidden");
        }
    });
}

function sendMessage() {
    const text = chatInput.value.trim();
    if (text) {
        const messageData = { user: "Me", text };
        
        // Emit to Socket Server
        socket.emit("send-message", messageData);
        
        // Append to own UI
        appendMessage("Me", text, "me");
        chatInput.value = "";
    }
}

function appendMessage(user, text, type) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message-bubble ${type}`;
    
    msgDiv.innerHTML = `
       
        <p class="text-content">${text}</p>
    `;
    
    chatBox.appendChild(msgDiv);
    
    // Auto-scroll to bottom
    chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: 'smooth'
    });
}