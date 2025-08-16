import type { S2C, PlayerInfo } from '../net';
import type { Scene } from './scene-manager';

/** Lobby scene showing room code and players. */
export class LobbyScene implements Scene {
  private el?: HTMLElement;
  private roomCode?: string;
  private players: PlayerInfo[] = [];

  mount(root: HTMLElement): void {
    this.el = document.createElement('div');
    this.el.className = 'lobby-scene';
    this.el.innerHTML = `
      <div class="lobby-content">
        <h1>Wacht op spelers...</h1>
        <div id="players-list"></div>
        <p class="instruction">Scan de QR-code of ga naar de URL om deel te nemen</p>
      </div>
    `;
    root.innerHTML = '';
    root.appendChild(this.el);
    this.updateDisplay();
  }

  unmount(): void {
    this.el?.remove();
  }

  onMessage(msg: S2C): void {
    if (msg.t === 'room') {
      this.roomCode = msg.code;
      this.players = msg.players;
      this.updateDisplay();
    }
  }

  private updateDisplay(): void {
    this.updateRoomDisplay();
    this.updatePlayersDisplay();
  }

  private updateRoomDisplay(): void {
    const roomCodeEl = document.getElementById('roomCode');
    if (roomCodeEl && this.roomCode) {
      roomCodeEl.textContent = `Room: ${this.roomCode}`;
    }
  }

  private updatePlayersDisplay(): void {
    const playersEl = document.getElementById('players-list');
    if (playersEl) {
      if (this.players.length === 0) {
        playersEl.innerHTML = '<p class="no-players">Geen spelers verbonden</p>';
      } else {
        playersEl.innerHTML = this.players.map(player => 
          `<div class="player ${player.ready ? 'ready' : 'not-ready'}">
            ${player.name} ${player.ready ? '✓' : '⏳'}
           </div>`
        ).join('');
      }
    }
  }
}
