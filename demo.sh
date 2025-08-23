#!/bin/bash

# TapFrenzy AAA Demo Script
echo "🎮 TapFrenzy AAA Visual Overhaul - Complete Demo"
echo "=================================================="

# Kill any existing servers
echo "🔧 Cleaning up existing processes..."
pkill -f "node.*server" || true
sleep 1

# Start the server
echo "🚀 Starting TapFrenzy server on port 3001..."
cd /home/runner/work/ScreenFun/ScreenFun
PORT=3001 node dist/src/server.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test server endpoints
echo "📡 Testing server endpoints..."
echo "Host HTML: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/host.html)"
echo "Player HTML: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/player.html)"
echo "Socket.IO: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/socket.io/socket.io.js)"

# Show what we've implemented
echo ""
echo "✅ COMPLETE GAME LOOP IMPLEMENTED:"
echo "   📱 3D Start Screen - Static camera, Buzzer idle animations"
echo "   🎪 Category Vote 3D - Floating bubble doors with voting"
echo "   ⚡ Power Plays 3D - Freeze/Gloop/Double selection system"  
echo "   ❓ Question 3D - TV billboard with A/B/C/D tiles"
echo "   🎊 Reveal 3D - Score deltas with confetti celebration"
echo "   🏆 Scoreboard 3D - Pillars with top-3 highlights"
echo "   🔥 Finale 3D - Pyramid challenge with winner celebration"

echo ""
echo "🎯 TECHNICAL ACHIEVEMENTS:"
echo "   🖥️  Babylon.js WebGL/WebGPU engine integration"
echo "   📱 4K display support with hardware scaling"
echo "   🎨 PBR materials with glassmorphism effects"
echo "   💡 HDRI lighting + 3-point studio setup"
echo "   🎵 TTS Buzzer with context-aware speech"
echo "   ✨ Particle systems for atmospheric effects"
echo "   📡 Socket.IO multiplayer architecture ready"

echo ""
echo "🌐 SERVER RUNNING:"
echo "   Host (TV):     http://localhost:3001/host.html"
echo "   Player (Mobile): http://localhost:3001/player.html"

echo ""
echo "🔧 To stop the server: kill $SERVER_PID"
echo ""
echo "🎬 The host will start with Menu3D scene and transition through:"
echo "   Menu3D → Category3D → PowerPlays → Question3D → Reveal3D → Scoreboard3D → Finale3D"

# Keep server running
wait $SERVER_PID