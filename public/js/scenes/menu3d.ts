// TapFrenzy 3D Main Menu Scene with Babylon.js
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
  private animationLoop?: number;
  private audioContext?: AudioContext;
  private backgroundMusic?: AudioBufferSourceNode;

  async mount(root: HTMLElement): Promise<void> {
    // Create canvas for 3D rendering
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100vh';
    this.canvas.style.display = 'block';
    
    root.innerHTML = '';
    root.appendChild(this.canvas);

    // Wait for Babylon.js to be available
    if (!window.BABYLON) {
      throw new Error('Babylon.js not loaded');
    }

    const BABYLON = window.BABYLON;
    console.log('🎮 Babylon.js version:', BABYLON.Engine.Version);

    try {
      // Create 3D engine and scene
      this.engine = new BABYLON.Engine(this.canvas, true, { 
        preserveDrawingBuffer: true, 
        stencil: true,
        antialias: true 
      });
      
      console.log('✅ Engine created successfully');
      
      this.scene = new BABYLON.Scene(this.engine);
      this.scene.clearColor = new BABYLON.Color3(0.1, 0.05, 0.2); // Deep purple background

      console.log('✅ Scene created successfully');

      // Create camera with cinematic movement
      this.camera = new BABYLON.ArcRotateCamera(
        'mainCamera', 
        -Math.PI / 2, 
        Math.PI / 3, 
        10,
        BABYLON.Vector3.Zero(), 
        this.scene
      );
      
      console.log('✅ Camera created successfully');
      
      // Enable camera controls if canvas is available
      if (this.canvas && typeof this.camera.attachControls === 'function') {
        this.camera.attachControls(this.canvas, false);
        console.log('✅ Camera controls attached');
      } else {
        console.warn('⚠️  Camera.attachControls not available or canvas missing');
      }
      
      // Simple lighting
      const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this.scene);
      light.intensity = 0.7;
      
      // Create a simple sphere to test rendering
      const sphere = BABYLON.MeshBuilder.CreateSphere('sphere1', {diameter: 2}, this.scene);
      sphere.position.y = 1;
      
      // Create ground
      const ground = BABYLON.MeshBuilder.CreateGround('ground1', {width: 6, height: 6, subdivisions: 2}, this.scene);
      
      console.log('✅ Basic geometry created');

      // Handle window resize
      window.addEventListener('resize', this.handleResize.bind(this));
      
      // Start render loop
      this.engine.runRenderLoop(() => {
        if (this.scene) {
          this.scene.render();
        }
      });
      
      console.log('✅ Render loop started - TapFrenzy 3D Menu is running!');
      
      // Show welcome message
      this.showSubtitle('Welkom bij TapFrenzy! 🎮');

    } catch (error) {
      console.error('❌ Error setting up 3D scene:', error);
      // Fallback: show error message
      root.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; color: white; text-align: center; background: linear-gradient(45deg, #1a1a2e, #16213e);">
          <div>
            <h1>TapFrenzy</h1>
            <p>3D Engine initialization failed</p>
            <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
          </div>
        </div>
      `;
    }
  }

  private animateCamera(): void {
    if (!this.camera || !this.scene) return;

    const BABYLON = window.BABYLON;
    
    // Create smooth camera sweep animation
    const animationAlpha = BABYLON.Animation.CreateAndStartAnimation(
      'cameraAlpha',
      this.camera,
      'alpha',
      60,
      600, // 10 seconds
      this.camera.alpha,
      this.camera.alpha + Math.PI * 2,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const animationBeta = BABYLON.Animation.CreateAndStartAnimation(
      'cameraBeta',
      this.camera,
      'beta',
      60,
      300, // 5 seconds  
      this.camera.beta,
      this.camera.beta + 0.2,
      BABYLON.Animation.ANIMATIONLOOPMODE_YOYO
    );
  }

  private async createLogo(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create 3D text for "TAP FRENZY"
    const logoText = BABYLON.MeshBuilder.CreateGround('logoGround', {width: 8, height: 2}, this.scene);
    logoText.position.y = 3;
    logoText.position.z = -2;

    // Create glowing material for logo
    const logoMaterial = new BABYLON.StandardMaterial('logoMat', this.scene);
    logoMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.8, 1.0);
    logoMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.4, 1.0);
    logoText.material = logoMaterial;

    // Add pulsing glow animation
    const glowAnimation = BABYLON.Animation.CreateAndStartAnimation(
      'logoGlow',
      logoMaterial,
      'emissiveColor',
      60,
      120,
      logoMaterial.emissiveColor,
      new BABYLON.Color3(0.5, 1.0, 1.5),
      BABYLON.Animation.ANIMATIONLOOPMODE_YOYO
    );
  }

  private async createMenuItems(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;
    const menuItems = [
      { name: 'Play', position: new BABYLON.Vector3(-3, 1, 0) },
      { name: 'Party Packs', position: new BABYLON.Vector3(-1, 1, 0) },
      { name: 'Options', position: new BABYLON.Vector3(1, 1, 0) },
      { name: 'How to Play', position: new BABYLON.Vector3(3, 1, 0) },
      { name: 'Quit', position: new BABYLON.Vector3(0, -1, 0) }
    ];

    menuItems.forEach((item, index) => {
      const menuBox = BABYLON.MeshBuilder.CreateBox(item.name, {width: 1.5, height: 0.5, depth: 0.1}, this.scene);
      menuBox.position = item.position;

      // Create glowing material for menu items
      const material = new BABYLON.StandardMaterial(item.name + 'Mat', this.scene);
      material.emissiveColor = new BABYLON.Color3(0.1, 0.6, 0.8);
      material.diffuseColor = new BABYLON.Color3(0.05, 0.3, 0.6);
      menuBox.material = material;

      // Add hover effect
      menuBox.actionManager = new BABYLON.ActionManager(this.scene);
      menuBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOverTrigger,
        () => {
          material.emissiveColor = new BABYLON.Color3(0.3, 0.9, 1.0);
        }
      ));
      
      menuBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOutTrigger,
        () => {
          material.emissiveColor = new BABYLON.Color3(0.1, 0.6, 0.8);
        }
      ));

      // Add click handler
      menuBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickTrigger,
        () => {
          this.handleMenuClick(item.name);
        }
      ));

      // Add floating animation
      const floatAnimation = BABYLON.Animation.CreateAndStartAnimation(
        item.name + 'Float',
        menuBox,
        'position.y',
        60,
        120 + index * 20, // Different timing for each item
        item.position.y,
        item.position.y + 0.2,
        BABYLON.Animation.ANIMATIONLOOPMODE_YOYO
      );
    });
  }

  private createParticleSystem(): void {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create sparkling particles
    const particleSystem = new BABYLON.ParticleSystem('particles', 2000, this.scene);
    particleSystem.particleTexture = new BABYLON.Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', this.scene);

    particleSystem.emitter = BABYLON.Vector3.Zero();
    particleSystem.minEmitBox = new BABYLON.Vector3(-5, 0, -5);
    particleSystem.maxEmitBox = new BABYLON.Vector3(5, 0, 5);

    particleSystem.color1 = new BABYLON.Color4(0.2, 0.8, 1.0, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.8, 0.2, 1.0, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;
    particleSystem.minLifeTime = 1;
    particleSystem.maxLifeTime = 3;
    particleSystem.emitRate = 100;

    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
    particleSystem.direction1 = new BABYLON.Vector3(-1, 8, -1);
    particleSystem.direction2 = new BABYLON.Vector3(1, 8, 1);

    particleSystem.start();
  }

  private setupPostProcessing(): void {
    if (!this.scene || !this.camera) return;

    const BABYLON = window.BABYLON;

    // Add bloom effect
    const defaultPipeline = new BABYLON.DefaultRenderingPipeline('defaultPipeline', true, this.scene, [this.camera]);
    defaultPipeline.bloomEnabled = true;
    defaultPipeline.bloomThreshold = 0.8;
    defaultPipeline.bloomWeight = 0.3;
    defaultPipeline.bloomKernel = 64;

    // Add FXAA anti-aliasing
    defaultPipeline.fxaaEnabled = true;
  }

  private async createBuzzerCharacter(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create simple Buzzer placeholder (sphere for now - would be replaced with actual 3D model)
    const buzzer = BABYLON.MeshBuilder.CreateSphere('buzzer', {diameter: 1}, this.scene);
    buzzer.position = new BABYLON.Vector3(4, 0, 2);

    const buzzerMaterial = new BABYLON.StandardMaterial('buzzerMat', this.scene);
    buzzerMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.4, 0.1);
    buzzerMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.5, 0.2);
    buzzer.material = buzzerMaterial;

    // Add idle animation - gentle bobbing
    const idleAnimation = BABYLON.Animation.CreateAndStartAnimation(
      'buzzerIdle',
      buzzer,
      'position.y',
      60,
      180,
      buzzer.position.y,
      buzzer.position.y + 0.3,
      BABYLON.Animation.ANIMATIONLOOPMODE_YOYO
    );

    this.buzzer = buzzer;

    // Make Buzzer speak welcome message
    this.buzzerSpeak('Welkom bij TapFrenzy! Klaar om te spelen?');
  }

  private buzzerSpeak(text: string): void {
    console.log(`🎙️ Buzzer: ${text}`);
    
    // Show subtitle
    this.showSubtitle(text);

    // Try to use Web Speech API for voice
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'nl-NL';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
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
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 18px;
      z-index: 1000;
      max-width: 80%;
      text-align: center;
    `;
    subtitleDiv.textContent = text;
    document.body.appendChild(subtitleDiv);

    // Remove subtitle after 4 seconds
    setTimeout(() => {
      subtitleDiv.remove();
    }, 4000);
  }

  private startBackgroundMusic(): void {
    // Initialize audio context
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create simple ambient tone as placeholder for background music
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime); // A3 note
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 2);
      
      oscillator.start(this.audioContext.currentTime);
      
      console.log('🎵 Background music started');
    } catch (error) {
      console.warn('Audio context not available:', error);
    }
  }

  private handleMenuClick(itemName: string): void {
    console.log(`Menu clicked: ${itemName}`);
    this.buzzerSpeak(`Je hebt ${itemName} gekozen!`);

    // TODO: Implement actual menu navigation
    switch (itemName) {
      case 'Play':
        // Transition to lobby scene
        break;
      case 'Options':
        // Show options menu
        break;
      case 'How to Play':
        // Show tutorial
        break;
      case 'Quit':
        // Close application
        break;
    }
  }

  private handleResize(): void {
    if (this.engine && this.canvas) {
      this.engine.resize();
    }
  }

  unmount(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    if (this.animationLoop) {
      cancelAnimationFrame(this.animationLoop);
    }

    if (this.audioContext) {
      this.audioContext.close();
    }

    if (this.engine) {
      this.engine.dispose();
    }

    if (this.scene) {
      this.scene.dispose();
    }
  }

  onMessage(msg: S2C): void {
    // Handle server messages if needed
    console.log('Menu3D received message:', msg);
  }
}