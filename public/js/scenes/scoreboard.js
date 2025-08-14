/** Displays the scoreboard between rounds. */
export class ScoreboardScene {
    mount(root) {
        this.el = document.createElement('div');
        this.el.textContent = 'Scoreboard';
        root.innerHTML = '';
        root.appendChild(this.el);
    }
    unmount() {
        this.el?.remove();
    }
    onMessage(_msg) {
        // update scores
    }
}
