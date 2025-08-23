// TapFrenzy Ultra-Realistic 3D Start Screen - Knowledge Is Power Inspired Experience
import type { Scene } from './scene-manager';
import type { S2C } from '../net';

declare global {
  interface Window {
    BABYLON: any;
    webkitAudioContext?: typeof AudioContext;
  }
}

export class Menu3DScene implements Scene {
  private canvas?: HTMLCanvasElement;
  private engine?: any;
  private scene?: any;
  private camera?: any;
  private buzzer?: any;
  private logoMesh?: any;
  private menuButtons?: any[];
  private audioContext?: AudioContext;
  private guiTexture?: any;
  private qrCodeImage?: any;
  private roomCodeText?: any;
  private studioLights?: any[];
  private particleSystems?: any[];

  async mount(root: HTMLElement): Promise<void> {
    // Create ultra-wide canvas for cinematic experience
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100vh';
    this.canvas.style.display = 'block';
    this.canvas.style.backgroundColor = '#0a1428'; // Deep TV studio blue
    
    root.innerHTML = '';
    root.appendChild(this.canvas);

    // Ensure Babylon.js is loaded
    if (!window.BABYLON) {
      throw new Error('Babylon.js not loaded');
    }

    const BABYLON = window.BABYLON;
    console.log('🚀 Initializing Ultra-Realistic TapFrenzy Start Screen');

    try {
      // Initialize high-performance rendering engine
      this.engine = new BABYLON.Engine(this.canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
      
      // 4K optimization
      if (window.devicePixelRatio > 1) {
        this.engine.setHardwareScalingLevel(Math.max(0.8, 1 / window.devicePixelRatio));
      }
      
      this.scene = new BABYLON.Scene(this.engine);
      
      // Professional TV studio background color
      this.scene.clearColor = new BABYLON.Color3(0.04, 0.08, 0.16); // Rich navy blue
      this.scene.ambientColor = new BABYLON.Color3(0.15, 0.25, 0.35);
      
      console.log('✅ Ultra-Realistic rendering engine initialized');

      // Create optimal camera for TV studio viewing
      this.setupOptimalCamera();
      
      // Build professional TV studio environment 
      await this.createTVStudioEnvironment();
      
      // Create iconic TAPFRENZY logo with premium materials
      await this.createUltraRealisticLogo();
      
      // Build Knowledge Is Power inspired menu system
      await this.createProfessionalMenuSystem();
      
      // Create broadcast-quality buzzer character
      await this.createBroadcastQualityBuzzer();
      
      // Add cinematic particle effects
      this.createCinematicParticleSystem();
      
      // Setup film-quality lighting
      this.setupBroadcastLighting();
      
      // Add premium post-processing
      this.setupPremiumPostProcessing();
      
      // Create professional QR overlay
      await this.createProfessionalQROverlay();
      
      // Initialize game show audio
      this.initializeGameShowAudio();

      // Handle responsive resizing
      window.addEventListener('resize', () => this.engine?.resize());
      
      // Start ultra-smooth render loop
      this.engine.runRenderLoop(() => {
        if (this.scene) {
          this.scene.render();
        }
      });
      
      console.log('🏆 Ultra-Realistic TapFrenzy Start Screen is LIVE!');
      
      // Welcome message with professional presentation
      setTimeout(() => this.buzzerWelcomeMessage(), 1000);

    } catch (error) {
      console.error('❌ Ultra-Realistic rendering failed:', error);
      this.createFallbackExperience(root);
    }
  }

  private setupOptimalCamera(): void {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;
    
    // Create camera with optimal positioning for all elements
    this.camera = new BABYLON.ArcRotateCamera(
      'studioCamera', 
      0, // alpha - direct front view
      Math.PI / 3, // beta - elevated 60-degree view
      15, // radius - close enough to see everything clearly
      new BABYLON.Vector3(0, 2, 0), // target center of action
      this.scene
    );
    
    // Lock camera for static experience (no user controls)
    this.camera.inputs.clear();
    this.camera.inertia = 0;
    this.camera.panningSensibility = 0;
    this.camera.wheelDeltaPercentage = 0;
    
    console.log('✅ Optimal camera positioned for ultra-realistic viewing');
  }

  private async createTVStudioEnvironment(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;
    
    // Create stunning TV studio floor
    const studioFloor = BABYLON.MeshBuilder.CreateGround('studioFloor', {
      width: 30, height: 30, subdivisions: 16
    }, this.scene);
    studioFloor.position.y = -0.1;

    // Ultra-realistic floor material
    const floorMaterial = new BABYLON.PBRMaterial('studioFloorMat', this.scene);
    floorMaterial.baseColor = new BABYLON.Color3(0.12, 0.2, 0.4); // Deep studio blue
    floorMaterial.metallicFactor = 0.9; // Highly reflective
    floorMaterial.roughnessFactor = 0.1; // Very smooth for reflections
    floorMaterial.emissiveColor = new BABYLON.Color3(0.02, 0.05, 0.1); // Subtle glow
    studioFloor.material = floorMaterial;

    // Stunning backdrop wall
    const backdrop = BABYLON.MeshBuilder.CreateBox('backdrop', {
      width: 25, height: 12, depth: 1
    }, this.scene);
    backdrop.position = new BABYLON.Vector3(0, 6, -10);

    const backdropMaterial = new BABYLON.PBRMaterial('backdropMat', this.scene);
    backdropMaterial.baseColor = new BABYLON.Color3(0.08, 0.15, 0.3); // Rich blue backdrop
    backdropMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.1, 0.2); // Professional glow
    backdropMaterial.metallicFactor = 0.3;
    backdropMaterial.roughnessFactor = 0.6;
    backdrop.material = backdropMaterial;

    console.log('✅ Ultra-realistic TV studio environment created');
  }

