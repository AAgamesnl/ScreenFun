// Server ScreenFun
import express, { Request, Response, NextFunction } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import path from "path";
import fs from "fs";
import os from "os";
import * as QRCode from "qrcode";

import type {
  Question,
  Room,
  Player
} from "./types";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

const __root = path.join(__dirname, "../..");

// Middleware to handle ES6 module imports without .js extension
app.use((req: Request, res: Response, next: NextFunction) => {
  // If the request is for a JS file in the js/ directory without extension
  if (req.path.startsWith("/js/") && !path.extname(req.path)) {
    const jsPath = req.path + ".js";
    const fullPath = path.join(__root, "public", jsPath);

    // Check if the .js file exists
    if (fs.existsSync(fullPath)) {
      req.url = jsPath;
      return res.sendFile(fullPath);
    }
  }
  next();
});

// Favicon handler (avoid 404 spam). Serve a lightweight SVG icon.
app.get("/favicon.ico", (_req: Request, res: Response) => {
  const svgPath = path.join(__root, "public", "favicon.svg");
  if (fs.existsSync(svgPath)) {
    res.type("image/svg+xml").send(fs.readFileSync(svgPath, "utf-8"));
  } else {
    res.status(204).end(); // no content if missing
  }
});

// Serve static files with basic caching headers
app.use(
  express.static(path.join(__root, "public"), {
    maxAge: "1h",
    etag: false,
    setHeaders: (res: Response, filePath: string) => {
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
      }
    },
  })
);

// Simple health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).send("ok");
});

app.get("/api/ips", (_req: Request, res: Response) => {
  const nets = os.networkInterfaces();
  const ips: string[] = [];
  Object.values(nets).forEach((ifaces) => {
    (ifaces || []).forEach((ni: os.NetworkInterfaceInfo) => {
      if (ni && ni.family === "IPv4" && !ni.internal) ips.push(ni.address);
    });
  });
  res.json({ ips });
});

const questions: Question[] = JSON.parse(
  fs.readFileSync(path.join(__root, "data", "questions.sample.json"), "utf-8")
);

// Import typed socket handlers
import { setupSocketHandlers } from "./server/sockets/handlers";

const ROOMS = new Map<string, Room>();

function makeCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I,O,1,0
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  if (ROOMS.has(code)) return makeCode();
  return code;
}

function getRoomByCode(code: string): Room | undefined {
  return ROOMS.get(code.toUpperCase());
}

function roomChannel(code: string): string {
  return `room:${code}`;
}

function ensureHost(socket: Socket, room: Room) {
  if (socket.id !== room.hostId) {
    throw new Error("Only host can perform this action.");
  }
}

function broadcastLobby(room: Room) {
  const lobby = {
    code: room.code,
    players: Array.from(room.players.values()).map((p) => ({
      id: p.id,
      name: p.name,
      ready: p.ready,
      score: p.score,
    })),
    state: room.state,
  };
  io.to(roomChannel(room.code)).emit("lobby:update", lobby);
  // Host screen might not be in the room; ensure it receives updates
  io.to(room.hostId).emit("lobby:update", lobby);
}

function startQuestion(room: Room) {
  room.state = "question";

  // Reset players' answer state
  room.players.forEach((p) => {
    p.answeredCurrent = false;
    p.lastAnswerIndex = null;
  });

  const questionIndex = room.questionOrder[room.currentQuestionIndex];
  const question = questions[questionIndex ?? 0];

  const durationMs = question?.durationMs ?? 30000;
  room.roundDeadline = Date.now() + durationMs;

  // Safe question object without correct answer
  const safeQuestion = {
    id: question?.id,
    text: question?.text ?? "",
    options: question?.options ?? [],
    durationMs,
    deadline: room.roundDeadline,
    players: Array.from(room.players.values()).map((p) => ({
      id: p.id,
      name: p.name,
    })),
  };

  io.to(roomChannel(room.code)).emit("question:show", safeQuestion);
  io.to(room.hostId).emit("question:show", safeQuestion);

  if (room.roundTimer) clearTimeout(room.roundTimer);
  room.roundTimer = setTimeout(() => endQuestion(room), durationMs + 250);
}

function endQuestion(room: Room) {
  room.state = "reveal";
  const qIndex = room.questionOrder[room.currentQuestionIndex];
  const q = questions[qIndex ?? 0];

  if (!q) {
    return;
  }

  // Calculate scores
  room.players.forEach((p) => {
    if (p.lastAnswerIndex === q.correctIndex) {
      p.score += 100;
    }
  });

  const results = {
    correctIndex: q.correctIndex,
    players: Array.from(room.players.values()).map((p) => ({
      id: p.id,
      name: p.name,
      answer: p.lastAnswerIndex ?? null,
      correct: p.lastAnswerIndex === q.correctIndex,
      score: p.score,
    })),
  };

  io.to(roomChannel(room.code)).emit("question:result", results);
  io.to(room.hostId).emit("question:result", results);

  room.state = "scoreboard";
  io.to(roomChannel(room.code)).emit("scoreboard:update", results.players);
  io.to(room.hostId).emit("scoreboard:update", results.players);
}

// Setup typed socket.io handlers
setupSocketHandlers(io, {
  ROOMS,
  questions,
  io
});

server.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});
