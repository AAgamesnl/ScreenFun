import { Net } from './net';
import { SceneManager } from './scenes/scene-manager';
import { LobbyScene } from './scenes/lobby';
// Entry point for host (TV) screen
const net = new Net();
const sceneRoot = document.getElementById('scene');
const scenes = new SceneManager(sceneRoot);
scenes.set(new LobbyScene());
// Forward messages from server to active scene
net.onMessage(msg => scenes.dispatch(msg));
// Example: automatically create a room on load
net.send({ t: 'host:create' });
