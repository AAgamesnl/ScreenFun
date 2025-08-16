import { Net } from "./net";
import { SceneManager } from "./scenes/scene-manager";
import { LobbyScene } from "./scenes/lobby";

// Entry point for host (TV) screen
const net = new Net();
const sceneRoot = document.getElementById("scene");
const scenes = new SceneManager(sceneRoot);
scenes.set(new LobbyScene());

// Forward messages from server to active scene
net.onMessage((msg) => scenes.dispatch(msg));

// Handle QR code updates
net.socket.on("qr:update", (data) => {
  const qrEl = document.getElementById("qr");
  if (qrEl && data.dataUrl) {
    qrEl.src = data.dataUrl;
    qrEl.style.display = "block";
  }
});

// Example: automatically create a room on load
net.send({ t: "host:create" });
