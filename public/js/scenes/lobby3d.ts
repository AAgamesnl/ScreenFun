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
      
      // AAA Lighting setup with HDRI environment
      await this.setupLobbyHDRIEnvironment();
      
      // Enhanced key+fill+rim lighting setup
      const keyLight = new BABYLON.DirectionalLight('keyLight', new BABYLON.Vector3(-0.3, -1, -0.6), this.scene);
      keyLight.intensity = 1.5;
      keyLight.diffuse = new BABYLON.Color3(1.0, 0.9, 0.8);
      
      const fillLight = new BABYLON.HemisphericLight('fillLight', new BABYLON.Vector3(0, 1, 0), this.scene);
      fillLight.intensity = 0.4;
      fillLight.diffuse = new BABYLON.Color3(0.6, 0.7, 1.0);
      
      const rimLight = new BABYLON.DirectionalLight('rimLight', new BABYLON.Vector3(0.8, 0.2, -1), this.scene);
      rimLight.intensity = 0.8;
      rimLight.diffuse = new BABYLON.Color3(0.9, 1.0, 1.2);

      // Create lobby environment
      await this.createLobbyEnvironment();
      
      // Create professional game host character
      await this.createGameHost();
      
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

    // Create HIGH-POLY AAA quality futuristic platform/stage with PBR
    const platform = BABYLON.MeshBuilder.CreateCylinder('platform', {
      height: 0.3,
      diameterTop: 14,
      diameterBottom: 14,
      tessellation: 64 // Quadrupled for much smoother curves
    }, this.scene);
    platform.position.y = -0.15;

    const platformMaterial = new BABYLON.PBRMaterial('platformMat', this.scene);
    platformMaterial.baseColor = new BABYLON.Color3(0.08, 0.12, 0.25);
    platformMaterial.metallicFactor = 0.9;
    platformMaterial.roughnessFactor = 0.15;
    platformMaterial.emissiveColor = new BABYLON.Color3(0.03, 0.06, 0.15);
    platformMaterial.clearCoat.isEnabled = true;
    platformMaterial.clearCoat.intensity = 0.6;
    platform.material = platformMaterial;

    // Create high-detail glowing edge rings with enhanced materials
    for (let i = 0; i < 3; i++) {
      const ring = BABYLON.MeshBuilder.CreateTorus(`ring${i}`, {
        diameter: 11 + i * 2.5,
        thickness: 0.15,
        tessellation: 64 // Doubled for smoother curves
      }, this.scene);
      ring.position.y = 0.3 + i * 0.1;
      
      const ringMaterial = new BABYLON.PBRMaterial(`ringMat${i}`, this.scene);
      ringMaterial.baseColor = new BABYLON.Color3(0.2, 0.6, 1.0);
      ringMaterial.emissiveColor = new BABYLON.Color3(0.4, 0.8, 1.5);
      ringMaterial.metallicFactor = 0.95;
      ringMaterial.roughnessFactor = 0.05;
      ringMaterial.clearCoat.isEnabled = true;
      ringMaterial.clearCoat.intensity = 0.7;
      ring.material = ringMaterial;

      // Animate ring rotation with different speeds
      const rotationAnimation = new BABYLON.Animation(
        `ringRotation${i}`,
        'rotation.y',
        60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      );

      const keys = [
        { frame: 0, value: 0 },
        { frame: 400 + i * 100, value: Math.PI * 2 * (i % 2 === 0 ? 1 : -1) }
      ];

      rotationAnimation.setKeys(keys);
      ring.animations = [rotationAnimation];
      this.scene.beginAnimation(ring, 0, 400 + i * 100, true);
    }

    // Add subtle particles (dust/sparkles) in lobby
    this.createLobbyParticles();

    console.log('✅ AAA Lobby environment created with PBR materials');
  }

  private createLobbyParticles(): void {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create subtle sparkle particles for ambiance
    const particleSystem = new BABYLON.ParticleSystem('lobbyParticles', 800, this.scene);
    particleSystem.particleTexture = new BABYLON.Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', this.scene);

    particleSystem.emitter = BABYLON.Vector3.Zero();
    particleSystem.minEmitBox = new BABYLON.Vector3(-8, 0, -8);
    particleSystem.maxEmitBox = new BABYLON.Vector3(8, 3, 8);

    // Subtle blue/white sparkles
    particleSystem.color1 = new BABYLON.Color4(0.8, 0.9, 1.0, 0.6);
    particleSystem.color2 = new BABYLON.Color4(0.9, 0.95, 1.0, 0.8);
    particleSystem.colorDead = new BABYLON.Color4(0.8, 0.9, 1.0, 0.0);

    particleSystem.minSize = 0.05;
    particleSystem.maxSize = 0.2;
    particleSystem.minLifeTime = 2.0;
    particleSystem.maxLifeTime = 4.0;
    particleSystem.emitRate = 50;

    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.gravity = new BABYLON.Vector3(0, -0.5, 0);
    particleSystem.direction1 = new BABYLON.Vector3(-0.2, 0.5, -0.2);
    particleSystem.direction2 = new BABYLON.Vector3(0.2, 1.0, 0.2);

    particleSystem.start();
    console.log('✅ Lobby particles created');
  }

  private async createGameHost(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // === PROFESSIONAL GAME HOST CHARACTER ===
    
    // Host main body - professional presenter build
    const hostBody = BABYLON.MeshBuilder.CreateCylinder('hostBody', {
      height: 1.4,
      diameterTop: 0.6,
      diameterBottom: 0.7,
      tessellation: 48 // High poly
    }, this.scene);
    hostBody.position = new BABYLON.Vector3(-3, 0.8, -6);

    // Professional head with realistic proportions
    const hostHead = BABYLON.MeshBuilder.CreateSphere('hostHead', {
      diameter: 0.5,
      segments: 48 // High poly for main character
    }, this.scene);
    hostHead.position = new BABYLON.Vector3(-3, 1.8, -6);
    hostHead.scaling = new BABYLON.Vector3(1.0, 1.1, 0.9);

    // Professional arms in presenting pose
    const armLeft = BABYLON.MeshBuilder.CreateCapsule('hostArmLeft', {
      radius: 0.09,
      height: 0.7,
      tessellation: 24
    }, this.scene);
    armLeft.position = new BABYLON.Vector3(-3.4, 1.2, -5.7);
    armLeft.rotation.z = Math.PI / 4; // Welcoming gesture

    const armRight = BABYLON.MeshBuilder.CreateCapsule('hostArmRight', {
      radius: 0.09,
      height: 0.7,
      tessellation: 24
    }, this.scene);
    armRight.position = new BABYLON.Vector3(-2.6, 1.2, -5.7);
    armRight.rotation.z = -Math.PI / 6; // Presenting gesture

    // Professional hands
    const handLeft = BABYLON.MeshBuilder.CreateSphere('hostHandLeft', {
      diameter: 0.14,
      segments: 16
    }, this.scene);
    handLeft.position = new BABYLON.Vector3(-3.7, 0.8, -5.5);

    const handRight = BABYLON.MeshBuilder.CreateSphere('hostHandRight', {
      diameter: 0.14,
      segments: 16
    }, this.scene);
    handRight.position = new BABYLON.Vector3(-2.3, 1.0, -5.5);

    // Professional legs  
    const legLeft = BABYLON.MeshBuilder.CreateCapsule('hostLegLeft', {
      radius: 0.12,
      height: 0.9,
      tessellation: 20
    }, this.scene);
    legLeft.position = new BABYLON.Vector3(-3.12, -0.3, -6);

    const legRight = BABYLON.MeshBuilder.CreateCapsule('hostLegRight', {
      radius: 0.12,
      height: 0.9,
      tessellation: 20
    }, this.scene);
    legRight.position = new BABYLON.Vector3(-2.88, -0.3, -6);

    // === PROFESSIONAL MATERIALS ===
    
    // Professional suit material - charcoal
    const suitMaterial = new BABYLON.PBRMaterial('hostSuitMat', this.scene);
    suitMaterial.baseColor = new BABYLON.Color3(0.12, 0.12, 0.15);
    suitMaterial.metallicFactor = 0.1;
    suitMaterial.roughnessFactor = 0.6;
    suitMaterial.emissiveColor = new BABYLON.Color3(0.02, 0.02, 0.03);
    suitMaterial.clearCoat.isEnabled = true;
    suitMaterial.clearCoat.intensity = 0.2;
    hostBody.material = suitMaterial;
    armLeft.material = suitMaterial;
    armRight.material = suitMaterial;
    legLeft.material = suitMaterial;
    legRight.material = suitMaterial;

    // Professional skin material
    const skinMaterial = new BABYLON.PBRMaterial('hostSkinMat', this.scene);
    skinMaterial.baseColor = new BABYLON.Color3(0.9, 0.75, 0.65);
    skinMaterial.metallicFactor = 0.0;
    skinMaterial.roughnessFactor = 0.5;
    skinMaterial.subSurface.isScatteringEnabled = true;
    skinMaterial.subSurface.scatteringColor = new BABYLON.Color3(0.8, 0.4, 0.3);
    hostHead.material = skinMaterial;
    handLeft.material = skinMaterial;
    handRight.material = skinMaterial;

    // === PROFESSIONAL ANIMATIONS ===
    
    // Subtle professional breathing
    const breatheAnimation = new BABYLON.Animation(
      'hostBreathe',
      'scaling.y',
      12, // Slow and subtle
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );
    const breatheKeys = [
      { frame: 0, value: 1.0 },
      { frame: 60, value: 1.015 }, // Very subtle
      { frame: 120, value: 1.0 }
    ];
    breatheAnimation.setKeys(breatheKeys);
    hostBody.animations = [breatheAnimation];
    this.scene.beginAnimation(hostBody, 0, 120, true);

    // Professional gesture animation
    const gestureAnimation = new BABYLON.Animation(
      'hostGesture',
      'rotation.z',
      8, // Very slow and professional
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );
    const gestureKeys = [
      { frame: 0, value: -Math.PI / 6 },
      { frame: 120, value: -Math.PI / 5 },
      { frame: 240, value: -Math.PI / 6 }
    ];
    gestureAnimation.setKeys(gestureKeys);
    armRight.animations = [gestureAnimation];
    this.scene.beginAnimation(armRight, 0, 240, true);

    console.log('✅ Professional Game Host character created with premium materials and animations');
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

      // Create high-poly AAA quality avatar with detailed geometry
      const avatar = BABYLON.MeshBuilder.CreateSphere(`avatar${index}`, {
        diameter: 1.0,
        segments: 64 // Doubled for much smoother sphere
      }, this.scene);
      avatar.position = new BABYLON.Vector3(pos.x, pos.y, pos.z);

      // === ADD HUMANOID BODY PARTS ===
      
      // Simple arms for humanoid appearance
      const armLeft = BABYLON.MeshBuilder.CreateCapsule(`armLeft${index}`, {
        radius: 0.08,
        height: 0.6,
        tessellation: 16
      }, this.scene);
      armLeft.position = new BABYLON.Vector3(pos.x - 0.4, pos.y, pos.z);
      armLeft.rotation.z = Math.PI / 6;

      const armRight = BABYLON.MeshBuilder.CreateCapsule(`armRight${index}`, {
        radius: 0.08,
        height: 0.6,
        tessellation: 16
      }, this.scene);
      armRight.position = new BABYLON.Vector3(pos.x + 0.4, pos.y, pos.z);
      armRight.rotation.z = -Math.PI / 6;

      // Simple legs for humanoid appearance  
      const legLeft = BABYLON.MeshBuilder.CreateCapsule(`legLeft${index}`, {
        radius: 0.1,
        height: 0.8,
        tessellation: 16
      }, this.scene);
      legLeft.position = new BABYLON.Vector3(pos.x - 0.2, pos.y - 0.8, pos.z);

      const legRight = BABYLON.MeshBuilder.CreateCapsule(`legRight${index}`, {
        radius: 0.1,
        height: 0.8,
        tessellation: 16
      }, this.scene);
      legRight.position = new BABYLON.Vector3(pos.x + 0.2, pos.y - 0.8, pos.z);

      // Create PBR material for avatar with bubble effect
      const avatarMaterial = new BABYLON.PBRMaterial(`avatarMat${index}`, this.scene);
      
      if (player.ready) {
        // Ready state: bright green with glow
        avatarMaterial.baseColor = new BABYLON.Color3(0.1, 0.9, 0.2);
        avatarMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.3, 0.1);
        avatarMaterial.metallicFactor = 0.1;
        avatarMaterial.roughnessFactor = 0.2;
      } else {
        // Waiting state: warm orange
        avatarMaterial.baseColor = new BABYLON.Color3(0.9, 0.5, 0.1);
        avatarMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.15, 0.05);
        avatarMaterial.metallicFactor = 0.3;
        avatarMaterial.roughnessFactor = 0.4;
      }
      
      // Enhanced glassmorphism effect with clearcoat
      avatarMaterial.alpha = 0.8;
      avatarMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
      avatarMaterial.clearCoat.isEnabled = true;
      avatarMaterial.clearCoat.intensity = 0.5;
      avatar.material = avatarMaterial;
      
      // Apply similar material to body parts
      armLeft.material = avatarMaterial;
      armRight.material = avatarMaterial;
      legLeft.material = avatarMaterial;
      legRight.material = avatarMaterial;

      // Create high-detail bubble-totem pedestal
      const pedestal = BABYLON.MeshBuilder.CreateCylinder(`pedestal${index}`, {
        height: 0.3,
        diameterTop: 1.2,
        diameterBottom: 1.4,
        tessellation: 48 // Tripled for smoother curves
      }, this.scene);
      pedestal.position = new BABYLON.Vector3(pos.x, pos.y - 0.7, pos.z);
      
      const pedestalMaterial = new BABYLON.PBRMaterial(`pedestalMat${index}`, this.scene);
      pedestalMaterial.baseColor = new BABYLON.Color3(0.15, 0.25, 0.4);
      pedestalMaterial.metallicFactor = 0.9;
      pedestalMaterial.roughnessFactor = 0.15;
      pedestalMaterial.emissiveColor = new BABYLON.Color3(0.03, 0.08, 0.16);
      pedestalMaterial.clearCoat.isEnabled = true;
      pedestalMaterial.clearCoat.intensity = 0.4;
      pedestal.material = pedestalMaterial;

      // Ready badge - floating bubble above avatar
      if (player.ready) {
        const badge = BABYLON.MeshBuilder.CreateBox(`readyBadge${index}`, {
          width: 0.6,
          height: 0.2,
          depth: 0.1
        }, this.scene);
        badge.position = new BABYLON.Vector3(pos.x, pos.y + 1.2, pos.z);
        
        const badgeMaterial = new BABYLON.PBRMaterial(`badgeMat${index}`, this.scene);
        badgeMaterial.baseColor = new BABYLON.Color3(0.1, 1.0, 0.3);
        badgeMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.8, 0.4);
        badgeMaterial.alpha = 0.9;
        badge.material = badgeMaterial;
        
        this.playerAvatars.push(badge);
      }

      // Enhanced name plate with glassmorphism
      const nameplate = BABYLON.MeshBuilder.CreatePlane(`nameplate${index}`, {width: 2.0, height: 0.4}, this.scene);
      nameplate.position = new BABYLON.Vector3(pos.x, pos.y + 0.8, pos.z);
      
      const nameTexture = new BABYLON.DynamicTexture(`nameTexture${index}`, {width: 512, height: 128}, this.scene);
      nameTexture.hasAlpha = true;
      nameTexture.drawText(player.name, null, null, 'bold 32px Arial', '#FFFFFF', 'rgba(0,0,0,0.6)', true, true);
      
      const nameMaterial = new BABYLON.StandardMaterial(`nameMat${index}`, this.scene);
      nameMaterial.diffuseTexture = nameTexture;
      nameMaterial.emissiveTexture = nameTexture;
      nameMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);
      nameMaterial.backFaceCulling = false;
      nameplate.material = nameMaterial;

      // Enhanced bounce animation for ready players
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
          { frame: 30, value: pos.y + 0.4 },
          { frame: 60, value: pos.y }
        ];

        bounceAnimation.setKeys(keys);
        avatar.animations = [bounceAnimation];
        this.scene.beginAnimation(avatar, 0, 60, true);
        
        // Also animate the pedestal
        const pedestalBounce = new BABYLON.Animation(
          `pedestalBounce${index}`,
          'scaling.y',
          60,
          BABYLON.Animation.ANIMATIONTYPE_FLOAT,
          BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const pedestalKeys = [
          { frame: 0, value: 1.0 },
          { frame: 30, value: 1.1 },
          { frame: 60, value: 1.0 }
        ];
        
        pedestalBounce.setKeys(pedestalKeys);
        pedestal.animations = [pedestalBounce];
        this.scene.beginAnimation(pedestal, 0, 60, true);
      }

      this.playerAvatars.push(avatar, nameplate, pedestal, armLeft, armRight, legLeft, legRight);
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

  private async setupLobbyHDRIEnvironment(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    try {
      // Professional lobby environment with subtle lighting
      this.scene.environmentIntensity = 0.6;
      
      // Create a subtle gradient skybox for lobby
      const skybox = BABYLON.MeshBuilder.CreateSphere('lobbySkyBox', { diameter: 80 }, this.scene);
      const skyboxMaterial = new BABYLON.StandardMaterial('lobbySkyBox', this.scene);
      skyboxMaterial.backFaceCulling = false;
      skyboxMaterial.disableLighting = true;
      skyboxMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.1, 0.25); // Deep blue
      skybox.material = skyboxMaterial;
      skybox.infiniteDistance = true;

      // Add subtle environment texture for reflections
      const envTexture = new BABYLON.CubeTexture.CreateFromImages([
        'data:,', 'data:,', 'data:,', 'data:,', 'data:,', 'data:,'
      ], this.scene);
      
      this.scene.environmentTexture = envTexture;

      console.log('✅ Lobby HDRI environment setup completed');
    } catch (error) {
      console.warn('⚠️  Lobby HDRI environment setup failed:', error);
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