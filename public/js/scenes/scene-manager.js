/** Simple scene manager keeping only a single active scene. */
export class SceneManager {
    constructor(root) {
        this.root = root;
        this.current = null;
    }
    /** Replace the currently active scene. */
    set(scene) {
        this.current?.unmount();
        this.current = scene;
        this.current.mount(this.root);
    }
    /** Forward a message to the active scene. */
    dispatch(msg) {
        this.current?.onMessage(msg);
    }
}
