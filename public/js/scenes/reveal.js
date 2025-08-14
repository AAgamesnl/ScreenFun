/** Shows the correct answer and score changes. */
export class RevealScene {
    mount(root) {
        this.el = document.createElement('div');
        this.el.textContent = 'Reveal';
        root.innerHTML = '';
        root.appendChild(this.el);
    }
    unmount() {
        this.el?.remove();
    }
    onMessage(_msg) {
        // animate reveal
    }
}
