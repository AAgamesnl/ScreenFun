import type { S2C, PlayerInfo } from '../net';
import type { Scene } from './scene-manager';

/** Player-side lobby scene showing room info and ready button. */
export class PlayerLobbyScene implements Scene {
  private el?: HTMLElement;
  private roomCode?: string;
  private players: PlayerInfo[] = [];
  private myId?: string;
  private onReady?: (ready: boolean) => void;

  constructor(onReady?: (ready: boolean) => void) {
    this.onReady = onReady;
  }

  mount(root: HTMLElement): void {
    this.el = document.createElement('div');
    this.el.className = 'player-lobby-scene';
    this.el.innerHTML = `
      <div class="player-lobby-content">
        <h1>Verbonden!</h1>
        <div id="room-info">
          <p id="room-code-display"></p>
          <p id="player-count"></p>
        </div>
        
        <div id="ready-section">
          <button id="ready-btn" class="btn">Klaar</button>
          <p id="ready-status"></p>
        </div>
        
        <div id="other-players">
          <h3>Andere spelers:</h3>
          <div id="players-list"></div>
        </div>
      </div>
    `;
    
    root.innerHTML = '';
    root.appendChild(this.el);
    
    // Set up ready button
    const readyBtn = this.el.querySelector('#ready-btn') as HTMLButtonElement;
    let isReady = false;
    
    readyBtn.addEventListener('click', () => {
      isReady = !isReady;
      this.onReady?.(isReady);
      this.updateReadyButton(isReady);
    });
    
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

  setMyId(id: string): void {
    this.myId = id;
  }

  private updateDisplay(): void {
    this.updateRoomInfo();
    this.updatePlayersDisplay();
  }

  private updateRoomInfo(): void {
    const roomCodeEl = this.el?.querySelector('#room-code-display');
    const playerCountEl = this.el?.querySelector('#player-count');
    
    if (roomCodeEl && this.roomCode) {
      roomCodeEl.textContent = `Kamer: ${this.roomCode}`;
    }
    
    if (playerCountEl) {
      const count = this.players.length;
      playerCountEl.textContent = `${count} speler${count !== 1 ? 's' : ''} verbonden`;
    }
  }

  private updatePlayersDisplay(): void {
    const playersEl = this.el?.querySelector('#players-list');
    if (!playersEl) return;
    
    const otherPlayers = this.players.filter(p => p.id !== this.myId);
    
    if (otherPlayers.length === 0) {
      playersEl.innerHTML = '<p class="no-players">Wacht op andere spelers...</p>';
    } else {
      playersEl.innerHTML = otherPlayers.map(player => 
        `<div class="player ${player.ready ? 'ready' : 'not-ready'}">
          ${player.name} ${player.ready ? '✓ Klaar' : '⏳ Wacht'}
         </div>`
      ).join('');
    }
  }

  private updateReadyButton(isReady: boolean): void {
    const readyBtn = this.el?.querySelector('#ready-btn') as HTMLButtonElement;
    const statusEl = this.el?.querySelector('#ready-status');
    
    if (readyBtn) {
      readyBtn.textContent = isReady ? 'Niet klaar' : 'Klaar';
      readyBtn.className = isReady ? 'btn secondary' : 'btn';
    }
    
    if (statusEl) {
      statusEl.textContent = isReady ? 'Je bent klaar! Wacht op anderen...' : 'Klik op "Klaar" als je klaar bent om te beginnen';
    }
  }
}