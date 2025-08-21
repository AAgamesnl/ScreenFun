import { Net } from './net';
import { SceneManager } from './scenes/scene-manager';
import { Menu2DScene } from './scenes/menu2d';
// Entry point for host (TV) screen  
const net = new Net();
const sceneRoot = document.getElementById('scene');
const scenes = new SceneManager(sceneRoot);
// Make scene manager globally available for transitions
window.gameSceneManager = scenes;
window.gameNet = net;
// Start with the new 2D main menu (AAA redesign)
scenes.set(new Menu2DScene());
// Forward messages from server to active scene
net.onMessage(msg => {
    scenes.dispatch(msg);
    // Handle global messages
    if (msg.t === 'room' && msg.code) {
        console.log(`🎮 Room created: ${msg.code}`);
    }
});
