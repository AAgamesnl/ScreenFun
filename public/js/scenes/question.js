/** Shows the question and answer choices. */
export class QuestionScene {
    mount(root) {
        this.el = document.createElement('div');
        this.el.textContent = 'Question';
        root.innerHTML = '';
        root.appendChild(this.el);
    }
    unmount() {
        var _a;
        (_a = this.el) === null || _a === void 0 ? void 0 : _a.remove();
    }
    onMessage(_msg) {
        // update question state
    }
}
