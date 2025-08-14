/** Finale scene showing the last race for victory. */
export class FinaleScene {
    mount(root) {
        this.el = document.createElement('div');
        this.el.textContent = 'Finale';
        root.innerHTML = '';
        root.appendChild(this.el);
    }
    unmount() {
        this.el?.remove();
    }
    onMessage(_msg) {
        // handle finale ticks
    }
}
