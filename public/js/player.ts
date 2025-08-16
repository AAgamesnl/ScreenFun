import { Net } from './net';
import { SceneManager } from './scenes/scene-manager';
import { JoinScene } from './scenes/join';
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

// Get initial parameters from URL
const params = new URLSearchParams(location.search);
const urlCode = params.get('code')?.toUpperCase() || '';
const urlName = params.get('name') || '';

// Handle joining a room
function joinRoom(code: string, name: string): void {
  currentRoomCode = code;
  currentPlayerName = name;
  
  net.send({ 
    t: 'player:join', 
    code: code.toUpperCase(), 
    name, 
    avatar: randomAvatar() 
  });
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

// Initialize the appropriate scene
if (urlCode && urlName) {
  // Auto-join if URL parameters are provided
  joinRoom(urlCode, urlName);
  // Show a loading state or go directly to lobby
  const lobbyScene = new PlayerLobbyScene(setReady);
  scenes.set(lobbyScene);
} else {
  // Show join form
  scenes.set(new JoinScene(joinRoom));
}
