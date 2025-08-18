// Server TapFrenzy
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

// Middleware to resolve extension-less module imports under /js/ to built files in /build
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/js/') && !path.extname(req.path)) {
    // Try direct .js in original public/js (for already transpiled plain JS)
    const originalJs = path.join(__root, 'public', req.path + '.js');
    if (fs.existsSync(originalJs)) {
      req.url = req.path + '.js';
      return res.sendFile(originalJs);
    }
    // Try built version in /public/build mirroring structure (strip /js prefix)
    const relative = req.path.replace(/^\/js\//, '');
    const builtJs = path.join(__root, 'public', 'build', relative + '.js');
    if (fs.existsSync(builtJs)) {
      return res.sendFile(builtJs);
    }
  }
  // Support extension-less imports from built files (/build/* -> add .js)
  if (req.path.startsWith('/build/') && !path.extname(req.path)) {
    const builtPath = path.join(__root, 'public', req.path + '.js');
    if (fs.existsSync(builtPath)) {
      return res.sendFile(builtPath);
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
app.use(express.static(path.join(__root, 'public'), {
  maxAge: '1h',
  etag: false,
  setHeaders: (res: Response, filePath: string) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  }
}));

// Also serve compiled JS files from dist/public (for TypeScript compiled files)
// Serve built frontend bundle directory (public/build) if present
app.use(express.static(path.join(__root, 'public', 'build'), {
  maxAge: '5m',
  etag: false,
  setHeaders: (res: Response, filePath: string) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  }
}));

// Simple health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).send("ok");
});

// QR Code generation endpoint with enhanced quality
app.get("/qr", async (req: Request, res: Response) => {
  const text = req.query.text as string;
  
  if (!text) {
    return res.status(400).json({ error: "Missing 'text' parameter" });
  }
  
  try {
    // High-DPI QR code generation for 4K displays
    const qrBuffer = await QRCode.toBuffer(text, {
      type: 'png',
      width: 512, // Doubled for high-DPI displays
      margin: 1,  // Reduced margin for more compact QR code
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M', // Medium error correction for better readability
      rendererOpts: {
        quality: 0.92 // High quality PNG compression
      }
    });
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.setHeader('X-Content-Type-Options', 'nosniff'); // Security header
    res.send(qrBuffer);
    
    console.log(`✅ High-DPI QR code generated: ${text.substring(0, 50)}...`);
  } catch (error) {
    console.error('QR code generation failed:', error);
    res.status(500).json({ 
      error: "Failed to generate QR code",
      fallback: text 
    });
  }
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
