/** Shows the correct answer and score changes. */
export class RevealScene {
    mount(root) {
        this.el = document.createElement('div');
        this.el.textContent = 'Reveal';
        root.innerHTML = '';
        root.appendChild(this.el);
    }
    unmount() {
        var _a;
        (_a = this.el) === null || _a === void 0 ? void 0 : _a.remove();
    }
    onMessage(_msg) {
        // animate reveal
    }
}
