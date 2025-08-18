import type { Scene } from './scene-manager';

declare const BABYLON: any;

/** 3D Lobby scene with room code and player avatars */
export class Lobby3DScene implements Scene {
  private engine?: any;
  private scene?: any;
  private camera?: any;
  private canvas?: HTMLCanvasElement;
  private roomCode?: string;
  private players: any[] = [];
  private net?: any;

  constructor(net?: any) {
    this.net = net;
  }

  mount(root: HTMLElement): void {
    // Create canvas for 3D rendering
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'lobbyCanvas';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100vh';
    this.canvas.style.display = 'block';
    
    root.innerHTML = '';
    root.appendChild(this.canvas);

    this.initBabylon();
    this.createScene();
    this.startRenderLoop();
  }

  unmount(): void {
    if (this.engine) {
      this.engine.dispose();
    }
    this.canvas?.remove();
  }

  onMessage(msg: any): void {
    if (msg.t === 'room') {
      this.roomCode = msg.code;
      this.players = msg.players;
      this.updatePlayerAvatars();
      this.displayRoomCode();
    }
  }

  private initBabylon(): void {
    if (!this.canvas) return;
    
    try {
      this.engine = new BABYLON.Engine(this.canvas, true);
      
      window.addEventListener('resize', () => {
        this.engine?.resize();
      });
    } catch (e) {
      console.error('Failed to initialize Babylon.js:', e);
    }
  }

  private createScene(): void {
    if (!this.engine) return;

    this.scene = new BABYLON.Scene(this.engine);
    
    // Create camera
    this.camera = new BABYLON.ArcRotateCamera(
      'lobbyCamera',
      0,
      Math.PI / 3,
      15,
      BABYLON.Vector3.Zero(),
      this.scene
    );
    
    // Add lighting
    new BABYLON.HemisphericLight(
      'lobbyLight',
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    
    // Create lobby environment
    this.createLobbyEnvironment();
  }

  private createLobbyEnvironment(): void {
    // Create platform/stage
    const platform = BABYLON.MeshBuilder.CreateCylinder('platform', {
      diameter: 12,
      height: 0.2
    }, this.scene);
    platform.position.y = -1;
    
    // Create central room code display
    const codeDisplay = BABYLON.MeshBuilder.CreateBox('codeDisplay', {
      width: 4,
      height: 1,
      depth: 0.1
    }, this.scene);
    codeDisplay.position.y = 2;
  }

  private updatePlayerAvatars(): void {
    // Remove existing avatars
    this.scene?.meshes.forEach((mesh: any) => {
      if (mesh.name.startsWith('avatar_')) {
        mesh.dispose();
      }
    });

    // Create new avatars in circle
    this.players.forEach((player, index) => {
      const angle = (index / this.players.length) * Math.PI * 2;
      const radius = 5;
      
      const avatar = BABYLON.MeshBuilder.CreateBox(`avatar_${player.id}`, {
        size: 1
      }, this.scene);
      
      avatar.position.x = Math.cos(angle) * radius;
      avatar.position.z = Math.sin(angle) * radius;
      avatar.position.y = 0;
      
      // Add ready state indicator
      if (player.ready) {
        avatar.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
      }
    });
  }

  private displayRoomCode(): void {
    if (!this.roomCode) return;
    
    // Update room code display (would need proper 3D text in full Babylon.js)
    console.log(`Room Code: ${this.roomCode}`);
  }

  private startRenderLoop(): void {
    if (!this.engine || !this.scene) return;
    
    this.engine.runRenderLoop(() => {
      this.scene?.render();
    });
  }
}