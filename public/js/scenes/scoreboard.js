/** Displays the scoreboard between rounds. */
export class ScoreboardScene {
    mount(root) {
        this.el = document.createElement('div');
        this.el.textContent = 'Scoreboard';
        root.innerHTML = '';
        root.appendChild(this.el);
    }
    unmount() {
        var _a;
        (_a = this.el) === null || _a === void 0 ? void 0 : _a.remove();
    }
    onMessage(_msg) {
        // update scores
    }
}
