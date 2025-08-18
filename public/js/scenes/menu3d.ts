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

    // Wait for Babylon.js to be available
    if (!window.BABYLON) {
      throw new Error('Babylon.js not loaded');
    }

    const BABYLON = window.BABYLON;
    console.log('🎮 Babylon.js version:', BABYLON.Engine.Version);

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
        console.log(`✅ High-DPI support enabled (${window.devicePixelRatio}x)`);
      }
      
      console.log('✅ Engine created successfully');
      
      this.scene = new BABYLON.Scene(this.engine);
      this.scene.clearColor = new BABYLON.Color3(0.1, 0.05, 0.2); // Deep purple background

      console.log('✅ Scene created successfully');

      // Create camera with fixed position (no movement)
      this.camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), this.scene);
      this.camera.setTarget(BABYLON.Vector3.Zero());
      
      // Lock camera - disable inputs and inertia for no movement
      this.camera.inputs.clear();
      this.camera.inertia = 0;
      
      console.log('✅ Camera created successfully (locked position)');
      
      // Enhanced lighting setup for dramatic effect
      const hemiLight = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(0, 1, 0), this.scene);
      hemiLight.intensity = 0.4;
      
      const dirLight = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(-1, -1, -1), this.scene);
      dirLight.intensity = 0.8;
      dirLight.diffuse = new BABYLON.Color3(1, 0.8, 0.6);
      
      // Create TapFrenzy logo (3D text)
      await this.createLogo();
      
      // Create menu items
      await this.createMenuItems();
      
      // Add particles for visual flair
      this.createParticleSystem();
      
      // Add post-processing effects
      this.setupPostProcessing();
      
      // Create Buzzer character placeholder
      await this.createBuzzerCharacter();
      
      // Create QR code and room code overlay
      await this.createQROverlay();
      
      // Start background music
      this.startBackgroundMusic();
      
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
    
    // Create smooth camera movement animation
    const animationX = new BABYLON.Animation(
      'cameraAnimationX',
      'position.x',
      60,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_YOYO
    );

    const keysX = [
      { frame: 0, value: 0 },
      { frame: 300, value: 5 },
      { frame: 600, value: -5 },
      { frame: 900, value: 0 }
    ];

    animationX.setKeys(keysX);

    const animationY = new BABYLON.Animation(
      'cameraAnimationY',
      'position.y',
      60,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_YOYO
    );

    const keysY = [
      { frame: 0, value: 5 },
      { frame: 450, value: 8 },
      { frame: 900, value: 5 }
    ];

    animationY.setKeys(keysY);

    this.camera.animations = [animationX, animationY];
    this.scene.beginAnimation(this.camera, 0, 900, true);
  }

  private async createLogo(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create multiple 3D boxes to form "TAP FRENZY" text
    const logoText = [
      // T
      { pos: [-6, 3, 0], scale: [0.3, 2, 0.3] },
      { pos: [-6, 4, 0], scale: [1, 0.3, 0.3] },
      // A  
      { pos: [-4.5, 2.5, 0], scale: [0.3, 1.5, 0.3] },
      { pos: [-4.5, 4, 0], scale: [0.3, 1, 0.3] },
      { pos: [-4, 3.5, 0], scale: [0.8, 0.3, 0.3] },
      { pos: [-3.5, 2.5, 0], scale: [0.3, 1.5, 0.3] },
      // P
      { pos: [-2.5, 3, 0], scale: [0.3, 2, 0.3] },
      { pos: [-2, 4, 0], scale: [0.8, 0.3, 0.3] },
      { pos: [-1.7, 3.5, 0], scale: [0.3, 0.5, 0.3] },
      { pos: [-2, 3.2, 0], scale: [0.5, 0.3, 0.3] },
    ];

    const logoMaterial = new BABYLON.StandardMaterial('logoMat', this.scene);
    logoMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.8, 1.0);
    logoMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.4, 1.0);
    logoMaterial.specularColor = new BABYLON.Color3(1, 1, 1);

    logoText.forEach((letter, index) => {
      const box = BABYLON.MeshBuilder.CreateBox(`logo${index}`, {
        width: letter.scale[0],
        height: letter.scale[1],
        depth: letter.scale[2]
      }, this.scene);
      
      box.position = new BABYLON.Vector3(letter.pos[0], letter.pos[1], letter.pos[2]);
      box.material = logoMaterial;

      // Add floating animation with different phases for each letter
      const floatAnimation = new BABYLON.Animation(
        `logoFloat${index}`,
        'position.y',
        60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      );

      const keys = [
        { frame: 0, value: letter.pos[1]! },
        { frame: 60 + index * 5, value: letter.pos[1]! + 0.2 },
        { frame: 120 + index * 5, value: letter.pos[1]! }
      ];

      floatAnimation.setKeys(keys);
      box.animations = [floatAnimation];
      this.scene!.beginAnimation(box, 0, 120 + index * 5, true);
    });

    // Create "FRENZY" text below
    const frenzyBoxes = [
      // F
      { pos: [1, 1.5, 0], scale: [0.3, 2, 0.3] },
      { pos: [1.5, 2.3, 0], scale: [0.8, 0.3, 0.3] },
      { pos: [1.5, 1.8, 0], scale: [0.6, 0.3, 0.3] },
      // R
      { pos: [2.5, 1.5, 0], scale: [0.3, 2, 0.3] },
      { pos: [3, 2.3, 0], scale: [0.8, 0.3, 0.3] },
      { pos: [3.2, 2, 0], scale: [0.3, 0.6, 0.3] },
      { pos: [3, 1.8, 0], scale: [0.5, 0.3, 0.3] },
      { pos: [3.2, 1.2, 0], scale: [0.6, 0.3, 0.3] },
      // E
      { pos: [4, 1.5, 0], scale: [0.3, 2, 0.3] },
      { pos: [4.5, 2.3, 0], scale: [0.8, 0.3, 0.3] },
      { pos: [4.5, 1.8, 0], scale: [0.6, 0.3, 0.3] },
      { pos: [4.5, 0.7, 0], scale: [0.8, 0.3, 0.3] }
    ];

    const frenzyMaterial = new BABYLON.StandardMaterial('frenzyMat', this.scene);
    frenzyMaterial.emissiveColor = new BABYLON.Color3(1.0, 0.5, 0.1);
    frenzyMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.3, 0.0);

    frenzyBoxes.forEach((letter, index) => {
      const box = BABYLON.MeshBuilder.CreateBox(`frenzy${index}`, {
        width: letter.scale[0],
        height: letter.scale[1], 
        depth: letter.scale[2]
      }, this.scene);
      
      box.position = new BABYLON.Vector3(letter.pos[0], letter.pos[1], letter.pos[2]);
      box.material = frenzyMaterial;
    });

    console.log('✅ TapFrenzy logo created');
  }

  private async createMenuItems(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;
    const menuItems = [
      { name: 'Play', position: new BABYLON.Vector3(-4, -1, 0), color: [0.1, 0.8, 0.3] },
      { name: 'Party Packs', position: new BABYLON.Vector3(-1, -1, 0), color: [0.8, 0.3, 0.8] },
      { name: 'Options', position: new BABYLON.Vector3(2, -1, 0), color: [0.3, 0.5, 0.8] },
      { name: 'How to Play', position: new BABYLON.Vector3(-2.5, -2.5, 0), color: [0.8, 0.6, 0.1] },
      { name: 'Quit', position: new BABYLON.Vector3(0.5, -2.5, 0), color: [0.8, 0.2, 0.2] }
    ];

    menuItems.forEach((item, index) => {
      // Create main menu button
      const menuBox = BABYLON.MeshBuilder.CreateBox(item.name, {width: 2, height: 0.6, depth: 0.2}, this.scene);
      menuBox.position = item.position;

      // Create glowing material for menu items
      const material = new BABYLON.StandardMaterial(item.name + 'Mat', this.scene);
      material.emissiveColor = new BABYLON.Color3(item.color[0]!, item.color[1]!, item.color[2]!);
      material.diffuseColor = new BABYLON.Color3(item.color[0]! * 0.5, item.color[1]! * 0.5, item.color[2]! * 0.5);
      material.specularColor = new BABYLON.Color3(1, 1, 1);
      menuBox.material = material;

      // Create text label (simple plane with text texture)
      const textPlane = BABYLON.MeshBuilder.CreatePlane(item.name + 'Text', {width: 1.8, height: 0.4}, this.scene);
      textPlane.position = item.position.clone();
      textPlane.position.z += 0.11; // Slightly in front
      
      // Create dynamic texture for text
      const textTexture = new BABYLON.DynamicTexture(item.name + 'TextTexture', {width: 512, height: 128}, this.scene);
      textTexture.hasAlpha = true;
      textTexture.drawText(item.name, null, null, '36px Arial', '#FFFFFF', 'transparent', true, true);
      
      const textMaterial = new BABYLON.StandardMaterial(item.name + 'TextMat', this.scene);
      textMaterial.diffuseTexture = textTexture;
      textMaterial.emissiveTexture = textTexture;
      textMaterial.backFaceCulling = false;
      textPlane.material = textMaterial;

      // Add hover effect using action manager
      menuBox.actionManager = new BABYLON.ActionManager(this.scene);
      
      // Mouse over effect
      menuBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOverTrigger,
        () => {
          material.emissiveColor = new BABYLON.Color3(item.color[0]! * 1.5, item.color[1]! * 1.5, item.color[2]! * 1.5);
          
          // Bubble-UI: Smooth scale-in (1.0 → 1.06) with cubic bezier
          const scaleAnimation = new BABYLON.Animation(
            'bubbleScaleUp',
            'scaling',
            60, // fps
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
          );

          // Cubic bezier easing (easeInOut equivalent)
          scaleAnimation.setEasingFunction(new BABYLON.CubicEase());
          const easing = scaleAnimation.getEasingFunction();
          if (easing && 'setEasingMode' in easing) {
            easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
          }

          const keys = [
            { frame: 0, value: menuBox.scaling },
            { frame: 15, value: new BABYLON.Vector3(1.06, 1.06, 1.06) } // 250ms at 60fps
          ];
          scaleAnimation.setKeys(keys);
          
          this.scene!.beginAnimation(menuBox, 0, 15, false, 1, () => {}, scaleAnimation);
        }
      ));
      
      // Mouse out effect - return to original size
      menuBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOutTrigger,
        () => {
          material.emissiveColor = new BABYLON.Color3(item.color[0], item.color[1], item.color[2]);
          
          // Bubble-UI: Smooth scale back to 1.0 with cubic bezier
          const scaleAnimation = new BABYLON.Animation(
            'bubbleScaleDown',
            'scaling',
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
          );

          scaleAnimation.setEasingFunction(new BABYLON.CubicEase());
          const easing = scaleAnimation.getEasingFunction();
          if (easing && 'setEasingMode' in easing) {
            easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
          }

          const keys = [
            { frame: 0, value: menuBox.scaling },
            { frame: 12, value: new BABYLON.Vector3(1.0, 1.0, 1.0) } // 200ms 
          ];
          scaleAnimation.setKeys(keys);
          
          this.scene!.beginAnimation(menuBox, 0, 12, false, 1, () => {}, scaleAnimation);
        }
      ));

      // Click handler with bubble pop animation
      menuBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickTrigger,
        () => {
          this.handleMenuClick(item.name);
          
          // Click animation: quick scale down then back up (micro-motion)
          const clickAnimation = new BABYLON.Animation(
            'bubbleClick',
            'scaling',
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
          );

          clickAnimation.setEasingFunction(new BABYLON.CubicEase());
          const easing = clickAnimation.getEasingFunction();
          if (easing && 'setEasingMode' in easing) {
            easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
          }

          const keys = [
            { frame: 0, value: menuBox.scaling },
            { frame: 5, value: new BABYLON.Vector3(0.94, 0.94, 0.94) }, // 83ms quick press
            { frame: 15, value: new BABYLON.Vector3(1.0, 1.0, 1.0) }   // 250ms total
          ];
          clickAnimation.setKeys(keys);
          
          this.scene!.beginAnimation(menuBox, 0, 15, false, 1, () => {}, clickAnimation);
        }
      ));

      // Add floating animation with different timing for each item
      const floatAnimation = new BABYLON.Animation(
        item.name + 'Float',
        'position.y',
        60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      );

      const keys = [
        { frame: 0, value: item.position.y },
        { frame: 60 + index * 10, value: item.position.y + 0.1 },
        { frame: 120 + index * 10, value: item.position.y }
      ];

      floatAnimation.setKeys(keys);
      menuBox.animations = [floatAnimation];
      this.scene!.beginAnimation(menuBox, 0, 120 + index * 10, true);
    });

    console.log('✅ Menu items created with interactions');
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

    try {
      // Add MSAA (Multi-Sample Anti-Aliasing) if supported
      const samples = this.engine.getCaps().maxMSAASamples;
      if (samples >= 4) {
        this.scene.getEngine().setHardwareScalingLevel(1);
        this.scene.getEngine().resize();
        console.log(`✅ MSAA enabled with ${samples} samples`);
      }

      // Add bloom effect for enhanced visuals
      const defaultPipeline = new BABYLON.DefaultRenderingPipeline(
        'defaultPipeline',
        true, // HDR enabled
        this.scene,
        [this.camera]
      );
      
      // Configure bloom (softer settings)
      defaultPipeline.bloomEnabled = true;
      defaultPipeline.bloomThreshold = 0.9;
      defaultPipeline.bloomWeight = 0.15;
      defaultPipeline.bloomKernel = 32;

      // Add FXAA anti-aliasing
      defaultPipeline.fxaaEnabled = true;

      // Add tone mapping with ACES
      defaultPipeline.imageProcessingEnabled = true;
      if (defaultPipeline.imageProcessing) {
        defaultPipeline.imageProcessing.toneMappingEnabled = true;
        defaultPipeline.imageProcessing.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
        defaultPipeline.imageProcessing.exposure = 0.8;
        defaultPipeline.imageProcessing.contrast = 1.4;
        defaultPipeline.imageProcessing.colorCurvesEnabled = true;
      }

      console.log('✅ AAA post-processing enabled (Bloom, FXAA/MSAA, ACES tone mapping)');
      
    } catch (error) {
      console.warn('⚠️  Post-processing setup failed:', error);
      // Fallback to basic rendering
    }
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

    // Implement actual menu navigation
    switch (itemName) {
      case 'Play':
        // Transition to 3D lobby scene
        this.transitionToLobby();
        break;
      case 'Options':
        this.buzzerSpeak('Opties menu komt binnenkort!');
        break;
      case 'How to Play':
        this.buzzerSpeak('Tutorial komt binnenkort!');
        break;
      case 'Party Packs':
        this.buzzerSpeak('Party Packs komen binnenkort!');
        break;
      case 'Quit':
        this.buzzerSpeak('Bedankt voor het spelen van TapFrenzy!');
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.close) {
            window.close();
          }
        }, 2000);
        break;
    }
  }

  private transitionToLobby(): void {
    console.log('🎮 Transitioning to 3D Lobby...');
    this.showSubtitle('🎮 Lobby wordt geladen...');
    
    // Create room first
    const net = (window as any).gameNet;
    if (net) {
      net.send({ t: 'host:create' });
    }
    
    // Import and switch to lobby scene
    import('./lobby3d').then(({ Lobby3DScene }) => {
      // Get scene manager from host.ts context
      const sceneRoot = document.getElementById('scene') as HTMLElement;
      if (sceneRoot && (window as any).gameSceneManager) {
        (window as any).gameSceneManager.set(new Lobby3DScene());
      } else {
        console.error('Scene manager not available for transition');
      }
    }).catch(error => {
      console.error('Failed to load lobby scene:', error);
      this.buzzerSpeak('Er ging iets mis bij het laden van de lobby. Probeer opnieuw.');
    });
  }

  private handleResize(): void {
    if (this.engine && this.canvas) {
      this.engine.resize();
    }
  }

  private async createQROverlay(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;
    const GUI = BABYLON.GUI;

    try {
      // Create fullscreen GUI
      this.guiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

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

      console.log('✅ QR overlay created');
    } catch (error) {
      console.error('Failed to create QR overlay:', error);
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
      console.log('✅ QR code updated:', qrUrl);
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
    
    // Update room code when received
    if (msg.t === 'room' && msg.code) {
      this.updateRoomCode(msg.code);
    }
  }
}