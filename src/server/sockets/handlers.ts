import type { Server, Socket } from "socket.io";
import type {
  Room,
  Player,
  Question
} from "../../types";
import * as QRCode from "qrcode";

type TypedSocket = Socket;
type TypedServer = Server;

interface GameContext {
  ROOMS: Map<string, Room>;
  questions: Question[]; // Now properly typed
  io: TypedServer;
}

export function setupSocketHandlers(io: TypedServer, context: GameContext) {
  io.on("connection", (socket: TypedSocket) => {
    console.log("Client connected:", socket.id);

    // Time synchronization
    socket.on("time:ping", (t0: number) => {
      socket.emit("time:pong", { t0, t1: Date.now() });
    });

    // Host event handlers
    setupHostHandlers(socket, context);

    // Player event handlers
    setupPlayerHandlers(socket, context);

    // Cleanup on disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      handleDisconnect(socket, context);
    });
  });
}

function setupHostHandlers(socket: TypedSocket, context: GameContext) {
  const { ROOMS, io } = context;

  socket.on("host:createRoom", async (_, ack) => {
    console.log("Host creating room, socket ID:", socket.id);
    const code = makeCode(ROOMS);
    const room: Room = {
      code,
      hostId: socket.id,
      players: new Map(),
      createdAt: Date.now(),
      state: "lobby",
      currentQuestionIndex: 0,
      questionOrder: []
    };
    ROOMS.set(code, room);
    
    console.log("Room created:", code, "Host ID:", socket.id);
    
    // Send room info to host immediately
    broadcastLobby(room, io);
    
    ack?.({ ok: true, code });
  });

  socket.on("host:qr", async (payload, ack) => {
    console.log("QR code request received:", payload);
    try {
      const dataUrl = await QRCode.toDataURL(payload.joinUrl);
      console.log("QR code generated successfully");
      ack?.({ ok: true, dataUrl });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "QR error";
      console.error("QR code generation failed:", errorMessage);
      ack?.({ ok: false, error: errorMessage });
    }
  });

  socket.on("host:startGame", (payload, ack) => {
    const room = getRoomByCode(payload.code, ROOMS);
    if (!room) return ack?.({ ok: false, error: "Room niet gevonden" });
    if (socket.id !== room.hostId) return ack?.({ ok: false, error: "Only host" });

    room.questionOrder = Array.from({ length: context.questions.length }, (_, i) => i);
    room.questionOrder.sort(() => Math.random() - 0.5);
    room.currentQuestionIndex = 0;
    startQuestion(room, context);
    ack?.({ ok: true });
  });

  socket.on("host:next", (payload, ack) => {
    const room = getRoomByCode(payload.code, ROOMS);
    if (!room) return ack?.({ ok: false, error: "Room niet gevonden" });
    if (socket.id !== room.hostId) return ack?.({ ok: false, error: "Only host" });

    room.currentQuestionIndex++;
    if (room.currentQuestionIndex >= room.questionOrder.length) {
      room.state = "lobby";
      broadcastLobby(room, io);
      return ack?.({ ok: true, done: true });
    } else {
      startQuestion(room, context);
      return ack?.({ ok: true });
    }
  });
}

function setupPlayerHandlers(socket: TypedSocket, context: GameContext) {
  const { ROOMS } = context;

  socket.on("player:join", (payload, ack) => {
    const code = payload.code?.toUpperCase?.();
    const room = getRoomByCode(code, ROOMS);
    if (!room) return ack?.({ ok: false, error: "Room niet gevonden" });
    if (room.state !== "lobby") return ack?.({ ok: false, error: "Spel is al gestart" });

    // Check PIN if room requires it
    if (room.pin && payload.pin !== room.pin) {
      return ack?.({ ok: false, error: "Incorrect PIN" });
    }

    const player: Player = {
      id: socket.id,
      name: String(payload.name || "Player"),
      score: 0,
      ready: false,
      powerups: ["freeze", "gloop", "flash"]
    };

    room.players.set(socket.id, player);
    socket.join(roomChannel(room.code));
    broadcastLobby(room, context.io);
    ack?.({ ok: true });
  });

  socket.on("player:ready", (payload, ack) => {
    const room = getRoomByCode(payload.code, ROOMS);
    if (!room) return ack?.({ ok: false, error: "Room niet gevonden" });

    const player = room.players.get(socket.id);
    if (!player) return ack?.({ ok: false, error: "Player niet gevonden" });

    player.ready = payload.ready;
    broadcastLobby(room, context.io);
    ack?.({ ok: true });
  });

  socket.on("player:answer", (payload) => {
    const room = getRoomByCode(payload.code, ROOMS);
    if (!room || room.state !== "question") return;
    const p = room.players.get(socket.id);
    if (!p || p.answeredCurrent) return;
    p.answeredCurrent = true;
    p.lastAnswerIndex = Number.isInteger(payload.answerIndex) ? payload.answerIndex : null;
  });

  socket.on("player:usePower", (payload) => {
    const room = getRoomByCode(payload.code, ROOMS);
    if (!room || room.state !== "question") return;
    const user = room.players.get(socket.id);
    if (!user || !user.powerups.includes(payload.type)) return;
    const target = room.players.get(payload.targetId);
    if (!target) return;
    user.powerups = user.powerups.filter((p: string) => p !== payload.type);
    context.io.to(target.id).emit("power:applied", {
      type: payload.type,
      from: user.name
    });
  });
}

