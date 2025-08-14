/** Lobby scene showing room code and players. */
export class LobbyScene {
    mount(root) {
        this.el = document.createElement('div');
        this.el.textContent = 'Lobby';
        root.innerHTML = '';
        root.appendChild(this.el);
    }
    unmount() {
        this.el?.remove();
    }
    onMessage(_msg) {
        // Handle lobby-specific messages
    }
}
