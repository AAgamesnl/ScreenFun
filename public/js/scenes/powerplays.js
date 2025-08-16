/** Scene for selecting power plays. */
export class PowerPlaysScene {
    mount(root) {
        this.el = document.createElement('div');
        this.el.textContent = 'Power Plays';
        root.innerHTML = '';
        root.appendChild(this.el);
    }
    unmount() {
        var _a;
        (_a = this.el) === null || _a === void 0 ? void 0 : _a.remove();
    }
    onMessage(_msg) {
        // handle power play updates
    }
}