  private async createUltraRealisticLogo(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create stunning 3D "TAPFRENZY" logo
    this.logoMesh = new BABYLON.Mesh('tapfrenzyLogo', this.scene);
    
    // Use high-quality text mesh creation
    const logoText = BABYLON.MeshBuilder.CreateBox('logoBox', {
      width: 8, height: 1.5, depth: 0.8
    }, this.scene);
    logoText.position = new BABYLON.Vector3(0, 8, -2); // High visibility position
    logoText.parent = this.logoMesh;

    // Premium logo material with Knowledge Is Power styling
    const logoMaterial = new BABYLON.PBRMaterial('logoMaterial', this.scene);
    logoMaterial.baseColor = new BABYLON.Color3(0.0, 1.0, 1.0); // Bright cyan
    logoMaterial.emissiveColor = new BABYLON.Color3(0.3, 1.2, 1.5); // Intense glow
    logoMaterial.metallicFactor = 0.8;
    logoMaterial.roughnessFactor = 0.1;
    logoText.material = logoMaterial;

    // Add dynamic texture with "TAPFRENZY" text
    const logoTexture = new BABYLON.DynamicTexture('logoTexture', {
      width: 2048, height: 512
    }, this.scene);
    logoTexture.drawText('TAPFRENZY', null, null, 
      'bold 160px Impact', '#00FFFF', 'transparent', true, true);
    
    // Create text plane for crisp logo display
    const logoPlane = BABYLON.MeshBuilder.CreatePlane('logoPlane', {
      width: 8, height: 2
    }, this.scene);
    logoPlane.position = new BABYLON.Vector3(0, 8, 0); // Prominent position
    
    const planeMaterial = new BABYLON.StandardMaterial('logoPlane', this.scene);
    planeMaterial.diffuseTexture = logoTexture;
    planeMaterial.emissiveTexture = logoTexture;
    planeMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    planeMaterial.backFaceCulling = false;
    logoPlane.material = planeMaterial;

    // Floating animation
    const floatAnimation = new BABYLON.Animation(
      'logoFloat', 'position.y', 30,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );
    floatAnimation.setKeys([
      { frame: 0, value: 8 },
      { frame: 60, value: 8.3 },
      { frame: 120, value: 8 }
    ]);
    logoPlane.animations = [floatAnimation];
    this.scene.beginAnimation(logoPlane, 0, 120, true);

    this.logoMesh.addChild(logoPlane);

    console.log('✅ Ultra-realistic TAPFRENZY logo created and positioned');
  }

