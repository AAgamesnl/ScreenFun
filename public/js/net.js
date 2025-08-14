// Networking helpers and typed protocol for ScreenFun
// Wrapper around the Socket.IO client. Exposes typed send and receive helpers.
export class Net {
    constructor() {
        // io global is injected via /socket.io/socket.io.js
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.socket = window.io();
    }
    /** Send a typed message to the server. */
    send(msg) {
        this.socket.emit('msg', msg);
    }
    /** Register a listener for server messages. */
    onMessage(cb) {
        this.socket.on('msg', cb);
    }
    /** Utility for ping/pong clock sync. */
    ping() {
        const t0 = Date.now();
        this.send({ t: 'ping', t0 });
    }
}
