/** Finale scene showing the last race for victory. */
export class FinaleScene {
    mount(root) {
        this.el = document.createElement('div');
        this.el.textContent = 'Finale';
        root.innerHTML = '';
        root.appendChild(this.el);
    }
    unmount() {
        var _a;
        (_a = this.el) === null || _a === void 0 ? void 0 : _a.remove();
    }
    onMessage(_msg) {
        // handle finale ticks
    }
}
