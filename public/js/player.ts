import { Net } from './net';
import { SceneManager } from './scenes/scene-manager';
import { EnhancedJoinScene } from './scenes/enhanced-join';
import { PlayerLobbyScene } from './scenes/player-lobby';
import { randomAvatar } from './ui/avatars';

// Entry point for the player (mobile) screen
const net = new Net();
const sceneRoot = document.getElementById('app') as HTMLElement;
const scenes = new SceneManager(sceneRoot);

// Player state
let currentPlayerName = '';
let currentRoomCode = '';
let myPlayerId = '';

// Ensure inputs are always functional and prevent zoom
window.addEventListener('keydown', (e) => {
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return; // allow typing
  // other global key handling here…
}, { passive: true });

// Prevent zooming on mobile
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault());  
document.addEventListener('wheel', e => { 
  if ((e as WheelEvent).ctrlKey) e.preventDefault(); 
}, { passive: false });

// Ensure all inputs remain functional
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input,textarea').forEach(el => {
    (el as HTMLInputElement).readOnly = false;
    (el as HTMLInputElement).disabled = false;
  });
});

// Also ensure inputs remain functional when content changes
const observer = new MutationObserver(() => {
  document.querySelectorAll('input,textarea').forEach(el => {
    (el as HTMLInputElement).readOnly = false;
    (el as HTMLInputElement).disabled = false;
  });
});

observer.observe(document.body, { 
  childList: true, 
  subtree: true 
});

// Get initial parameters from URL
const params = new URLSearchParams(location.search);
const urlCode = params.get('code')?.toUpperCase() || '';
const urlName = params.get('name') || '';

// Handle joining a room
function joinRoom(code: string, name: string, pin?: string): void {
  currentRoomCode = code;
  currentPlayerName = name;
  
  console.log(`🎮 Attempting to join room ${code} as ${name}${pin ? ' with PIN' : ''}`);
  
  // Send join request
  const joinData: any = {
    t: 'player:join',
    code: code.toUpperCase(),
    name,
    avatar: localStorage.getItem('tapfrenzy-avatar') || randomAvatar()
  };
  
  if (pin) {
    joinData.pin = pin;
  }
  
  net.send(joinData);
}

// Handle ready state changes
function setReady(ready: boolean): void {
  if (currentRoomCode) {
    net.send({ t: 'player:ready', code: currentRoomCode, ready });
  }
}

// Set up message handling
net.onMessage(msg => {
  console.log('Player message:', msg);
  
  // Forward messages to current scene
  scenes.dispatch(msg);
  
  // Handle scene transitions
  if (msg.t === 'room') {
    // Successfully joined room - switch to lobby scene
    if (!scenes.currentScene || scenes.currentScene.constructor.name !== 'PlayerLobbyScene') {
      const lobbyScene = new PlayerLobbyScene(setReady);
      lobbyScene.setMyId(myPlayerId);
      scenes.set(lobbyScene);
    }
  }
});

// Initialize with enhanced join scene
const joinScene = new EnhancedJoinScene(joinRoom);
scenes.set(joinScene);

// No auto-join! QR code should only pre-fill the form
// The user must explicitly click "Join Game" button
console.log('📱 TapFrenzy Player initialized with enhanced UI - QR pre-fills only, no auto-join');
