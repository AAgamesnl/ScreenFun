/** Lobby scene showing room code and players. */
export class LobbyScene {
    constructor(net) {
        this.players = [];
        this.net = net;
    }
    mount(root) {
        this.el = document.createElement("div");
        this.el.className = "lobby-scene";
        this.el.innerHTML = `
      <div class="lobby-content">
        <h1>Wacht op spelers...</h1>
        <div id="players-list"></div>
        <p class="instruction">Scan de QR-code of ga naar de URL om deel te nemen</p>
      </div>
    `;
        root.innerHTML = "";
        root.appendChild(this.el);
        this.updateDisplay();
    }
    unmount() {
        var _a;
        (_a = this.el) === null || _a === void 0 ? void 0 : _a.remove();
    }
    onMessage(msg) {
        if (msg.t === "room") {
            this.roomCode = msg.code;
            this.players = msg.players;
            this.updateDisplay();
            // Generate QR code when we get room info
            if (this.roomCode && this.net) {
                const joinUrl = `${window.location.origin}/player.html?code=${this.roomCode}`;
                this.net.requestQRCode(joinUrl, (dataUrl) => {
                    if (dataUrl) {
                        const qrImg = document.getElementById('qr');
                        if (qrImg) {
                            qrImg.src = dataUrl;
                        }
                    }
                });
            }
        }
    }
    updateDisplay() {
        this.updateRoomDisplay();
        this.updatePlayersDisplay();
    }
    updateRoomDisplay() {
        const roomCodeEl = document.getElementById("roomCode");
        if (roomCodeEl && this.roomCode) {
            roomCodeEl.textContent = `Room: ${this.roomCode}`;
        }
    }
    updatePlayersDisplay() {
        const playersEl = document.getElementById("players-list");
        if (playersEl) {
            if (this.players.length === 0) {
                playersEl.innerHTML =
                    '<p class="no-players">Geen spelers verbonden</p>';
            }
            else {
                playersEl.innerHTML = this.players
                    .map((player) => `<div class="player ${player.ready ? "ready" : "not-ready"}">
            ${player.name} ${player.ready ? "✓" : "⏳"}
           </div>`)
                    .join("");
            }
        }
    }
}