function handleDisconnect(socket: TypedSocket, context: GameContext) {
  // Remove player from any room they were in
  for (const room of context.ROOMS.values()) {
    if (room.players.delete(socket.id)) {
      broadcastLobby(room, context.io);
    }
    // If host disconnects, clean up the room
    if (room.hostId === socket.id) {
      context.ROOMS.delete(room.code);
      context.io.to(roomChannel(room.code)).emit("lobby:update", {
        code: room.code,
        players: [],
        state: "closed"
      });
    }
  }
}

// Utility functions
function makeCode(rooms: Map<string, Room>): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // Only letters, no numbers, excludes I/O
  let code = "";
  for (let i = 0; i < 5; i++) { // Changed to 5 letters
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  if (rooms.has(code)) return makeCode(rooms);
  return code;
}

function getRoomByCode(code: string | undefined, rooms: Map<string, Room>): Room | undefined {
  if (!code) return undefined;
  return rooms.get(code.toUpperCase());
}

function roomChannel(code: string): string {
  return `room:${code}`;
}

function broadcastLobby(room: Room, io: TypedServer) {
  console.log("Broadcasting lobby update for room:", room.code, "to host:", room.hostId);
  const lobby = {
    code: room.code,
    players: Array.from(room.players.values()).map((p: Player) => ({
      id: p.id,
      name: p.name,
      ready: p.ready,
      score: p.score
    })),
    state: room.state
  };

  console.log("Lobby data:", lobby);
  io.to(roomChannel(room.code)).emit("lobby:update", lobby);
  io.to(room.hostId).emit("lobby:update", lobby);
  console.log("Sent lobby:update to room channel and host");
}

function startQuestion(room: Room, context: GameContext) {
  room.state = "question";
  room.players.forEach((p: Player) => {
    p.answeredCurrent = false;
    p.lastAnswerIndex = null;
  });

  const qIndex = room.questionOrder[room.currentQuestionIndex];
  if (qIndex === undefined || qIndex < 0 || qIndex >= context.questions.length) return;
  const q = context.questions[qIndex]!;
  const now = Date.now();
  room.roundDeadline = now + q.durationMs;

  const safeQuestion = {
    id: q.id,
    text: q.text,
    options: q.options,
    durationMs: q.durationMs,
    serverNow: now,
    deadline: room.roundDeadline,
    players: Array.from(room.players.values()).map((p: Player) => ({
      id: p.id,
      name: p.name
    }))
  };

  context.io.to(roomChannel(room.code)).emit("question:show", safeQuestion);
  context.io.to(room.hostId).emit("question:show", safeQuestion);

  if (room.roundTimer) clearTimeout(room.roundTimer);
  room.roundTimer = setTimeout(() => endQuestion(room, context), q.durationMs + 250);
}

function endQuestion(room: Room, context: GameContext) {
  room.state = "reveal";
  const qIndex = room.questionOrder[room.currentQuestionIndex];
  if (qIndex === undefined || qIndex < 0 || qIndex >= context.questions.length) return;
  const q = context.questions[qIndex]!;

  room.players.forEach((p: Player) => {
    if (p.lastAnswerIndex === q.correctIndex) {
      p.score += 100;
    }
  });

  const results = {
    correctIndex: q.correctIndex,
    players: Array.from(room.players.values()).map((p: Player) => ({
      id: p.id,
      name: p.name,
      answer: p.lastAnswerIndex ?? null,
      correct: p.lastAnswerIndex === q.correctIndex,
      score: p.score
    }))
  };

  context.io.to(roomChannel(room.code)).emit("question:result", results);
  context.io.to(room.hostId).emit("question:result", results);

  room.state = "scoreboard";
  context.io.to(roomChannel(room.code)).emit("scoreboard:update", results.players);
  context.io.to(room.hostId).emit("scoreboard:update", results.players);
}