  private async createProfessionalMenuSystem(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;
    this.menuButtons = [];

    const menuItems = [
      { name: 'Play', position: new BABYLON.Vector3(-4, 4, 2), color: [0.0, 1.0, 0.3] },
      { name: 'Options', position: new BABYLON.Vector3(-1, 4, 2), color: [0.2, 0.5, 1.0] },
      { name: 'Help', position: new BABYLON.Vector3(2, 4, 2), color: [1.0, 0.7, 0.0] },
      { name: 'Quit', position: new BABYLON.Vector3(5, 4, 2), color: [1.0, 0.2, 0.2] }
    ];

    for (let i = 0; i < menuItems.length; i++) {
      const item = menuItems[i]!;
      
      // Create stunning bubble button
      const button = BABYLON.MeshBuilder.CreateSphere(`button_${item.name}`, {
        diameter: 1.8, segments: 32
      }, this.scene);
      button.position = item.position;

      // Ultra-realistic glassmorphism material
      const buttonMaterial = new BABYLON.PBRMaterial(`buttonMat_${item.name}`, this.scene);
      buttonMaterial.baseColor = new BABYLON.Color3(item.color[0], item.color[1], item.color[2]);
      buttonMaterial.alpha = 0.3; // Glass transparency
      buttonMaterial.metallicFactor = 0.0;
      buttonMaterial.roughnessFactor = 0.1;
      buttonMaterial.emissiveColor = new BABYLON.Color3(
        (item.color[0] || 0) * 0.8, 
        (item.color[1] || 0) * 0.8, 
        (item.color[2] || 0) * 0.8
      );
      button.material = buttonMaterial;

      // Create text label
      const textPlane = BABYLON.MeshBuilder.CreatePlane(`text_${item.name}`, {
        width: 1.5, height: 0.4
      }, this.scene);
      textPlane.position = item.position.clone();
      textPlane.position.z += 0.95; // In front of button

      const textTexture = new BABYLON.DynamicTexture(`textTexture_${item.name}`, {
        width: 512, height: 128
      }, this.scene);
      textTexture.drawText(item.name, null, null, 
        'bold 60px Arial', '#FFFFFF', 'transparent', true, true);

      const textMaterial = new BABYLON.StandardMaterial(`textMat_${item.name}`, this.scene);
      textMaterial.diffuseTexture = textTexture;
      textMaterial.emissiveTexture = textTexture;
      textMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
      textMaterial.backFaceCulling = false;
      textPlane.material = textMaterial;

      // Add hover and click interactions
      button.actionManager = new BABYLON.ActionManager(this.scene);
      
      // Hover effects
      button.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOverTrigger, () => {
          buttonMaterial.emissiveColor = new BABYLON.Color3(
            (item.color[0] || 0) * 1.2, 
            (item.color[1] || 0) * 1.2, 
            (item.color[2] || 0) * 1.2
          );
          button.scaling = new BABYLON.Vector3(1.1, 1.1, 1.1);
        }
      ));

