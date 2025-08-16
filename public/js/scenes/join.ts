import type { S2C } from '../net';
import type { Scene } from './scene-manager';
import { randomAvatar } from '../ui/avatars';

/** Join scene for players to enter room code and name. */
export class JoinScene implements Scene {
  private el?: HTMLElement;
  private onJoin?: (code: string, name: string) => void;

  constructor(onJoin?: (code: string, name: string) => void) {
    this.onJoin = onJoin;
  }

  mount(root: HTMLElement): void {
    this.el = document.createElement('div');
    this.el.className = 'join-scene';
    this.el.innerHTML = `
      <div class="join-content">
        <h1>ScreenFun</h1>
        <p class="instruction">Voer de kamercode in om deel te nemen</p>
        
        <form id="join-form" class="join-form">
          <input 
            type="text" 
            id="room-code" 
            placeholder="Kamercode" 
            autocomplete="off"
            maxlength="6"
            pattern="[A-Z0-9]{4,6}"
            required
          />
          <input 
            type="text" 
            id="player-name" 
            placeholder="Jouw naam" 
            autocomplete="name"
            maxlength="20"
            required
          />
          <button type="submit" class="btn">Deelnemen</button>
        </form>
        
        <div id="join-error" class="error" style="display: none;"></div>
      </div>
    `;
    
    root.innerHTML = '';
    root.appendChild(this.el);
    
    // Set up form handling
    const form = this.el.querySelector('#join-form') as HTMLFormElement;
    const codeInput = this.el.querySelector('#room-code') as HTMLInputElement;
    const nameInput = this.el.querySelector('#player-name') as HTMLInputElement;
    const errorDiv = this.el.querySelector('#join-error') as HTMLElement;
    
    // Auto-uppercase room code
    codeInput.addEventListener('input', () => {
      codeInput.value = codeInput.value.toUpperCase();
    });
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = codeInput.value.trim();
      const name = nameInput.value.trim();
      
      if (!code || !name) {
        this.showError('Vul zowel kamercode als naam in');
        return;
      }
      
      this.onJoin?.(code, name);
    });
    
    // Focus on first input
    codeInput.focus();
  }

  unmount(): void {
    this.el?.remove();
  }

  onMessage(msg: S2C): void {
    // Handle join responses or errors
    if (msg.t === 'room') {
      // Successfully joined - this will trigger scene change in player.ts
      return;
    }
  }

  showError(message: string): void {
    const errorDiv = this.el?.querySelector('#join-error') as HTMLElement;
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    }
  }
}