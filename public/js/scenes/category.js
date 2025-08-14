/** Scene where players vote on a category. */
export class CategoryScene {
    mount(root) {
        this.el = document.createElement('div');
        this.el.textContent = 'Category vote';
        root.innerHTML = '';
        root.appendChild(this.el);
    }
    unmount() {
        this.el?.remove();
    }
    onMessage(_msg) {
        // handle incoming votes
    }
}