      button.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOutTrigger, () => {
          buttonMaterial.emissiveColor = new BABYLON.Color3(
            (item.color[0] || 0) * 0.8, 
            (item.color[1] || 0) * 0.8, 
            (item.color[2] || 0) * 0.8
          );
          button.scaling = new BABYLON.Vector3(1.0, 1.0, 1.0);
        }
      ));

      // Click handler
      button.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickTrigger, () => {
          this.handleMenuClick(item.name);
        }
      ));

      // Floating animation with phase offset
      const floatAnim = new BABYLON.Animation(
        `menuFloat_${i}`, 'position.y', 30,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      );
      floatAnim.setKeys([
        { frame: 0, value: item.position.y },
        { frame: 60 + i * 10, value: item.position.y + 0.2 },
        { frame: 120 + i * 10, value: item.position.y }
      ]);
      button.animations = [floatAnim];
      textPlane.animations = [floatAnim];
      
      this.scene.beginAnimation(button, 0, 120 + i * 10, true);
      this.scene.beginAnimation(textPlane, 0, 120 + i * 10, true);

      this.menuButtons.push({ button, textPlane, item });
    }

    console.log('✅ Professional menu system created with Knowledge Is Power styling');
  }

  private async createBroadcastQualityBuzzer(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create professional buzzer character at optimal viewing position
    this.buzzer = new BABYLON.Mesh('buzzerCharacter', this.scene);
    
    // Main body with broadcast quality materials
    const buzzerBody = BABYLON.MeshBuilder.CreateCapsule('buzzerBody', {
      radius: 0.8, height: 2.5, tessellation: 48
    }, this.scene);
    buzzerBody.position = new BABYLON.Vector3(8, 1.5, 0); // Side position for TV studio layout

    // Head with personality
    const buzzerHead = BABYLON.MeshBuilder.CreateSphere('buzzerHead', {
      diameter: 1.6, segments: 48
    }, this.scene);
    buzzerHead.position = new BABYLON.Vector3(8, 3.2, 0);

    // Eyes with character
    const eyeLeft = BABYLON.MeshBuilder.CreateSphere('eyeLeft', {
      diameter: 0.25, segments: 16
    }, this.scene);
    eyeLeft.position = new BABYLON.Vector3(7.7, 3.4, 0.4);

    const eyeRight = BABYLON.MeshBuilder.CreateSphere('eyeRight', {
      diameter: 0.25, segments: 16
    }, this.scene);
    eyeRight.position = new BABYLON.Vector3(8.3, 3.4, 0.4);

    // Professional materials
    const bodyMaterial = new BABYLON.PBRMaterial('buzzerBodyMat', this.scene);
    bodyMaterial.baseColor = new BABYLON.Color3(1.0, 0.5, 0.1); // Warm orange
    bodyMaterial.metallicFactor = 0.8;
    bodyMaterial.roughnessFactor = 0.2;
    bodyMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.1, 0.02);

    const headMaterial = new BABYLON.PBRMaterial('buzzerHeadMat', this.scene);
    headMaterial.baseColor = new BABYLON.Color3(0.95, 0.95, 1.0); // Pearl white
    headMaterial.metallicFactor = 0.3;
    headMaterial.roughnessFactor = 0.1;

    const eyeMaterial = new BABYLON.PBRMaterial('eyeMat', this.scene);
    eyeMaterial.baseColor = new BABYLON.Color3(0.1, 0.8, 1.0); // Bright cyan
    eyeMaterial.emissiveColor = new BABYLON.Color3(0.5, 1.2, 2.0);
    eyeMaterial.roughnessFactor = 0.0;

    // Apply materials
    buzzerBody.material = bodyMaterial;
    buzzerHead.material = headMaterial;
    eyeLeft.material = eyeMaterial;
    eyeRight.material = eyeMaterial;

    // Parent to main buzzer mesh
    buzzerBody.parent = this.buzzer;
    buzzerHead.parent = this.buzzer;
    eyeLeft.parent = this.buzzer;
    eyeRight.parent = this.buzzer;

    // Subtle breathing animation
    const breathingAnim = new BABYLON.Animation(
      'buzzerBreathing', 'scaling.y', 20,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );
    breathingAnim.setKeys([
      { frame: 0, value: 1.0 },
      { frame: 80, value: 1.05 },
      { frame: 160, value: 1.0 }
    ]);
    this.buzzer.animations = [breathingAnim];
    this.scene.beginAnimation(this.buzzer, 0, 160, true);

    console.log('✅ Broadcast-quality buzzer character created and positioned');
  }

  private createCinematicParticleSystem(): void {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;
    this.particleSystems = [];

    // Main sparkle system for cinematic atmosphere
    const sparkles = new BABYLON.ParticleSystem('cinematicSparkles', 2000, this.scene);
    
    // Create simple white particle texture
    const particleTexture = new BABYLON.Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI/hkyKWwAAAABJRU5ErkJggg==', this.scene);
    sparkles.particleTexture = particleTexture;

    sparkles.emitter = new BABYLON.Vector3(0, 8, 0);
    sparkles.minEmitBox = new BABYLON.Vector3(-12, 2, -8);
    sparkles.maxEmitBox = new BABYLON.Vector3(12, 8, 8);

    // Knowledge Is Power colors - bright and energetic
    sparkles.color1 = new BABYLON.Color4(0.0, 1.0, 1.0, 0.9); // Bright cyan
    sparkles.color2 = new BABYLON.Color4(1.0, 0.2, 0.8, 0.9); // Bright magenta
    sparkles.colorDead = new BABYLON.Color4(0.8, 0.8, 1.0, 0.0);

    sparkles.minSize = 0.1;
    sparkles.maxSize = 0.4;
    sparkles.minLifeTime = 4.0;
    sparkles.maxLifeTime = 8.0;
    sparkles.emitRate = 150;

    sparkles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    sparkles.gravity = new BABYLON.Vector3(0, -2, 0);
    sparkles.direction1 = new BABYLON.Vector3(-2, 2, -2);
    sparkles.direction2 = new BABYLON.Vector3(2, 6, 2);

    sparkles.start();
    this.particleSystems.push(sparkles);

    // Floating orbs for extra magic
    const orbs = new BABYLON.ParticleSystem('floatingOrbs', 50, this.scene);
    orbs.particleTexture = particleTexture;

    orbs.emitter = new BABYLON.Vector3(0, 4, 0);
    orbs.minEmitBox = new BABYLON.Vector3(-10, 0, -6);
    orbs.maxEmitBox = new BABYLON.Vector3(10, 4, 6);

    orbs.color1 = new BABYLON.Color4(1.0, 0.6, 0.1, 0.8); // Golden
    orbs.color2 = new BABYLON.Color4(0.2, 0.8, 1.0, 0.8); // Electric blue
    orbs.colorDead = new BABYLON.Color4(1.0, 1.0, 1.0, 0.0);

    orbs.minSize = 0.3;
    orbs.maxSize = 0.8;
    orbs.minLifeTime = 6.0;
    orbs.maxLifeTime = 10.0;
    orbs.emitRate = 8;

    orbs.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    orbs.gravity = new BABYLON.Vector3(0, -0.5, 0);
    orbs.direction1 = new BABYLON.Vector3(-0.5, 1, -0.5);
    orbs.direction2 = new BABYLON.Vector3(0.5, 3, 0.5);

    orbs.start();
    this.particleSystems.push(orbs);

    console.log('✅ Cinematic particle system created (2000+ particles)');
  }

  private setupBroadcastLighting(): void {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;
    this.studioLights = [];

    // Key light - main illumination
    const keyLight = new BABYLON.DirectionalLight('keyLight', 
      new BABYLON.Vector3(-1, -1.5, -0.5), this.scene);
    keyLight.intensity = 1.5;
    keyLight.diffuse = new BABYLON.Color3(1.0, 0.95, 0.85); // Warm white
    keyLight.specular = new BABYLON.Color3(1, 1, 1);
    this.studioLights.push(keyLight);

    // Fill light - soften shadows
    const fillLight = new BABYLON.DirectionalLight('fillLight',
      new BABYLON.Vector3(0.8, -0.8, 0.3), this.scene);
    fillLight.intensity = 0.8;
    fillLight.diffuse = new BABYLON.Color3(0.8, 0.9, 1.0); // Cool blue-white
    this.studioLights.push(fillLight);

    // Rim light - edge definition
    const rimLight = new BABYLON.DirectionalLight('rimLight',
      new BABYLON.Vector3(0, 1, -1), this.scene);
    rimLight.intensity = 1.0;
    rimLight.diffuse = new BABYLON.Color3(1.0, 1.0, 1.2); // Bright white
    this.studioLights.push(rimLight);

    // Ambient environment
    const ambientLight = new BABYLON.HemisphericLight('ambientLight',
      new BABYLON.Vector3(0, 1, 0), this.scene);
    ambientLight.intensity = 0.4;
    ambientLight.diffuse = new BABYLON.Color3(0.9, 0.9, 1.0);
    this.studioLights.push(ambientLight);

    console.log('✅ Broadcast-quality 3-point lighting system created');
  }

  private setupPremiumPostProcessing(): void {
    if (!this.scene || !this.camera) return;

    const BABYLON = window.BABYLON;

    try {
      // Enable MSAA if supported
      const samples = this.engine.getCaps().maxMSAASamples;
      if (samples >= 4) {
        this.scene.getEngine().setHardwareScalingLevel(1);
        console.log(`✅ MSAA x${Math.min(samples, 8)} enabled`);
      }

      // Create rendering pipeline for premium effects
      const pipeline = new BABYLON.DefaultRenderingPipeline(
        'premiumPipeline', true, this.scene, [this.camera]
      );

      // Premium tone mapping
      pipeline.imageProcessingEnabled = true;
      if (pipeline.imageProcessing) {
        pipeline.imageProcessing.toneMappingEnabled = true;
        pipeline.imageProcessing.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
        pipeline.imageProcessing.exposure = 1.1;
        pipeline.imageProcessing.contrast = 1.15;
      }

      // Professional bloom for glow effects
      pipeline.bloomEnabled = true;
      pipeline.bloomThreshold = 0.7;
      pipeline.bloomWeight = 0.4;
      pipeline.bloomKernel = 64;
      pipeline.bloomScale = 0.7;

      // Anti-aliasing
      pipeline.fxaaEnabled = true;
      pipeline.samples = Math.min(samples, 8);

      console.log('✅ Premium post-processing pipeline enabled');
      
    } catch (error) {
      console.warn('⚠️ Premium post-processing failed, using basic FXAA:', error);
      try {
        new BABYLON.FXAAPostProcess('basicFXAA', 1.0, this.camera);
      } catch (fallbackError) {
        console.warn('⚠️ All post-processing failed');
      }
    }
  }

  private async createProfessionalQROverlay(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;
    const GUI = BABYLON.GUI;

    try {
      this.guiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("professionalUI");

      // Premium QR container with Knowledge Is Power styling
      const qrContainer = new GUI.Rectangle("qrContainer");
      qrContainer.widthInPixels = 320;
      qrContainer.heightInPixels = 360;
      qrContainer.color = "rgba(0, 255, 255, 0.3)"; // Cyan border
      qrContainer.thickness = 3;
      qrContainer.cornerRadius = 20;
      qrContainer.background = "rgba(0, 20, 40, 0.85)"; // Dark professional background
      qrContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
      qrContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
      qrContainer.topInPixels = 40;
      qrContainer.rightInPixels = 40;

      // QR Code placeholder
      this.qrCodeImage = new GUI.Image("qrCodeImage", "");
      this.qrCodeImage.widthInPixels = 260;
      this.qrCodeImage.heightInPixels = 260;
      this.qrCodeImage.topInPixels = -30;
      this.qrCodeImage.color = "#FFFFFF";
      this.qrCodeImage.background = "#000000";
      this.qrCodeImage.cornerRadius = 10;
      qrContainer.addControl(this.qrCodeImage);

      // Room code display
      this.roomCodeText = new GUI.TextBlock("roomCodeText", "Room: ----");
      this.roomCodeText.color = "#00FFFF"; // Bright cyan
      this.roomCodeText.fontSize = 32;
      this.roomCodeText.fontFamily = "Consolas, monospace";
      this.roomCodeText.fontWeight = "bold";
      this.roomCodeText.topInPixels = 160;
      this.roomCodeText.heightInPixels = 50;
      this.roomCodeText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
      this.roomCodeText.background = "rgba(0, 255, 255, 0.15)"; // Subtle cyan glow
      this.roomCodeText.cornerRadius = 15;
      qrContainer.addControl(this.roomCodeText);

      // Instructions
      const instructionText = new GUI.TextBlock("instructions", "Scan to join game");
      instructionText.color = "#FFFFFF";
      instructionText.fontSize = 20;
      instructionText.fontFamily = "Arial, sans-serif";
      instructionText.topInPixels = 220;
      instructionText.heightInPixels = 30;
      instructionText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
      instructionText.alpha = 0.9;
      qrContainer.addControl(instructionText);

      this.guiTexture.addControl(qrContainer);

      console.log('✅ Professional QR overlay created and positioned');
      
    } catch (error) {
      console.error('Failed to create professional QR overlay:', error);
    }
  }

  private initializeGameShowAudio(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create upbeat game show atmosphere
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();
      
      oscillator.frequency.setValueAtTime(261.63, this.audioContext.currentTime); // C4
      oscillator.type = 'sine';
      
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(2000, this.audioContext.currentTime);
      
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Professional volume levels
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.03, this.audioContext.currentTime + 2);
      
      // Musical progression for atmosphere
      const chords = [
        { time: 0, freq: 261.63 }, // C
        { time: 3, freq: 293.66 }, // F  
        { time: 6, freq: 246.94 }, // G
        { time: 9, freq: 261.63 }  // C
      ];
      
      chords.forEach(chord => {
        oscillator.frequency.setValueAtTime(chord.freq, this.audioContext!.currentTime + chord.time);
      });
      
      oscillator.start(this.audioContext.currentTime);
      
      console.log('🎵 Game show audio atmosphere initialized');
    } catch (error) {
      console.warn('Audio context not available:', error);
    }
  }

  private buzzerWelcomeMessage(): void {
    const welcomeMessage = 'Welkom bij TapFrenzy! Het ultieme quiz avontuur begint nu!';
    console.log(`🎙️ Buzzer: ${welcomeMessage}`);
    
    // Show professional subtitle
    this.showProfessionalSubtitle(welcomeMessage);

    // Professional Dutch TTS
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(welcomeMessage);
      utterance.lang = 'nl-NL';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.7;
      
      // Find best Dutch voice
      const voices = speechSynthesis.getVoices();
      const dutchVoice = voices.find(voice => voice.lang.startsWith('nl'));
      if (dutchVoice) utterance.voice = dutchVoice;
      
      speechSynthesis.speak(utterance);
    }

    // Animate buzzer speaking
    if (this.buzzer && this.scene) {
      const BABYLON = window.BABYLON;
      const speakAnim = new BABYLON.Animation('buzzerSpeak', 'rotation.y', 60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
      speakAnim.setKeys([
        { frame: 0, value: 0 },
        { frame: 30, value: 0.1 },
        { frame: 60, value: 0 }
      ]);
      this.scene.beginAnimation(this.buzzer, 0, 60, true);
      setTimeout(() => this.scene.stopAnimation(this.buzzer), 4000);
    }
  }

  private showProfessionalSubtitle(text: string): void {
    const subtitle = document.createElement('div');
    subtitle.style.cssText = `
      position: fixed;
      bottom: 60px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.92), rgba(0, 40, 80, 0.85));
      color: #00FFFF;
      padding: 25px 50px;
      border-radius: 20px;
      font-size: 28px;
      font-family: 'Segoe UI', Tahoma, sans-serif;
      font-weight: 600;
      z-index: 1000;
      max-width: 85%;
      text-align: center;
      border: 3px solid rgba(0, 255, 255, 0.4);
      box-shadow: 0 10px 40px rgba(0, 255, 255, 0.3);
      backdrop-filter: blur(15px);
      animation: subtitleEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes subtitleEntrance {
        from { opacity: 0; transform: translateX(-50%) translateY(30px) scale(0.9); }
        to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
      }
      @keyframes subtitleExit {
        to { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.95); }
      }
    `;
    document.head.appendChild(style);
    
    subtitle.textContent = text;
    document.body.appendChild(subtitle);

    setTimeout(() => {
      subtitle.style.animation = 'subtitleExit 0.4s ease-in forwards';
      setTimeout(() => {
        subtitle.remove();
        style.remove();
      }, 400);
    }, 4500);
  }

  private handleMenuClick(itemName: string): void {
    console.log(`🎯 Menu clicked: ${itemName}`);
    this.showProfessionalSubtitle(`${itemName} geselecteerd!`);
    
    // Contextual buzzer responses
    switch (itemName) {
      case 'Play':
        this.showProfessionalSubtitle('🚀 Lobby wordt geladen... Bereid je voor op de ultieme quiz ervaring!');
        this.transitionToGameLobby();
        break;
      case 'Options':
        this.showProfessionalSubtitle('⚙️ Geavanceerde instellingen komen binnenkort beschikbaar!');
        break;
      case 'Help':
        this.showProfessionalSubtitle('❓ Interactieve tutorial wordt binnenkort toegevoegd!');
        break;
      case 'Quit':
        this.showProfessionalSubtitle('👋 Bedankt voor het spelen van TapFrenzy!');
        setTimeout(() => window.close?.(), 2500);
        break;
    }
  }

  private transitionToGameLobby(): void {
    console.log('🎮 Transitioning to ultra-realistic lobby...');
    
    const net = (window as any).gameNet;
    if (net) {
      net.send({ t: 'host:create' });
    }
    
    // Smooth transition to lobby
    import('./lobby3d').then(({ Lobby3DScene }) => {
      const sceneManager = (window as any).gameSceneManager;
      if (sceneManager) {
        sceneManager.set(new Lobby3DScene());
      }
    }).catch(error => {
      console.error('Failed to load lobby:', error);
      this.showProfessionalSubtitle('❌ Fout bij het laden van de lobby. Probeer opnieuw.');
    });
  }

  private updateRoomCode(code: string): void {
    if (this.roomCodeText) {
      this.roomCodeText.text = `Room: ${code}`;
    }

    if (code && this.qrCodeImage) {
      const joinUrl = `${window.location.origin}/player.html?code=${code}`;
      const qrUrl = `/qr?text=${encodeURIComponent(joinUrl)}`;
      this.qrCodeImage.source = qrUrl;
      console.log('✅ QR code updated for room:', code);
    }
  }

  private createFallbackExperience(root: HTMLElement): void {
    root.innerHTML = `
      <div style="
        display: flex; align-items: center; justify-content: center; 
        height: 100vh; color: white; text-align: center; 
        background: linear-gradient(135deg, #0a1428, #1a2850, #2a3870);
        font-family: 'Segoe UI', Tahoma, sans-serif;
      ">
        <div>
          <h1 style="font-size: 5em; margin: 0; text-shadow: 0 0 30px #00ffff; color: #00ffff;">
            TAPFRENZY
          </h1>
          <p style="font-size: 1.8em; margin: 30px 0; opacity: 0.9;">
            Ultra-Realistic 3D Experience
          </p>
          <p style="font-size: 1.2em; margin: 20px 0; opacity: 0.7;">
            Your device doesn't support advanced 3D rendering
          </p>
          <button onclick="location.reload()" style="
            margin-top: 40px; padding: 20px 40px; font-size: 20px; 
            background: linear-gradient(135deg, #00ffff, #0088ff); 
            border: none; border-radius: 15px; cursor: pointer; 
            color: white; font-weight: bold; text-transform: uppercase;
            box-shadow: 0 8px 25px rgba(0, 255, 255, 0.3);
          ">
            Retry Experience
          </button>
        </div>
      </div>
    `;
  }

  unmount(): void {
    console.log('🔄 Unmounting ultra-realistic menu scene...');
    
    // Clean up event listeners
    window.removeEventListener('resize', () => this.engine?.resize());
    
    // Stop and dispose of particle systems
    if (this.particleSystems) {
      this.particleSystems.forEach(system => {
        system.stop();
        system.dispose();
      });
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
    }

    // Dispose of 3D resources
    if (this.scene) {
      this.scene.dispose();
    }

    if (this.engine) {
      this.engine.dispose();
    }

    console.log('✅ Ultra-realistic menu scene unmounted cleanly');
  }

  onMessage(msg: S2C): void {
    console.log('🎮 Menu received message:', msg);
    
    if (msg.t === 'room' && msg.code) {
      this.updateRoomCode(msg.code);
      this.showProfessionalSubtitle(`🎮 Room ${msg.code} is ready! Players can now join the ultimate quiz experience.`);
    }
  }
}