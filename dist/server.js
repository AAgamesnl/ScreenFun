"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Server ScreenFun
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const qrcode_1 = __importDefault(require("qrcode"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
const PORT = process.env.PORT || 3000;
const __root = path_1.default.join(__dirname, "..");
// Middleware to handle ES6 module imports without .js extension
app.use((req, res, next) => {
    // If the request is for a JS file in the js/ directory without extension
    if (req.path.startsWith("/js/") && !path_1.default.extname(req.path)) {
        const jsPath = req.path + ".js";
        const fullPath = path_1.default.join(__root, "public", jsPath);
        // Check if the .js file exists
        if (fs_1.default.existsSync(fullPath)) {
            req.url = jsPath;
            return res.sendFile(fullPath);
        }
    }
    next();
});
// Serve static files with basic caching headers
app.use(express_1.default.static(path_1.default.join(__root, "public"), {
    maxAge: "1h",
    etag: false,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith(".js")) {
            res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        }
    },
}));
// Simple health check endpoint
app.get("/health", (_req, res) => {
    res.status(200).send("ok");
});
app.get("/api/ips", (_req, res) => {
    const nets = os_1.default.networkInterfaces();
    const ips = [];
    Object.values(nets).forEach((ifaces) => {
        (ifaces || []).forEach((ni) => {
            if (ni && ni.family === "IPv4" && !ni.internal)
                ips.push(ni.address);
        });
    });
    res.json({ ips });
});
const questions = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__root, "data", "questions.sample.json"), "utf-8"));
const ROOMS = new Map();
function makeCode() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I,O,1,0
    let code = "";
    for (let i = 0; i < 4; i++) {
        code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    if (ROOMS.has(code))
        return makeCode();
    return code;
}
function getRoomByCode(code) {
    return ROOMS.get(code.toUpperCase());
}
function roomChannel(code) {
    return `room:${code}`;
}
function ensureHost(socket, room) {
    if (socket.id !== room.hostId) {
        throw new Error("Only host can perform this action.");
    }
}
function broadcastLobby(room) {
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
function startQuestion(room) {
    room.state = "question";
    room.players.forEach((p) => {
        p.answeredCurrent = false;
        p.lastAnswerIndex = null;
    });
    const qIndex = room.questionOrder[room.currentQuestionIndex];
    const q = questions[qIndex];
    const now = Date.now();
    room.roundDeadline = now + q.durationMs;
    // Send question without the correct answer index
    const safeQuestion = {
        id: q.id,
        text: q.text,
        options: q.options,
        durationMs: q.durationMs,
        serverNow: now,
        deadline: room.roundDeadline,
        players: Array.from(room.players.values()).map((p) => ({
            id: p.id,
            name: p.name,
        })),
    };
    io.to(roomChannel(room.code)).emit("question:show", safeQuestion); // to players
    io.to(room.hostId).emit("question:show", safeQuestion); // to host screen
    // Timer to end round
    if (room.roundTimer)
        clearTimeout(room.roundTimer);
    room.roundTimer = setTimeout(() => endQuestion(room), q.durationMs + 250); // small buffer
}
function endQuestion(room) {
    room.state = "reveal";
    const qIndex = room.questionOrder[room.currentQuestionIndex];
    const q = questions[qIndex];
    // Calculate scores
    room.players.forEach((p) => {
        if (p.lastAnswerIndex === q.correctIndex) {
            p.score += 100; // simple scoring
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
io.on("connection", (socket) => {
    // Clock sync: client sends t0; server replies with t0 + t1
    socket.on("time:ping", (t0) => {
        socket.emit("time:pong", { t0, t1: Date.now() });
    });
    socket.on("host:createRoom", async (_, ack) => {
        const code = makeCode();
        const room = {
            code,
            hostId: socket.id,
            players: new Map(),
            createdAt: Date.now(),
            state: "lobby",
            currentQuestionIndex: 0,
            questionOrder: [...Array(questions.length).keys()],
        };
        ROOMS.set(code, room);
        // Host joins room for easier broadcasting
        socket.join(roomChannel(code));
        ack?.({ code });
    });
    socket.on("host:qrMake", async (payload, ack) => {
        try {
            const dataUrl = await qrcode_1.default.toDataURL(payload.joinUrl);
            ack?.({ ok: true, dataUrl });
        }
        catch (e) {
            ack?.({ ok: false, error: e?.message || "QR error" });
        }
    });
    socket.on("player:join", (payload, ack) => {
        const code = payload.code?.toUpperCase?.();
        const room = getRoomByCode(code);
        if (!room)
            return ack?.({ ok: false, error: "Room niet gevonden" });
        if (room.state !== "lobby")
            return ack?.({ ok: false, error: "Spel is al gestart" });
        const player = {
            id: socket.id,
            name: String(payload.name || "Player"),
            score: 0,
            ready: false,
            powerups: ["freeze", "gloop", "flash"],
        };
        room.players.set(socket.id, player);
        socket.join(roomChannel(room.code));
        broadcastLobby(room);
        ack?.({ ok: true, player });
    });
    socket.on("player:setReady", (payload) => {
        const room = getRoomByCode(payload.code);
        if (!room)
            return;
        const p = room.players.get(socket.id);
        if (!p)
            return;
        p.ready = !!payload.ready;
        broadcastLobby(room);
    });
    socket.on("host:startGame", (payload, ack) => {
        const room = getRoomByCode(payload.code);
        if (!room)
            return ack?.({ ok: false, error: "Room niet gevonden" });
        if (socket.id !== room.hostId)
            return ack?.({ ok: false, error: "Only host" });
        if (room.players.size < 1)
            return ack?.({ ok: false, error: "Minstens 1 speler nodig" });
        room.questionOrder.sort(() => Math.random() - 0.5);
        room.currentQuestionIndex = 0;
        startQuestion(room);
        ack?.({ ok: true });
    });
    socket.on("host:next", (payload, ack) => {
        const room = getRoomByCode(payload.code);
        if (!room)
            return ack?.({ ok: false, error: "Room niet gevonden" });
        if (socket.id !== room.hostId)
            return ack?.({ ok: false, error: "Only host" });
        room.currentQuestionIndex++;
        if (room.currentQuestionIndex >= room.questionOrder.length) {
            room.state = "lobby";
            broadcastLobby(room);
            return ack?.({ ok: true, done: true });
        }
        else {
            startQuestion(room);
            return ack?.({ ok: true });
        }
    });
    socket.on("player:usePower", (payload) => {
        const room = getRoomByCode(payload.code);
        if (!room || room.state !== "question")
            return;
        const user = room.players.get(socket.id);
        if (!user || !user.powerups.includes(payload.type))
            return;
        const target = room.players.get(payload.targetId);
        if (!target)
            return;
        user.powerups = user.powerups.filter((p) => p !== payload.type);
        io.to(target.id).emit("power:applied", {
            type: payload.type,
            from: user.name,
        });
    });
    socket.on("player:answer", (payload) => {
        const room = getRoomByCode(payload.code);
        if (!room || room.state !== "question")
            return;
        const p = room.players.get(socket.id);
        if (!p || p.answeredCurrent)
            return;
        p.answeredCurrent = true; // lock first answer
        p.lastAnswerIndex = Number.isInteger(payload.answerIndex)
            ? payload.answerIndex
            : null;
    });
    socket.on("disconnect", () => {
        for (const room of ROOMS.values()) {
            if (room.hostId === socket.id) {
                if (room.roundTimer)
                    clearTimeout(room.roundTimer);
                io.to(roomChannel(room.code)).emit("room:closed");
                ROOMS.delete(room.code);
            }
            else if (room.players.has(socket.id)) {
                room.players.delete(socket.id);
                broadcastLobby(room);
            }
        }
    });
});
server.listen(PORT, () => {
    console.log(`Server on http://localhost:${PORT}`);
});
