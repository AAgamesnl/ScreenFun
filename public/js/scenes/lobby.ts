import type { S2C } from '../net';
import type { Scene } from './scene-manager';

/** Lobby scene showing room code and players. */
export class LobbyScene implements Scene {
  private el?: HTMLElement;
  mount(root: HTMLElement): void {
    this.el = document.createElement('div');
    this.el.textContent = 'Lobby';
    root.innerHTML = '';
    root.appendChild(this.el);
  }
  unmount(): void {
    this.el?.remove();
  }
  onMessage(_msg: S2C): void {
    // Handle lobby-specific messages
  }
}
