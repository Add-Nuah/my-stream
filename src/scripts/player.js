import { socket } from "./socket.js";

export function initPlayer() {
    const iframe = document.getElementById("main-player");
    let lastReportedTime = 0;
    let isRemoteAction = false;

    // --- 1. RECEIVE FROM PARTNER ---
    socket.on("sync-video", (data) => {
        isRemoteAction = true; // Prevents infinite loops
        const playerWindow = iframe.contentWindow;

        if (data.action === "play") {
            playerWindow.postMessage('{"event":"command","func":"playVideo"}', "*");
        } else if (data.action === "pause") {
            playerWindow.postMessage('{"event":"command","func":"pauseVideo"}', "*");
        }
        
        if (data.time) {
            playerWindow.postMessage(`{"event":"command","func":"seekTo","args":[${data.time}, true]}`, "*");
        }

        // Reset the flag after a short delay
        setTimeout(() => { isRemoteAction = false; }, 500);
    });

    // --- 2. LISTEN FOR LOCAL ACTIONS ---
    window.addEventListener("message", (event) => {
        if (!event.origin.includes("mediadelivery.net")) return;

        try {
            const data = JSON.parse(event.data);

            // Handle State Changes (Play/Pause)
            if (data.event === "onStateChange" && !isRemoteAction) {
                // 1 = Playing, 2 = Paused
                const action = data.info === 1 ? "play" : "pause";
                
                // When pausing, we send the exact timestamp so the partner pauses at the same spot
                iframe.contentWindow.postMessage('{"event":"command","func":"getCurrentTime"}', "*");
                
                socket.emit("video-control", { action });
            }

            // Handle Time Updates (For Auto-Correction)
            if (data.event === "infoDelivery" && data.info && data.info.currentTime) {
                const currentTime = data.info.currentTime;
                
                // If we detected a manual "Seek" (jump in time > 3 seconds)
                if (Math.abs(currentTime - lastReportedTime) > 3 && !isRemoteAction) {
                    socket.emit("video-control", { 
                        action: "seek", 
                        time: currentTime 
                    });
                }
                lastReportedTime = currentTime;
            }
        } catch (err) {}
    });

    // --- 3. THE "UNDER THE HOOD" HEARTBEAT ---
    // Every 5 seconds, ensure we are synced. Only the "leader" (the one who joined first) sends this.
    setInterval(() => {
        if (!isRemoteAction) {
            iframe.contentWindow.postMessage('{"event":"command","func":"getCurrentTime"}', "*");
        }
    }, 5000);
}