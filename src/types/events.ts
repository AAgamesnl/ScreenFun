export interface ServerToClientEvents {
  // Lobby events
  'lobby:update': (payload: { 
    code: string; 
    players: Array<{ id: string; name: string; ready: boolean; score: number }>;
    state: string;
  }) => void;
  
  // Question events  
  'question:show': (payload: {
    id: string;
    text: string;
    options: string[];
    durationMs: number;
    serverNow: number;
    deadline: number;
    players: Array<{ id: string; name: string }>;
  }) => void;
  
  'question:result': (payload: {
    correctIndex: number;
    players: Array<{
      id: string;
      name: string;
      answer: number | null;
      correct: boolean;
      score: number;
    }>;
  }) => void;
  
  // Scoreboard events
  'scoreboard:update': (payload: Array<{
    id: string;
    name: string;
    answer: number | null;
    correct: boolean;
    score: number;
  }>) => void;
  
  // Time sync events
  'time:pong': (payload: { t0: number; t1: number }) => void;
  
  // Power-up events
  'power:applied': (payload: { type: string; from: string }) => void;
}

export interface ClientToServerEvents {
  // Time sync
  'time:ping': (t0: number) => void;
  
  // Host events
  'host:createRoom': () => void;
  'host:qr': (payload: { joinUrl: string }) => void;
  'host:startGame': (payload: { code: string }) => void;
  'host:next': (payload: { code: string }) => void;
  
  // Player events
  'player:join': (payload: { code: string; name: string; pin?: string }) => void;
  'player:ready': (payload: { code: string; ready: boolean }) => void;
  'player:answer': (payload: { code: string; answerIndex: number }) => void;
  'player:usePower': (payload: { code: string; targetId: string; type: string }) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InterServerEvents {
  // Currently empty but reserved for future multi-server features
}

export interface SocketData {
  playerId?: string;
  roomId?: string;
  isHost?: boolean;
}