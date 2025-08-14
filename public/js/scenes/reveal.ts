import type { S2C } from '../net';
import type { Scene } from './scene-manager';

/** Shows the correct answer and score changes. */
export class RevealScene implements Scene {
  private el?: HTMLElement;
  mount(root: HTMLElement): void {
    this.el = document.createElement('div');
    this.el.textContent = 'Reveal';
    root.innerHTML = '';
    root.appendChild(this.el);
  }
  unmount(): void {
    this.el?.remove();
  }
  onMessage(_msg: S2C): void {
    // animate reveal
  }
}
