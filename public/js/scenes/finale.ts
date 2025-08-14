import type { S2C } from '../net';
import type { Scene } from './scene-manager';

/** Finale scene showing the last race for victory. */
export class FinaleScene implements Scene {
  private el?: HTMLElement;
  mount(root: HTMLElement): void {
    this.el = document.createElement('div');
    this.el.textContent = 'Finale';
    root.innerHTML = '';
    root.appendChild(this.el);
  }
  unmount(): void {
    this.el?.remove();
  }
  onMessage(_msg: S2C): void {
    // handle finale ticks
  }
}
