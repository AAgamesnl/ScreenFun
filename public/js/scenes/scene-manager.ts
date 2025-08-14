import type { S2C } from '../net';

/** Interface implemented by all scenes. */
export interface Scene {
  /** Called when the scene becomes active. */
  mount(root: HTMLElement): void;
  /** Called before the scene is removed. */
  unmount(): void;
  /** Handle a server message relevant to this scene. */
  onMessage(msg: S2C): void;
}

/** Simple scene manager keeping only a single active scene. */
export class SceneManager {
  private current: Scene | null = null;
  constructor(private root: HTMLElement) {}

  /** Replace the currently active scene. */
  set(scene: Scene): void {
    this.current?.unmount();
    this.current = scene;
    this.current.mount(this.root);
  }

  /** Forward a message to the active scene. */
  dispatch(msg: S2C): void {
    this.current?.onMessage(msg);
  }
}
