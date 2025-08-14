import type { S2C } from '../net';
import type { Scene } from './scene-manager';

/** Scene where players vote on a category. */
export class CategoryScene implements Scene {
  private el?: HTMLElement;
  mount(root: HTMLElement): void {
    this.el = document.createElement('div');
    this.el.textContent = 'Category vote';
    root.innerHTML = '';
    root.appendChild(this.el);
  }
  unmount(): void {
    this.el?.remove();
  }
  onMessage(_msg: S2C): void {
    // handle incoming votes
  }
}
