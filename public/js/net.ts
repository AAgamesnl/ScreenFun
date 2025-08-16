// Networking helpers and typed protocol for ScreenFun

export type PlayerInfo = {
  id: string;
  name: string;
  avatar: string;
  score: number;
  ready: boolean;
};

export type C2S =
  | { t: 'host:create' }
  | { t: 'player:join'; code: string; name: string; avatar: string }
  | { t: 'player:ready'; code: string; ready: boolean }
  | { t: 'category:vote'; pick: number }
  | { t: 'pp:select'; kind: 'Freeze' | 'Gloop' | 'Double'; targetId?: string }
  | { t: 'answer'; roundId: string; choiceIndex: number; sentAt: number }
  | { t: 'ping'; t0: number };

export type S2C =
  | { t: 'room'; code: string; players: PlayerInfo[]; state: string }
  | { t: 'category'; options: string[]; endsAt: number }
  | { t: 'powerplays'; options: string[]; endsAt: number }
  | { t: 'question'; roundId: string; text: string; choices: string[]; endsAt: number }
  | { t: 'reveal'; roundId: string; correct: number; deltas: Record<string, number> }
  | { t: 'scoreboard'; board: Array<{ id: string; name: string; score: number }> }
  | { t: 'finale:start'; steps: number }
  | { t: 'finale:tick'; leaders: Array<{ id: string; step: number }> }
  | { t: 'power'; type: string; from: string }
  | { t: 'pong'; t0: number; t1: number; hostNow: number };

// Wrapper around the Socket.IO client. Exposes typed send and receive helpers.
export class Net {
  private socket: { emit: (event: string, ...args: unknown[]) => void; on: (event: string, callback: (...args: unknown[]) => void) => void };
  private messageCallbacks: Array<(msg: S2C) => void> = [];

  constructor() {
    // io global is injected via /socket.io/socket.io.js
    this.socket = (window as unknown as { io: () => { emit: (event: string, ...args: unknown[]) => void; on: (event: string, callback: (...args: unknown[]) => void) => void } }).io();
    
    // Set up listeners for server-to-client events
    this.socket.on('lobby:update', (...args) => {
      const payload = args[0] as { code: string; players: PlayerInfo[]; state: string };
      this.messageCallbacks.forEach(cb => cb({ t: 'room', code: payload.code, players: payload.players, state: payload.state }));
    });

    this.socket.on('question:show', (...args) => {
      const payload = args[0] as { id: string; text: string; options: string[]; durationMs: number; serverNow: number; deadline: number };
      this.messageCallbacks.forEach(cb => cb({ t: 'question', roundId: payload.id, text: payload.text, choices: payload.options, endsAt: payload.deadline }));
    });

    this.socket.on('question:result', (...args) => {
      const payload = args[0] as { correctIndex: number; players: Array<{ id: string; name: string; answer: number | null; correct: boolean; score: number }> };
      const deltas: Record<string, number> = {};
      payload.players.forEach(p => { deltas[p.id] = p.score; });
      this.messageCallbacks.forEach(cb => cb({ t: 'reveal', roundId: 'current', correct: payload.correctIndex, deltas }));
    });

    this.socket.on('scoreboard:update', (...args) => {
      const payload = args[0] as Array<{ id: string; name: string; score: number }>;
      this.messageCallbacks.forEach(cb => cb({ t: 'scoreboard', board: payload }));
    });

    this.socket.on('power:applied', (...args) => {
      const payload = args[0] as { type: string; from: string };
      this.messageCallbacks.forEach(cb => cb({ t: 'power', type: payload.type, from: payload.from }));
    });

    this.socket.on('time:pong', (...args) => {
      const payload = args[0] as { t0: number; t1: number };
      this.messageCallbacks.forEach(cb => cb({ t: 'pong', t0: payload.t0, t1: payload.t1, hostNow: Date.now() }));
    });
  }

  /** Send a typed message to the server. */
  send(msg: C2S): void {
    if (msg.t === 'host:create') {
      this.socket.emit('host:createRoom');
    } else if (msg.t === 'player:join') {
      this.socket.emit('player:join', { code: msg.code, name: msg.name, avatar: msg.avatar });
    } else if (msg.t === 'player:ready') {
      this.socket.emit('player:ready', { code: msg.code, ready: msg.ready });
    } else if (msg.t === 'ping') {
      this.socket.emit('time:ping', msg.t0);
    } else {
      console.warn('Unhandled message type:', msg);
    }
  }

  /** Register a listener for server messages. */
  onMessage(cb: (msg: S2C) => void): void {
    this.messageCallbacks.push(cb);
  }

  /** Utility for ping/pong clock sync. */
  ping(): void {
    const t0 = Date.now();
    this.send({ t: 'ping', t0 });
  }
}
