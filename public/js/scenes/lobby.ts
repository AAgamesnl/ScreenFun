import type { S2C, PlayerInfo } from "../net";
import type { Scene } from "./scene-manager";
import type { Net } from "../net";

/** Lobby scene showing room code and players. */
export class LobbyScene implements Scene {
  private el?: HTMLElement;
  private roomCode?: string;
  private players: PlayerInfo[] = [];
  private net: Net | undefined;

  constructor(net?: Net) {
    this.net = net;
  }

  mount(root: HTMLElement): void {
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

  unmount(): void {
    this.el?.remove();
  }

  onMessage(msg: S2C): void {
    if (msg.t === "room") {
      this.roomCode = msg.code;
      this.players = msg.players;
      this.updateDisplay();

      // Generate QR code when we get room info
      if (this.roomCode && this.net) {
        const joinUrl = `${window.location.origin}/player.html?code=${this.roomCode}`;
        this.net.requestQRCode(joinUrl, (dataUrl) => {
          if (dataUrl) {
            const qrImg = document.getElementById('qr') as HTMLImageElement;
            if (qrImg) {
              qrImg.src = dataUrl;
            }
          }
        });
      }
    }
  }

  private updateDisplay(): void {
    this.updateRoomDisplay();
    this.updatePlayersDisplay();
  }

  private updateRoomDisplay(): void {
    const roomCodeEl = document.getElementById("roomCode");
    if (roomCodeEl && this.roomCode) {
      roomCodeEl.textContent = `Room: ${this.roomCode}`;
    }
  }

  private updatePlayersDisplay(): void {
    const playersEl = document.getElementById("players-list");
    if (playersEl) {
      if (this.players.length === 0) {
        playersEl.innerHTML =
          '<p class="no-players">Geen spelers verbonden</p>';
      } else {
        playersEl.innerHTML = this.players
          .map(
            (player) =>
              `<div class="player ${player.ready ? "ready" : "not-ready"}">
            ${player.name} ${player.ready ? "✓" : "⏳"}
           </div>`
          )
          .join("");
      }
    }
  }

  private generateQRCode(): void {
    if (this.roomCode && this.net) {
      console.log("Generating QR code for room:", this.roomCode);
      // Construct the join URL
      const baseUrl = window.location.origin;
      const joinUrl = `${baseUrl}/player.html?code=${this.roomCode}`;
      console.log("Join URL:", joinUrl);

      // Request QR code generation
      this.net.send({ t: 'host:qr', joinUrl });
    } else {
      console.log("Cannot generate QR code - missing room code or net instance:", { roomCode: this.roomCode, hasNet: !!this.net });
    }
  }

  private displayQRCode(dataUrl: string): void {
    console.log("Displaying QR code:", dataUrl.substring(0, 50) + "...");
    const qrImg = document.getElementById("qr") as HTMLImageElement;
    if (qrImg) {
      qrImg.src = dataUrl;
      qrImg.style.display = "block";
      console.log("QR code image updated");
    } else {
      console.error("QR code image element not found");
    }
  }
}
