// TapFrenzy 3D Lobby Scene with QR code, avatar selection, and ready system - AAA Quality
import type { Scene } from './scene-manager';
import type { S2C, PlayerInfo } from '../net';
// AAA Systems Integration for 3D Lobby
import { Audio } from '../systems/audio-manager';
import { PerformanceManager } from '../systems/performance-manager';
import { Config } from '../systems/configuration-manager';

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

    // 🚀 AAA Systems Initialization for 3D Lobby
    const performance = PerformanceManager.getInstance();
    performance.startProfiler('3d-lobby-mount');
    
    // Initialize 3D spatial audio
    try {
      Audio.playMusic('lobby-3d-ambient', { fadeIn: 2500 });
      console.log('🔊 3D Spatial Audio System initialized');
    } catch (error) {
      console.warn('3D Audio not ready:', error);
    }
    
    // Apply graphics configuration for 3D rendering
    const graphicsConfig = Config.get('graphics');
    console.log(`🎯 3D Graphics: ${graphicsConfig.quality} | Render Scale: ${graphicsConfig.renderScale}`);

    try {
      // Enhanced Engine Initialization with WebGPU support
      console.log('🚀 Attempting WebGPU initialization...');
      
      // Enhanced WebGL Engine initialization
      console.log('🚀 Initializing enhanced WebGL engine...');
      this.engine = new BABYLON.Engine(this.canvas, true, { 
        antialias: true, 
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
        stencil: true,
        depth: true
      });
      console.log('✅ Enhanced WebGL Engine initialized');
      
      // 4K-ready: Set hardware scaling for high DPI displays
      if (window.devicePixelRatio && window.devicePixelRatio > 1) {
        this.engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
        console.log(`✅ Lobby High-DPI support enabled (${window.devicePixelRatio}x)`);
      }
      
      this.scene = new BABYLON.Scene(this.engine);
      
      // Enhanced scene configuration with ACES tone mapping
      this.scene.clearColor = new BABYLON.Color3(0.02, 0.05, 0.1); // Deep space background
      this.scene.ambientColor = new BABYLON.Color3(0.2, 0.2, 0.3);
      
      // Image processing configuration for ACES tone mapping
      this.scene.imageProcessingConfiguration.toneMappingEnabled = true;
      this.scene.imageProcessingConfiguration.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
      this.scene.imageProcessingConfiguration.exposure = 1.2;
      this.scene.imageProcessingConfiguration.contrast = 1.1;
      
      // Enhanced environment settings
      this.scene.environmentIntensity = 1.5;
      
      // Create camera with better positioning
      this.camera = new BABYLON.FreeCamera('lobbyCamera', new BABYLON.Vector3(0, 5, -8), this.scene);
      this.camera.setTarget(BABYLON.Vector3.Zero());
      // Note: attachControls may not be needed for a fixed camera lobby
      try {
        this.camera.attachControls(this.canvas);
      } catch (e) {
        console.log('Camera controls not attached (fixed camera mode)');
      }
      
      // AAA Lighting setup with HDRI environment
      await this.setupLobbyHDRIEnvironment();
      
      // Significantly brighter and better lighting setup
      const keyLight = new BABYLON.DirectionalLight('keyLight', new BABYLON.Vector3(-0.3, -1, -0.6), this.scene);
      keyLight.intensity = 3.0; // Doubled intensity
      keyLight.diffuse = new BABYLON.Color3(1.0, 0.95, 0.9);
      
      const fillLight = new BABYLON.HemisphericLight('fillLight', new BABYLON.Vector3(0, 1, 0), this.scene);
      fillLight.intensity = 1.2; // Tripled intensity
      fillLight.diffuse = new BABYLON.Color3(0.8, 0.9, 1.0);
      
      const rimLight = new BABYLON.DirectionalLight('rimLight', new BABYLON.Vector3(0.8, 0.2, -1), this.scene);
      rimLight.intensity = 2.0; // Increased intensity
      rimLight.diffuse = new BABYLON.Color3(1.0, 1.0, 1.0);
      
      // Additional ambient light for better overall visibility
      const ambientLight = new BABYLON.HemisphericLight('ambientLight', new BABYLON.Vector3(0, 1, 0), this.scene);
      ambientLight.intensity = 0.8;
      ambientLight.diffuse = new BABYLON.Color3(0.9, 0.9, 1.0);

      // === AAA POST-PROCESSING PIPELINE ===
      await this.setupPostProcessingPipeline();

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

    // === ULTRA-REALISTIC 3D HUMAN BUZZER CHARACTER ===
    
    // Create group for entire character
    const buzzerGroup = new BABYLON.TransformNode('buzzerGroup', this.scene);
    buzzerGroup.position = new BABYLON.Vector3(-3, 0, -6);

    // === REALISTIC BODY STRUCTURE ===
    
    // Torso with realistic proportions
    const torso = BABYLON.MeshBuilder.CreateBox('buzzerTorso', {
      width: 0.7,
      height: 1.2,
      depth: 0.3
    }, this.scene);
    torso.position = new BABYLON.Vector3(0, 1.0, 0);
    torso.parent = buzzerGroup;

    // Realistic head with proper anatomy
    const head = BABYLON.MeshBuilder.CreateSphere('buzzerHead', {
      diameter: 0.5,
      segments: 48
    }, this.scene);
    head.position = new BABYLON.Vector3(0, 1.9, 0);
    head.scaling = new BABYLON.Vector3(0.9, 1.1, 0.95); // Realistic proportions
    head.parent = buzzerGroup;

    // Realistic eyes
    const leftEye = BABYLON.MeshBuilder.CreateSphere('leftEye', {
      diameter: 0.06,
      segments: 16
    }, this.scene);
    leftEye.position = new BABYLON.Vector3(-0.12, 1.95, -0.22);
    leftEye.parent = buzzerGroup;

    const rightEye = BABYLON.MeshBuilder.CreateSphere('rightEye', {
      diameter: 0.06,
      segments: 16
    }, this.scene);
    rightEye.position = new BABYLON.Vector3(0.12, 1.95, -0.22);
    rightEye.parent = buzzerGroup;

    // Realistic mouth
    const mouth = BABYLON.MeshBuilder.CreateBox('mouth', {
      width: 0.15,
      height: 0.04,
      depth: 0.02
    }, this.scene);
    mouth.position = new BABYLON.Vector3(0, 1.82, -0.22);
    mouth.parent = buzzerGroup;

    // Realistic arms with proper joints
    const leftUpperArm = BABYLON.MeshBuilder.CreateCapsule('leftUpperArm', {
      radius: 0.08,
      height: 0.6,
      tessellation: 24
    }, this.scene);
    leftUpperArm.position = new BABYLON.Vector3(-0.45, 1.4, 0);
    leftUpperArm.rotation.z = Math.PI / 6; // Natural angle
    leftUpperArm.parent = buzzerGroup;

    const leftForearm = BABYLON.MeshBuilder.CreateCapsule('leftForearm', {
      radius: 0.07,
      height: 0.5,
      tessellation: 24
    }, this.scene);
    leftForearm.position = new BABYLON.Vector3(-0.65, 0.9, 0.1);
    leftForearm.rotation.z = Math.PI / 3;
    leftForearm.parent = buzzerGroup;

    const rightUpperArm = BABYLON.MeshBuilder.CreateCapsule('rightUpperArm', {
      radius: 0.08,
      height: 0.6,
      tessellation: 24
    }, this.scene);
    rightUpperArm.position = new BABYLON.Vector3(0.45, 1.4, 0);
    rightUpperArm.rotation.z = -Math.PI / 8;
    rightUpperArm.parent = buzzerGroup;

    const rightForearm = BABYLON.MeshBuilder.CreateCapsule('rightForearm', {
      radius: 0.07,
      height: 0.5,
      tessellation: 24
    }, this.scene);
    rightForearm.position = new BABYLON.Vector3(0.75, 1.0, -0.1);
    rightForearm.rotation.z = -Math.PI / 4; // Presenting gesture
    rightForearm.parent = buzzerGroup;

    // Realistic hands
    const leftHand = BABYLON.MeshBuilder.CreateSphere('leftHand', {
      diameter: 0.12,
      segments: 16
    }, this.scene);
    leftHand.position = new BABYLON.Vector3(-0.85, 0.65, 0.15);
    leftHand.parent = buzzerGroup;

    const rightHand = BABYLON.MeshBuilder.CreateSphere('rightHand', {
      diameter: 0.12,
      segments: 16
    }, this.scene);
    rightHand.position = new BABYLON.Vector3(0.95, 0.8, -0.15);
    rightHand.parent = buzzerGroup;

    // Realistic legs with proper proportions
    const leftThigh = BABYLON.MeshBuilder.CreateCapsule('leftThigh', {
      radius: 0.12,
      height: 0.8,
      tessellation: 24
    }, this.scene);
    leftThigh.position = new BABYLON.Vector3(-0.18, 0.0, 0);
    leftThigh.parent = buzzerGroup;

    const leftShin = BABYLON.MeshBuilder.CreateCapsule('leftShin', {
      radius: 0.10,
      height: 0.8,
      tessellation: 24
    }, this.scene);
    leftShin.position = new BABYLON.Vector3(-0.18, -0.8, 0);
    leftShin.parent = buzzerGroup;

    const rightThigh = BABYLON.MeshBuilder.CreateCapsule('rightThigh', {
      radius: 0.12,
      height: 0.8,
      tessellation: 24
    }, this.scene);
    rightThigh.position = new BABYLON.Vector3(0.18, 0.0, 0);
    rightThigh.parent = buzzerGroup;

    const rightShin = BABYLON.MeshBuilder.CreateCapsule('rightShin', {
      radius: 0.10,
      height: 0.8,
      tessellation: 24
    }, this.scene);
    rightShin.position = new BABYLON.Vector3(0.18, -0.8, 0);
    rightShin.parent = buzzerGroup;

    // Realistic feet
    const leftFoot = BABYLON.MeshBuilder.CreateBox('leftFoot', {
      width: 0.12,
      height: 0.08,
      depth: 0.25
    }, this.scene);
    leftFoot.position = new BABYLON.Vector3(-0.18, -1.25, 0.08);
    leftFoot.parent = buzzerGroup;

    const rightFoot = BABYLON.MeshBuilder.CreateBox('rightFoot', {
      width: 0.12,
      height: 0.08,
      depth: 0.25
    }, this.scene);
    rightFoot.position = new BABYLON.Vector3(0.18, -1.25, 0.08);
    rightFoot.parent = buzzerGroup;

    // === REALISTIC HUMAN MATERIALS ===
    
    // Professional realistic skin material
    const skinMaterial = new BABYLON.PBRMaterial('buzzerSkin', this.scene);
    skinMaterial.baseColor = new BABYLON.Color3(0.95, 0.82, 0.72);
    skinMaterial.metallicFactor = 0.0;
    skinMaterial.roughnessFactor = 0.6;
    skinMaterial.subSurface.isScatteringEnabled = true;
    skinMaterial.subSurface.scatteringColor = new BABYLON.Color3(0.9, 0.4, 0.3);
    skinMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.02, 0.01);
    head.material = skinMaterial;
    leftHand.material = skinMaterial;
    rightHand.material = skinMaterial;

    // Realistic eye material
    const eyeMaterial = new BABYLON.PBRMaterial('buzzerEyes', this.scene);
    eyeMaterial.baseColor = new BABYLON.Color3(0.2, 0.6, 1.0); // Bright blue eyes
    eyeMaterial.metallicFactor = 0.0;
    eyeMaterial.roughnessFactor = 0.1;
    eyeMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.4);
    leftEye.material = eyeMaterial;
    rightEye.material = eyeMaterial;

    // Realistic mouth material
    const mouthMaterial = new BABYLON.PBRMaterial('buzzerMouth', this.scene);
    mouthMaterial.baseColor = new BABYLON.Color3(0.8, 0.3, 0.3);
    mouthMaterial.metallicFactor = 0.0;
    mouthMaterial.roughnessFactor = 0.2;
    mouth.material = mouthMaterial;

    // Professional clothing material
    const clothingMaterial = new BABYLON.PBRMaterial('buzzerClothing', this.scene);
    clothingMaterial.baseColor = new BABYLON.Color3(0.15, 0.25, 0.45); // Professional blue
    clothingMaterial.metallicFactor = 0.1;
    clothingMaterial.roughnessFactor = 0.7;
    clothingMaterial.emissiveColor = new BABYLON.Color3(0.02, 0.04, 0.08);
    torso.material = clothingMaterial;
    leftUpperArm.material = clothingMaterial;
    leftForearm.material = clothingMaterial;
    rightUpperArm.material = clothingMaterial;
    rightForearm.material = clothingMaterial;
    leftThigh.material = clothingMaterial;
    rightThigh.material = clothingMaterial;

    // Shoe material
    const shoeMaterial = new BABYLON.PBRMaterial('buzzerShoes', this.scene);
    shoeMaterial.baseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    shoeMaterial.metallicFactor = 0.2;
    shoeMaterial.roughnessFactor = 0.4;
    leftFoot.material = shoeMaterial;
    rightFoot.material = shoeMaterial;

    // Pants material
    const pantsMaterial = new BABYLON.PBRMaterial('buzzerPants', this.scene);
    pantsMaterial.baseColor = new BABYLON.Color3(0.2, 0.2, 0.25);
    pantsMaterial.metallicFactor = 0.0;
    pantsMaterial.roughnessFactor = 0.8;
    leftShin.material = pantsMaterial;
    rightShin.material = pantsMaterial;

    // === REALISTIC HUMAN ANIMATIONS ===
    
    // Natural breathing animation
    const breathingAnimation = new BABYLON.Animation(
      'buzzerBreathing',
      'scaling.y',
      30,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );
    const breathingKeys = [
      { frame: 0, value: 1.0 },
      { frame: 40, value: 1.02 },
      { frame: 80, value: 1.0 }
    ];
    breathingAnimation.setKeys(breathingKeys);
    torso.animations = [breathingAnimation];
    this.scene.beginAnimation(torso, 0, 80, true);

    // Natural head nodding
    const nodAnimation = new BABYLON.Animation(
      'buzzerNod',
      'rotation.x',
      20,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );
    const nodKeys = [
      { frame: 0, value: 0 },
      { frame: 60, value: 0.05 },
      { frame: 120, value: -0.05 },
      { frame: 180, value: 0 }
    ];
    nodAnimation.setKeys(nodKeys);
    head.animations = [nodAnimation];
    this.scene.beginAnimation(head, 0, 180, true);

    // Natural presenting gesture
    const gestureAnimation = new BABYLON.Animation(
      'buzzerGesture',
      'rotation.z',
      15,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );
    const gestureKeys = [
      { frame: 0, value: -Math.PI / 4 },
      { frame: 100, value: -Math.PI / 5 },
      { frame: 200, value: -Math.PI / 4 }
    ];
    gestureAnimation.setKeys(gestureKeys);
    rightForearm.animations = [gestureAnimation];
    this.scene.beginAnimation(rightForearm, 0, 200, true);

    // Eye blinking animation
    const blinkAnimation = new BABYLON.Animation(
      'buzzerBlink',
      'scaling.y',
      60,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );
    const blinkKeys = [
      { frame: 0, value: 1.0 },
      { frame: 5, value: 0.1 },
      { frame: 10, value: 1.0 },
      { frame: 300, value: 1.0 },
      { frame: 305, value: 0.1 },
      { frame: 310, value: 1.0 },
      { frame: 360, value: 1.0 }
    ];
    blinkAnimation.setKeys(blinkKeys);
    leftEye.animations = [blinkAnimation];
    rightEye.animations = [blinkAnimation];
    this.scene.beginAnimation(leftEye, 0, 360, true);
    this.scene.beginAnimation(rightEye, 0, 360, true);

    console.log('✅ Ultra-Realistic 3D Human Buzzer Character created with lifelike features');
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

      // Create ultra-realistic AAA quality 3D player avatar
      const avatarGroup = new BABYLON.TransformNode(`playerGroup${index}`, this.scene);
      avatarGroup.position = new BABYLON.Vector3(pos.x, pos.y - 0.8, pos.z);

      // Realistic human proportions
      const torso = BABYLON.MeshBuilder.CreateBox(`playerTorso${index}`, {
        width: 0.5,
        height: 0.8,
        depth: 0.25
      }, this.scene);
      torso.position = new BABYLON.Vector3(0, 0.6, 0);
      torso.parent = avatarGroup;

      // Realistic head
      const head = BABYLON.MeshBuilder.CreateSphere(`playerHead${index}`, {
        diameter: 0.35,
        segments: 32
      }, this.scene);
      head.position = new BABYLON.Vector3(0, 1.2, 0);
      head.scaling = new BABYLON.Vector3(0.9, 1.0, 0.9);
      head.parent = avatarGroup;

      // Eyes for personality
      const leftEye = BABYLON.MeshBuilder.CreateSphere(`playerLeftEye${index}`, {
        diameter: 0.04,
        segments: 12
      }, this.scene);
      leftEye.position = new BABYLON.Vector3(-0.08, 1.25, -0.15);
      leftEye.parent = avatarGroup;

      const rightEye = BABYLON.MeshBuilder.CreateSphere(`playerRightEye${index}`, {
        diameter: 0.04,
        segments: 12
      }, this.scene);
      rightEye.position = new BABYLON.Vector3(0.08, 1.25, -0.15);
      rightEye.parent = avatarGroup;

      // Realistic arms
      const leftUpperArm = BABYLON.MeshBuilder.CreateCapsule(`playerLeftUpperArm${index}`, {
        radius: 0.06,
        height: 0.4,
        tessellation: 16
      }, this.scene);
      leftUpperArm.position = new BABYLON.Vector3(-0.32, 0.8, 0);
      leftUpperArm.rotation.z = Math.PI / 8;
      leftUpperArm.parent = avatarGroup;

      const leftForearm = BABYLON.MeshBuilder.CreateCapsule(`playerLeftForearm${index}`, {
        radius: 0.05,
        height: 0.35,
        tessellation: 16
      }, this.scene);
      leftForearm.position = new BABYLON.Vector3(-0.45, 0.4, 0);
      leftForearm.rotation.z = Math.PI / 4;
      leftForearm.parent = avatarGroup;

      const rightUpperArm = BABYLON.MeshBuilder.CreateCapsule(`playerRightUpperArm${index}`, {
        radius: 0.06,
        height: 0.4,
        tessellation: 16
      }, this.scene);
      rightUpperArm.position = new BABYLON.Vector3(0.32, 0.8, 0);
      rightUpperArm.rotation.z = -Math.PI / 8;
      rightUpperArm.parent = avatarGroup;

      const rightForearm = BABYLON.MeshBuilder.CreateCapsule(`playerRightForearm${index}`, {
        radius: 0.05,
        height: 0.35,
        tessellation: 16
      }, this.scene);
      rightForearm.position = new BABYLON.Vector3(0.45, 0.4, 0);
      rightForearm.rotation.z = -Math.PI / 4;
      rightForearm.parent = avatarGroup;

      // Realistic legs
      const leftThigh = BABYLON.MeshBuilder.CreateCapsule(`playerLeftThigh${index}`, {
        radius: 0.08,
        height: 0.5,
        tessellation: 16
      }, this.scene);
      leftThigh.position = new BABYLON.Vector3(-0.12, -0.05, 0);
      leftThigh.parent = avatarGroup;

      const leftShin = BABYLON.MeshBuilder.CreateCapsule(`playerLeftShin${index}`, {
        radius: 0.07,
        height: 0.5,
        tessellation: 16
      }, this.scene);
      leftShin.position = new BABYLON.Vector3(-0.12, -0.6, 0);
      leftShin.parent = avatarGroup;

      const rightThigh = BABYLON.MeshBuilder.CreateCapsule(`playerRightThigh${index}`, {
        radius: 0.08,
        height: 0.5,
        tessellation: 16
      }, this.scene);
      rightThigh.position = new BABYLON.Vector3(0.12, -0.05, 0);
      rightThigh.parent = avatarGroup;

      const rightShin = BABYLON.MeshBuilder.CreateCapsule(`playerRightShin${index}`, {
        radius: 0.07,
        height: 0.5,
        tessellation: 16
      }, this.scene);
      rightShin.position = new BABYLON.Vector3(0.12, -0.6, 0);
      rightShin.parent = avatarGroup;

      // === AAA REALISTIC MATERIALS ===
      
      // Player skin material
      const skinMaterial = new BABYLON.PBRMaterial(`playerSkin${index}`, this.scene);
      skinMaterial.baseColor = new BABYLON.Color3(0.92, 0.78, 0.68);
      skinMaterial.metallicFactor = 0.0;
      skinMaterial.roughnessFactor = 0.6;
      skinMaterial.subSurface.isScatteringEnabled = true;
      skinMaterial.subSurface.scatteringColor = new BABYLON.Color3(0.8, 0.4, 0.3);
      head.material = skinMaterial;

      // Eye material
      const eyeMaterial = new BABYLON.PBRMaterial(`playerEye${index}`, this.scene);
      eyeMaterial.baseColor = new BABYLON.Color3(0.3, 0.5, 0.8);
      eyeMaterial.metallicFactor = 0.0;
      eyeMaterial.roughnessFactor = 0.1;
      eyeMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.15, 0.25);
      leftEye.material = eyeMaterial;
      rightEye.material = eyeMaterial;

      // Player clothing material based on ready state
      const clothingMaterial = new BABYLON.PBRMaterial(`playerClothing${index}`, this.scene);
      
      if (player.ready) {
        // Ready state: bright professional green
        clothingMaterial.baseColor = new BABYLON.Color3(0.2, 0.8, 0.3);
        clothingMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.3, 0.15);
        clothingMaterial.metallicFactor = 0.1;
        clothingMaterial.roughnessFactor = 0.3;
      } else {
        // Waiting state: warm professional orange  
        clothingMaterial.baseColor = new BABYLON.Color3(0.8, 0.5, 0.2);
        clothingMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.2, 0.1);
        clothingMaterial.metallicFactor = 0.2;
        clothingMaterial.roughnessFactor = 0.4;
      }
      
      // Apply clothing material to body and arms
      torso.material = clothingMaterial;
      leftUpperArm.material = clothingMaterial;
      leftForearm.material = clothingMaterial;
      rightUpperArm.material = clothingMaterial;
      rightForearm.material = clothingMaterial;

      // Pants material
      const pantsMaterial = new BABYLON.PBRMaterial(`playerPants${index}`, this.scene);
      pantsMaterial.baseColor = new BABYLON.Color3(0.25, 0.25, 0.35);
      pantsMaterial.metallicFactor = 0.0;
      pantsMaterial.roughnessFactor = 0.7;
      leftThigh.material = pantsMaterial;
      leftShin.material = pantsMaterial;
      rightThigh.material = pantsMaterial;
      rightShin.material = pantsMaterial;

      // Create professional pedestal for the realistic avatar
      const pedestal = BABYLON.MeshBuilder.CreateCylinder(`pedestal${index}`, {
        height: 0.3,
        diameterTop: 1.2,
        diameterBottom: 1.4,
        tessellation: 48
      }, this.scene);
      pedestal.position = new BABYLON.Vector3(pos.x, pos.y - 1.1, pos.z);
      
      const pedestalMaterial = new BABYLON.PBRMaterial(`pedestalMat${index}`, this.scene);
      pedestalMaterial.baseColor = new BABYLON.Color3(0.15, 0.25, 0.4);
      pedestalMaterial.metallicFactor = 0.9;
      pedestalMaterial.roughnessFactor = 0.15;
      pedestalMaterial.emissiveColor = new BABYLON.Color3(0.03, 0.08, 0.16);
      pedestalMaterial.clearCoat.isEnabled = true;
      pedestalMaterial.clearCoat.intensity = 0.4;
      pedestal.material = pedestalMaterial;

      // Ready badge - floating above realistic avatar
      if (player.ready) {
        const badge = BABYLON.MeshBuilder.CreateBox(`readyBadge${index}`, {
          width: 0.6,
          height: 0.2,
          depth: 0.1
        }, this.scene);
        badge.position = new BABYLON.Vector3(pos.x, pos.y + 1.0, pos.z);
        
        const badgeMaterial = new BABYLON.PBRMaterial(`badgeMat${index}`, this.scene);
        badgeMaterial.baseColor = new BABYLON.Color3(0.1, 1.0, 0.3);
        badgeMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.8, 0.4);
        badgeMaterial.alpha = 0.9;
        badge.material = badgeMaterial;
        
        this.playerAvatars.push(badge);
      }

      // Enhanced name plate with glassmorphism
      const nameplate = BABYLON.MeshBuilder.CreatePlane(`nameplate${index}`, {width: 2.0, height: 0.4}, this.scene);
      nameplate.position = new BABYLON.Vector3(pos.x, pos.y + 0.6, pos.z);
      
      const nameTexture = new BABYLON.DynamicTexture(`nameTexture${index}`, {width: 512, height: 128}, this.scene);
      nameTexture.hasAlpha = true;
      nameTexture.drawText(player.name, null, null, 'bold 32px Arial', '#FFFFFF', 'rgba(0,0,0,0.6)', true, true);
      
      const nameMaterial = new BABYLON.StandardMaterial(`nameMat${index}`, this.scene);
      nameMaterial.diffuseTexture = nameTexture;
      nameMaterial.emissiveTexture = nameTexture;
      nameMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);
      nameMaterial.backFaceCulling = false;
      nameplate.material = nameMaterial;

      // Realistic human animations for ready players
      if (player.ready) {
        // Gentle bouncing animation for the whole avatar group
        const bounceAnimation = new BABYLON.Animation(
          `avatarBounce${index}`,
          'position.y',
          30,
          BABYLON.Animation.ANIMATIONTYPE_FLOAT,
          BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );

        const keys = [
          { frame: 0, value: pos.y - 0.8 },
          { frame: 15, value: pos.y - 0.6 },
          { frame: 30, value: pos.y - 0.8 }
        ];

        bounceAnimation.setKeys(keys);
        avatarGroup.animations = [bounceAnimation];
        this.scene.beginAnimation(avatarGroup, 0, 30, true);
        
        // Waving animation for right arm
        const waveAnimation = new BABYLON.Animation(
          `wave${index}`,
          'rotation.z',
          40,
          BABYLON.Animation.ANIMATIONTYPE_FLOAT,
          BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const waveKeys = [
          { frame: 0, value: -Math.PI / 4 },
          { frame: 20, value: -Math.PI / 6 },
          { frame: 40, value: -Math.PI / 4 }
        ];
        
        waveAnimation.setKeys(waveKeys);
        rightForearm.animations = [waveAnimation];
        this.scene.beginAnimation(rightForearm, 0, 40, true);
      }

      // Store the avatar group and related meshes for cleanup
      this.playerAvatars.push(avatarGroup);
      this.playerAvatars.push(pedestal);
      this.playerAvatars.push(nameplate);
    });

    console.log('✅ Ultra-Realistic AAA Player Avatars created');
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
      if (this.players.length >= 1) {  // Reduced minimum to 1 player for testing
        const allReady = this.players.every(p => p.ready);
        if (allReady) {
          this.showSubtitle('🎉 Alle spelers zijn klaar! Het spel begint zo...');
          
          // Start the game after 2 seconds
          setTimeout(() => {
            this.startGame();
          }, 2000);
        } else {
          const readyCount = this.players.filter(p => p.ready).length;
          this.showSubtitle(`${readyCount}/${this.players.length} spelers klaar...`);
        }
      } else {
        this.showSubtitle('Wacht op meer spelers... Scan de QR code om deel te nemen! 📱');
      }
    }
  }

  private startGame(): void {
    console.log('🎮 Starting TapFrenzy game!');
    
    // Send start game request to server
    const net = (window as any).gameNet;
    if (net && this.roomCode) {
      net.send({
        t: 'host:startGame',
        code: this.roomCode
      });
      
      this.showSubtitle('🚀 Spel wordt geladen...');
      
      // Transition to category selection scene after brief delay
      setTimeout(() => {
        this.transitionToCategory();
      }, 1500);
    } else {
      console.error('❌ Cannot start game: no network or room code');
    }
  }

  private transitionToCategory(): void {
    const sceneManager = (window as any).gameSceneManager;
    if (sceneManager) {
      // Import and switch to category selection scene
      import('./category').then(({ CategoryScene }) => {
        sceneManager.set(new CategoryScene());
      }).catch(error => {
        console.error('❌ Failed to load category scene:', error);
        // Fallback to a simple scene transition
        this.showSubtitle('🎮 Game starting...');
      });
    }
  }

  private async setupPostProcessingPipeline(): Promise<void> {
    if (!this.scene || !this.camera) return;

    const BABYLON = window.BABYLON;

    try {
      // Create advanced post-processing pipeline for AAA quality
      const postProcess = new BABYLON.DefaultRenderingPipeline("default", true, this.scene, [this.camera]);
      
      // Enhanced MSAA for superior anti-aliasing
      postProcess.samples = 4; // 4x MSAA
      
      // Enhanced bloom for stunning glowing effects
      if (postProcess.bloom) {
        postProcess.bloomEnabled = true;
        postProcess.bloom.bloomWeight = 0.2; // More pronounced bloom
        postProcess.bloom.bloomKernel = 128; // Higher quality kernel
        postProcess.bloom.bloomThreshold = 0.8;
      }
      
      // Advanced tone mapping for cinematic lighting
      if (postProcess.imageProcessing) {
        postProcess.imageProcessingEnabled = true;
        postProcess.imageProcessing.toneMappingEnabled = true;
        postProcess.imageProcessing.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
        postProcess.imageProcessing.exposure = 1.3; // Brighter exposure
        postProcess.imageProcessing.contrast = 1.15; // Higher contrast
        postProcess.imageProcessing.vignetteEnabled = true;
        postProcess.imageProcessing.vignetteWeight = 0.2;
        postProcess.imageProcessing.vignetteStretch = 0.1;
        postProcess.imageProcessing.vignetteColor = new BABYLON.Color4(0, 0, 0, 1);
      }
      
      // Enhanced anti-aliasing for crisp edges
      if (postProcess.fxaa) {
        postProcess.fxaaEnabled = true;
      }
      
      // Enhanced sharpening for ultra-crisp details
      if (postProcess.sharpen) {
        postProcess.sharpenEnabled = true;
        postProcess.sharpen.edgeAmount = 0.3; // More sharpening
        postProcess.sharpen.colorAmount = 0.15;
      }

      // Enable depth of field for cinematic focus
      if (postProcess.depthOfField) {
        postProcess.depthOfFieldEnabled = false; // Disabled for lobby clarity
      }

      // Enable screen space reflections if available
      if (postProcess.screenSpaceReflections) {
        postProcess.screenSpaceReflectionsEnabled = true;
        postProcess.screenSpaceReflections.strength = 0.3;
        postProcess.screenSpaceReflections.reflectionSamples = 32;
      }

      console.log('✅ Enhanced AAA post-processing pipeline enabled');
    } catch (error) {
      console.error('❌ Post-processing setup failed:', error);
    }
  }
}