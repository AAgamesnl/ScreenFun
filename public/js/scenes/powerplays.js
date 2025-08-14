/** Scene for selecting power plays. */
export class PowerPlaysScene {
    mount(root) {
        this.el = document.createElement('div');
        this.el.textContent = 'Power Plays';
        root.innerHTML = '';
        root.appendChild(this.el);
    }
    unmount() {
        this.el?.remove();
    }
    onMessage(_msg) {
        // handle power play updates
    }
}
