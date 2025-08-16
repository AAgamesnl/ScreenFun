// Re-export all types for convenient importing
export * from './events';

// Game-specific types that might be shared
export type Player = {
  id: string;
  name: string;
  score: number;
  ready: boolean;
  answeredCurrent?: boolean;
  lastAnswerIndex?: number | null;
  powerups: string[];
};

export type Question = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  durationMs: number;
};

export type RoomState = "lobby" | "question" | "reveal" | "scoreboard";

export type Room = {
  code: string;
  hostId: string;
  players: Map<string, Player>;
  createdAt: number;
  state: RoomState;
  currentQuestionIndex: number;
  questionOrder: number[];
  roundDeadline?: number;
  roundTimer?: NodeJS.Timeout;
};