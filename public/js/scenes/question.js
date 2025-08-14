/** Shows the question and answer choices. */
export class QuestionScene {
    mount(root) {
        this.el = document.createElement('div');
        this.el.textContent = 'Question';
        root.innerHTML = '';
        root.appendChild(this.el);
    }
    unmount() {
        this.el?.remove();
    }
    onMessage(_msg) {
        // update question state
    }
}
