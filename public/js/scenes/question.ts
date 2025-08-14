import type { S2C } from '../net';
import type { Scene } from './scene-manager';

/** Shows the question and answer choices. */
export class QuestionScene implements Scene {
  private el?: HTMLElement;
  mount(root: HTMLElement): void {
    this.el = document.createElement('div');
    this.el.textContent = 'Question';
    root.innerHTML = '';
    root.appendChild(this.el);
  }
  unmount(): void {
    this.el?.remove();
  }
  onMessage(_msg: S2C): void {
    // update question state
  }
}
