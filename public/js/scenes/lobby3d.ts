// TapFrenzy 3D Lobby Scene with QR code, avatar selection, and ready system
import type { Scene } from './scene-manager';
import type { S2C, PlayerInfo } from '../net';

declare global {
  interface Window {
    BABYLON: any;
  }
}

export class Lobby3DScene implements Scene {
  private canvas?: HTMLCanvasElement;
  private engine?: any;
  private scene?: any;
  private camera?: any;
  private roomCode?: string;
  private players: PlayerInfo[] = [];
  private playerAvatars: any[] = [];
  private qrCodeMesh?: any;
  private guiTexture?: any;
  private qrCodeImage?: any;
  private roomCodeText?: any;

  async mount(root: HTMLElement): Promise<void> {
    // Create canvas for 3D rendering
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100vh';
    this.canvas.style.display = 'block';
    
    root.innerHTML = '';
    root.appendChild(this.canvas);

    if (!window.BABYLON) {
      throw new Error('Babylon.js not loaded');
    }

    const BABYLON = window.BABYLON;
    console.log('🎮 Starting TapFrenzy 3D Lobby...');

    try {
      // Create 3D engine and scene with high-DPI support
      this.engine = new BABYLON.Engine(this.canvas, true, { 
        preserveDrawingBuffer: true, 
        stencil: true,
        antialias: true 
      });
      
      // 4K-ready: Set hardware scaling for high DPI displays
      if (window.devicePixelRatio && window.devicePixelRatio > 1) {
        this.engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
        console.log(`✅ Lobby High-DPI support enabled (${window.devicePixelRatio}x)`);
      }
      
      this.scene = new BABYLON.Scene(this.engine);
      this.scene.clearColor = new BABYLON.Color3(0.05, 0.1, 0.2); // Dark blue background

      // Create camera
      this.camera = new BABYLON.FreeCamera('lobbyCamera', new BABYLON.Vector3(0, 5, -8), this.scene);
      this.camera.setTarget(BABYLON.Vector3.Zero());
      
      // Lighting
      const hemiLight = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(0, 1, 0), this.scene);
      hemiLight.intensity = 0.6;
      
      const dirLight = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(-1, -1, -1), this.scene);
      dirLight.intensity = 1.0;
      dirLight.diffuse = new BABYLON.Color3(0.8, 0.9, 1.0);

      // Create lobby environment
      await this.createLobbyEnvironment();
      
      // Create QR code and room code overlay (replaces old QR area)
      await this.createQROverlay();
      
      // Create player avatar area
      await this.createPlayerArea();

      // Handle window resize
      window.addEventListener('resize', this.handleResize.bind(this));
      
      // Start render loop
      this.engine.runRenderLoop(() => {
        if (this.scene) {
          this.scene.render();
        }
      });
      
