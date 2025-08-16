/** Scene where players vote on a category. */
export class CategoryScene {
    mount(root) {
        this.el = document.createElement('div');
        this.el.textContent = 'Category vote';
        root.innerHTML = '';
        root.appendChild(this.el);
    }
    unmount() {
        var _a;
        (_a = this.el) === null || _a === void 0 ? void 0 : _a.remove();
    }
    onMessage(_msg) {
        // handle incoming votes
    }
}
