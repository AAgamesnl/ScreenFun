// Server ScreenFun
import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";
import os from "os";

import type { 
  Question,
  Room
} from "./types";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

const __root = path.join(__dirname, "..");

// Middleware to handle ES6 module imports without .js extension
app.use((req, res, next) => {
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

// Serve static files with basic caching headers
app.use(
  express.static(path.join(__root, "public"), {
    maxAge: "1h",
    etag: false,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
      }
    },
  })
);

// Simple health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).send("ok");
});

app.get("/api/ips", (_req, res) => {
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

// Setup typed socket.io handlers
setupSocketHandlers(io, { 
  ROOMS, 
  questions, 
  io 
});

server.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});
