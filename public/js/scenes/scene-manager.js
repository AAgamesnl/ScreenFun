/** Simple scene manager keeping only a single active scene. */
export class SceneManager {
    constructor(root) {
        this.root = root;
        this.current = null;
    }
    /** Replace the currently active scene. */
    set(scene) {
        var _a;
        (_a = this.current) === null || _a === void 0 ? void 0 : _a.unmount();
        this.current = scene;
        this.current.mount(this.root);
    }
    /** Forward a message to the active scene. */
    dispatch(msg) {
        var _a;
        (_a = this.current) === null || _a === void 0 ? void 0 : _a.onMessage(msg);
    }
}