      console.log('✅ TapFrenzy 3D Lobby ready!');
      this.showSubtitle('Wacht op spelers... Scan de QR code om deel te nemen! 📱');

    } catch (error) {
      console.error('❌ Error setting up 3D lobby:', error);
      root.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; color: white; text-align: center; background: linear-gradient(45deg, #0f1a2a, #1a2a3a);">
          <div>
            <h1>TapFrenzy Lobby</h1>
            <p>3D Lobby initialization failed</p>
            <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
          </div>
        </div>
      `;
    }
  }

  private async createLobbyEnvironment(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create futuristic platform/stage
    const platform = BABYLON.MeshBuilder.CreateCylinder('platform', {
      height: 0.2,
      diameterTop: 12,
      diameterBottom: 12,
      tessellation: 8
    }, this.scene);
    platform.position.y = -0.1;

    const platformMaterial = new BABYLON.StandardMaterial('platformMat', this.scene);
    platformMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.4);
    platformMaterial.diffuseColor = new BABYLON.Color3(0.05, 0.1, 0.3);
    platformMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    platform.material = platformMaterial;

    // Create glowing edge rings
    for (let i = 0; i < 3; i++) {
      const ring = BABYLON.MeshBuilder.CreateTorus(`ring${i}`, {
        diameter: 10 + i * 2,
        thickness: 0.1,
        tessellation: 32
      }, this.scene);
      ring.position.y = 0.2 + i * 0.1;
      
      const ringMaterial = new BABYLON.StandardMaterial(`ringMat${i}`, this.scene);
      ringMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.4, 0.8);
      ring.material = ringMaterial;

      // Animate ring rotation
      const rotationAnimation = new BABYLON.Animation(
        `ringRotation${i}`,
        'rotation.y',
        60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      );

      const keys = [
        { frame: 0, value: 0 },
        { frame: 300 + i * 50, value: Math.PI * 2 }
      ];

      rotationAnimation.setKeys(keys);
      ring.animations = [rotationAnimation];
      this.scene.beginAnimation(ring, 0, 300 + i * 50, true);
    }

    console.log('✅ Lobby environment created');
  }


  private async createQROverlay(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;
    const GUI = BABYLON.GUI;

    try {
      // Create fullscreen GUI
      this.guiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("LobbyUI");

      // Create container for QR and room code (top-right)
      const container = new GUI.Rectangle("qr-container");
      container.widthInPixels = 280; // TV-safe for 4K
      container.heightInPixels = 280;
      container.color = "transparent";
      container.thickness = 0;
      container.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
      container.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
      container.topInPixels = 20; // TV-safe margin
      container.rightInPixels = 20;

      // QR Code image placeholder
      this.qrCodeImage = new GUI.Image("qr-image", "");
      this.qrCodeImage.widthInPixels = 220; 
      this.qrCodeImage.heightInPixels = 220;
      this.qrCodeImage.topInPixels = -10;
      this.qrCodeImage.color = "#FFFFFF";
      this.qrCodeImage.background = "#000000";
      container.addControl(this.qrCodeImage);

      // Room code text (monospace, high contrast)
      this.roomCodeText = new GUI.TextBlock("room-code", "Room: ----");
      this.roomCodeText.color = "#FFFFFF";
      this.roomCodeText.fontSize = 24;
      this.roomCodeText.fontFamily = "Consolas, 'Courier New', monospace";
      this.roomCodeText.fontWeight = "bold";
      this.roomCodeText.topInPixels = 130;
      this.roomCodeText.heightInPixels = 30;
      this.roomCodeText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
      this.roomCodeText.background = "rgba(0, 0, 0, 0.8)";
      this.roomCodeText.cornerRadius = 8;
      container.addControl(this.roomCodeText);

      this.guiTexture.addControl(container);

      console.log('✅ Lobby QR overlay created');
    } catch (error) {
      console.error('Failed to create lobby QR overlay:', error);
    }
  }

  private async createPlayerArea(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create player spawn positions in a circle
    const positions = [];
    const radius = 4;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      positions.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        y: 0.5
      });
    }

    // Create placeholder pedestals for players
    positions.forEach((pos, index) => {
      const pedestal = BABYLON.MeshBuilder.CreateCylinder(`pedestal${index}`, {
        height: 1,
        diameter: 1,
        tessellation: 6
      }, this.scene);
      
      pedestal.position = new BABYLON.Vector3(pos.x, pos.y - 0.5, pos.z);
      
      const pedestalMaterial = new BABYLON.StandardMaterial(`pedestalMat${index}`, this.scene);
      pedestalMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.2);
      pedestalMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.4);
      pedestal.material = pedestalMaterial;

      // Add a glowing top
      const top = BABYLON.MeshBuilder.CreateCylinder(`top${index}`, {
        height: 0.1,
        diameter: 1.1
      }, this.scene);
      top.position = new BABYLON.Vector3(pos.x, pos.y, pos.z);
      
      const topMaterial = new BABYLON.StandardMaterial(`topMat${index}`, this.scene);
      topMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.6, 1.0);
      top.material = topMaterial;
    });

    console.log('✅ Player area created');
  }



  private updatePlayerAvatars(): void {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Remove existing avatars
    this.playerAvatars.forEach(avatar => avatar.dispose());
    this.playerAvatars = [];

    // Create new avatars for current players
    this.players.forEach((player, index) => {
      if (index >= 8) return; // Max 8 players

      const angle = (index / 8) * Math.PI * 2;
      const radius = 4;
      const pos = {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        y: 1.5
      };

      // Create simple avatar (sphere for now)
      const avatar = BABYLON.MeshBuilder.CreateSphere(`avatar${index}`, {diameter: 0.8}, this.scene);
      avatar.position = new BABYLON.Vector3(pos.x, pos.y, pos.z);

      // Color based on ready state
      const avatarMaterial = new BABYLON.StandardMaterial(`avatarMat${index}`, this.scene);
      if (player.ready) {
        avatarMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.8, 0.2);
        avatarMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.6, 0.1);
      } else {
        avatarMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.4, 0.1);
        avatarMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.3, 0.05);
      }
      avatar.material = avatarMaterial;

      // Add name plate
      const nameplate = BABYLON.MeshBuilder.CreatePlane(`nameplate${index}`, {width: 1.5, height: 0.3}, this.scene);
      nameplate.position = new BABYLON.Vector3(pos.x, pos.y + 1, pos.z);
      
      const nameTexture = new BABYLON.DynamicTexture(`nameTexture${index}`, {width: 256, height: 64}, this.scene);
      nameTexture.hasAlpha = true;
      nameTexture.drawText(player.name, null, null, '20px Arial', '#FFFFFF', 'transparent', true, true);
      
      const nameMaterial = new BABYLON.StandardMaterial(`nameMat${index}`, this.scene);
      nameMaterial.diffuseTexture = nameTexture;
      nameMaterial.emissiveTexture = nameTexture;
      nameMaterial.backFaceCulling = false;
      nameplate.material = nameMaterial;

      // Add bounce animation for ready players
      if (player.ready) {
        const bounceAnimation = new BABYLON.Animation(
          `bounce${index}`,
          'position.y',
          60,
          BABYLON.Animation.ANIMATIONTYPE_FLOAT,
          BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );

        const keys = [
          { frame: 0, value: pos.y },
          { frame: 30, value: pos.y + 0.3 },
          { frame: 60, value: pos.y }
        ];

        bounceAnimation.setKeys(keys);
        avatar.animations = [bounceAnimation];
        this.scene.beginAnimation(avatar, 0, 60, true);
      }

      this.playerAvatars.push(avatar, nameplate);
    });
  }

  private showSubtitle(text: string): void {
    // Create subtitle overlay
    const subtitleDiv = document.createElement('div');
    subtitleDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      font-size: 18px;
      z-index: 1000;
      max-width: 80%;
      text-align: center;
      border: 2px solid #00FFFF;
    `;
    subtitleDiv.textContent = text;
    document.body.appendChild(subtitleDiv);

    // Remove previous subtitle
    document.querySelectorAll('div').forEach(div => {
      if (div !== subtitleDiv && div.textContent && div.style.position === 'fixed') {
        div.remove();
      }
    });
  }

  private handleResize(): void {
    if (this.engine && this.canvas) {
      this.engine.resize();
    }
  }

  unmount(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    if (this.engine) {
      this.engine.dispose();
    }

    if (this.scene) {
      this.scene.dispose();
    }
  }

  private updateRoomCode(code: string): void {
    if (this.roomCodeText) {
      this.roomCodeText.text = `Room: ${code}`;
    }

    // Update QR code image
    if (code && this.qrCodeImage) {
      const joinUrl = `${window.location.origin}/player.html?code=${code}`;
      const qrUrl = `/qr?text=${encodeURIComponent(joinUrl)}`;
      
      // Set QR image source
      this.qrCodeImage.source = qrUrl;
      console.log('✅ Lobby QR code updated:', qrUrl);
    }
  }

  onMessage(msg: S2C): void {
    console.log('Lobby3D received message:', msg);
    
    if (msg.t === 'room') {
      this.roomCode = msg.code;
      this.players = msg.players || [];
      
      // Update QR overlay
      if (msg.code) {
        this.updateRoomCode(msg.code);
      }
      
      this.updatePlayerAvatars();
      
      // Check if all players are ready
      if (this.players.length >= 2) {
        const allReady = this.players.every(p => p.ready);
        if (allReady) {
          this.showSubtitle('🎉 Alle spelers zijn klaar! Het spel begint zo...');
          // TODO: Transition to category selection
        } else {
          const readyCount = this.players.filter(p => p.ready).length;
          this.showSubtitle(`${readyCount}/${this.players.length} spelers klaar...`);
        }
      }
    }
  }
}