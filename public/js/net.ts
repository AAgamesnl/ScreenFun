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
  | { t: 'player:ready'; ready: boolean }
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
  | { t: 'pong'; t0: number; hostNow: number };

// Wrapper around the Socket.IO client. Exposes typed send and receive helpers.
export class Net {
  private socket: { emit: (event: string, data?: unknown) => void; on: (event: string, callback: (data: unknown) => void) => void };
  constructor() {
    // io global is injected via /socket.io/socket.io.js
    this.socket = (window as unknown as { io: () => { emit: (event: string, data?: unknown) => void; on: (event: string, callback: (data: unknown) => void) => void } }).io();
  }

  /** Send a typed message to the server. */
  send(msg: C2S): void {
    this.socket.emit('msg', msg);
  }

  /** Register a listener for server messages. */
  onMessage(cb: (msg: S2C) => void): void {
    this.socket.on('msg', cb as (data: unknown) => void);
  }

  /** Utility for ping/pong clock sync. */
  ping(): void {
    const t0 = Date.now();
    this.send({ t: 'ping', t0 });
  }
}
