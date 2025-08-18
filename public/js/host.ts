import { Net } from './net';
import { SceneManager } from './scenes/scene-manager';
import { LobbyScene } from './scenes/lobby';
import { Menu3DScene } from './scenes/menu3d';

// Entry point for host (TV) screen  
const net = new Net();
const sceneRoot = document.getElementById('scene') as HTMLElement;
const scenes = new SceneManager(sceneRoot);

// Make scene manager globally available for transitions
(window as any).gameSceneManager = scenes;
(window as any).gameNet = net;

// Start with the 3D main menu
scenes.set(new Menu3DScene());

// Forward messages from server to active scene
net.onMessage(msg => {
  scenes.dispatch(msg);
  
  // Handle global messages
  if (msg.t === 'room' && msg.code) {
    console.log(`🎮 Room created: ${msg.code}`);
  }
});
