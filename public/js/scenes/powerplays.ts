import type { S2C } from '../net';
import type { Scene } from './scene-manager';

/** Scene for selecting power plays. */
export class PowerPlaysScene implements Scene {
  private el?: HTMLElement;
  mount(root: HTMLElement): void {
    this.el = document.createElement('div');
    this.el.textContent = 'Power Plays';
    root.innerHTML = '';
    root.appendChild(this.el);
  }
  unmount(): void {
    this.el?.remove();
  }
  onMessage(_msg: S2C): void {
    // handle power play updates
  }
}
