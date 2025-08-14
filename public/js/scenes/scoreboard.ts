import type { S2C } from '../net';
import type { Scene } from './scene-manager';

/** Displays the scoreboard between rounds. */
export class ScoreboardScene implements Scene {
  private el?: HTMLElement;
  mount(root: HTMLElement): void {
    this.el = document.createElement('div');
    this.el.textContent = 'Scoreboard';
    root.innerHTML = '';
    root.appendChild(this.el);
  }
  unmount(): void {
    this.el?.remove();
  }
  onMessage(_msg: S2C): void {
    // update scores
  }
}
