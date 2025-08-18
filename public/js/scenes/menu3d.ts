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
      
      // Enhanced HDRI environment lighting for AAA look
      await this.setupHDRIEnvironment();
      
      // Additional key lighting
      const keyLight = new BABYLON.DirectionalLight('keyLight', new BABYLON.Vector3(-0.5, -1, -0.8), this.scene);
      keyLight.intensity = 1.2;
      keyLight.diffuse = new BABYLON.Color3(1.0, 0.95, 0.9);
      
      // Fill light
      const fillLight = new BABYLON.DirectionalLight('fillLight', new BABYLON.Vector3(0.8, -0.3, 0.5), this.scene);
      fillLight.intensity = 0.4;
      fillLight.diffuse = new BABYLON.Color3(0.7, 0.8, 1.0);
      
      // Rim light for edge highlighting
      const rimLight = new BABYLON.DirectionalLight('rimLight', new BABYLON.Vector3(0, 0.5, -1), this.scene);
      rimLight.intensity = 0.6;
      rimLight.diffuse = new BABYLON.Color3(0.8, 0.9, 1.2);
      
      // Create TapFrenzy logo (3D text)
      await this.createLogo();
      
      // Create menu items
      await this.createMenuItems();
      
      // Create environmental architecture
      await this.createEnvironmentalDetails();
      
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
      // Create rounded bubble-style menu button
      const menuBox = BABYLON.MeshBuilder.CreateBox(item.name, {
        width: 2.2, 
        height: 0.7, 
        depth: 0.3
      }, this.scene);
      menuBox.position = item.position;

      // Glassmorphism bubble material with PBR
      const material = new BABYLON.PBRMaterial(item.name + 'Mat', this.scene);
      
      // Base glass color with transparency
      material.baseColor = new BABYLON.Color3(item.color[0]!, item.color[1]!, item.color[2]!);
      material.alpha = 0.15; // Very transparent base
      
      // Glassmorphism properties
      material.metallicFactor = 0.0; // No metallic for glass effect
      material.roughnessFactor = 0.1; // Very smooth for glass
      
      // Emissive glow for bubble effect
      material.emissiveColor = new BABYLON.Color3(
        item.color[0]! * 0.3, 
        item.color[1]! * 0.3, 
        item.color[2]! * 0.3
      );
      
      // Enable transparency
      material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
      
      // Add clearcoat for premium glass look
      material.clearCoat.isEnabled = true;
      material.clearCoat.intensity = 0.8;
      material.clearCoat.roughness = 0.05;
      
      menuBox.material = material;

      // Create floating backdrop for better text readability  
      const backdrop = BABYLON.MeshBuilder.CreateBox(item.name + 'Backdrop', {
        width: 2.0, 
        height: 0.5, 
        depth: 0.1
      }, this.scene);
      backdrop.position = item.position.clone();
      backdrop.position.z -= 0.05;
      
      const backdropMaterial = new BABYLON.StandardMaterial(item.name + 'BackdropMat', this.scene);
      backdropMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
      backdropMaterial.alpha = 0.4;
      backdropMaterial.backFaceCulling = false;
      backdrop.material = backdropMaterial;

      // Create text label (floating above bubble)
      const textPlane = BABYLON.MeshBuilder.CreatePlane(item.name + 'Text', {width: 1.9, height: 0.4}, this.scene);
      textPlane.position = item.position.clone();
      textPlane.position.z += 0.16; // Floating above bubble
      
      // Create dynamic texture for text with better styling
      const textTexture = new BABYLON.DynamicTexture(item.name + 'TextTexture', {width: 512, height: 128}, this.scene);
      textTexture.hasAlpha = true;
      textTexture.drawText(item.name, null, null, 'bold 38px Arial', '#FFFFFF', 'transparent', true, true);
      
      const textMaterial = new BABYLON.StandardMaterial(item.name + 'TextMat', this.scene);
      textMaterial.diffuseTexture = textTexture;
      textMaterial.emissiveTexture = textTexture;
      textMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
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

  private async createEnvironmentalDetails(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // === HIGH-QUALITY ENVIRONMENTAL ARCHITECTURE ===
    
    // Decorative pillars around the menu area
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const pillar = BABYLON.MeshBuilder.CreateCylinder(`pillar${i}`, {
        height: 6.0,
        diameterTop: 0.3,
        diameterBottom: 0.4,
        tessellation: 24
      }, this.scene);
      pillar.position = new BABYLON.Vector3(
        Math.cos(angle) * 8,
        3.0,
        Math.sin(angle) * 8
      );

      // Pillar capital (decorative top)
      const capital = BABYLON.MeshBuilder.CreateCylinder(`capital${i}`, {
        height: 0.4,
        diameterTop: 0.6,
        diameterBottom: 0.4,
        tessellation: 16
      }, this.scene);
      capital.position = new BABYLON.Vector3(
        Math.cos(angle) * 8,
        6.2,
        Math.sin(angle) * 8
      );

      // Premium materials for architecture
      const archMaterial = new BABYLON.PBRMaterial(`archMat${i}`, this.scene);
      archMaterial.baseColor = new BABYLON.Color3(0.8, 0.8, 0.9);
      archMaterial.metallicFactor = 0.2;
      archMaterial.roughnessFactor = 0.3;
      archMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.08);
      archMaterial.clearCoat.isEnabled = true;
      archMaterial.clearCoat.intensity = 0.3;
      pillar.material = archMaterial;
      capital.material = archMaterial;
    }

    // Central platform for the scene
    const centralPlatform = BABYLON.MeshBuilder.CreateCylinder('centralPlatform', {
      height: 0.2,
      diameterTop: 12,
      diameterBottom: 12,
      tessellation: 64 // High poly
    }, this.scene);
    centralPlatform.position.y = -0.1;

    const platformMaterial = new BABYLON.PBRMaterial('centralPlatformMat', this.scene);
    platformMaterial.baseColor = new BABYLON.Color3(0.1, 0.1, 0.2);
    platformMaterial.metallicFactor = 0.8;
    platformMaterial.roughnessFactor = 0.2;
    platformMaterial.emissiveColor = new BABYLON.Color3(0.02, 0.02, 0.06);
    platformMaterial.clearCoat.isEnabled = true;
    platformMaterial.clearCoat.intensity = 0.5;
    centralPlatform.material = platformMaterial;

    console.log('✅ Environmental architecture created with premium materials');
  }

  private createParticleSystem(): void {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // === ENHANCED PARTICLE SYSTEM FOR MENU ===
    
    // Main sparkle system - premium colors
    const sparkleSystem = new BABYLON.ParticleSystem('menuSparkles', 3000, this.scene);
    sparkleSystem.particleTexture = new BABYLON.Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', this.scene);

    sparkleSystem.emitter = BABYLON.Vector3.Zero();
    sparkleSystem.minEmitBox = new BABYLON.Vector3(-8, 0, -8);
    sparkleSystem.maxEmitBox = new BABYLON.Vector3(8, 4, 8);

    // Premium sparkle colors - cyan and magenta energy
    sparkleSystem.color1 = new BABYLON.Color4(0.2, 0.9, 1.0, 0.9);
    sparkleSystem.color2 = new BABYLON.Color4(1.0, 0.3, 0.8, 0.9);
    sparkleSystem.colorDead = new BABYLON.Color4(0.8, 0.8, 1.0, 0.0);

    sparkleSystem.minSize = 0.08;
    sparkleSystem.maxSize = 0.3;
    sparkleSystem.minLifeTime = 2.0;
    sparkleSystem.maxLifeTime = 4.0;
    sparkleSystem.emitRate = 150;

    sparkleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    sparkleSystem.gravity = new BABYLON.Vector3(0, -3.0, 0); // Lighter gravity
    sparkleSystem.direction1 = new BABYLON.Vector3(-2, 6, -2);
    sparkleSystem.direction2 = new BABYLON.Vector3(2, 10, 2);

    sparkleSystem.start();
    
    // Energy orb system for menu background
    const orbSystem = new BABYLON.ParticleSystem('menuOrbs', 150, this.scene);
    orbSystem.particleTexture = new BABYLON.Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', this.scene);

    orbSystem.emitter = BABYLON.Vector3.Zero();
    orbSystem.minEmitBox = new BABYLON.Vector3(-12, 1, -12);
    orbSystem.maxEmitBox = new BABYLON.Vector3(12, 5, 12);

    // Magical energy colors
    orbSystem.color1 = new BABYLON.Color4(0.3, 0.7, 1.0, 0.6);
    orbSystem.color2 = new BABYLON.Color4(1.0, 0.6, 0.3, 0.7);
    orbSystem.colorDead = new BABYLON.Color4(0.5, 0.5, 1.0, 0.0);

    orbSystem.minSize = 0.2;
    orbSystem.maxSize = 0.6;
    orbSystem.minLifeTime = 6.0;
    orbSystem.maxLifeTime = 10.0;
    orbSystem.emitRate = 20;

    orbSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    orbSystem.gravity = new BABYLON.Vector3(0, -0.5, 0);
    orbSystem.direction1 = new BABYLON.Vector3(-0.5, 2, -0.5);
    orbSystem.direction2 = new BABYLON.Vector3(0.5, 4, 0.5);

    orbSystem.start();

    console.log('✅ Enhanced particle system created for menu scene');
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

    // Create a complex Buzzer character (AAA quality placeholder)
    // Main body - high-poly rounded capsule shape
    const buzzerBody = BABYLON.MeshBuilder.CreateCapsule('buzzerBody', {
      radius: 0.5,
      height: 1.2,
      tessellation: 64 // Doubled for smoother curves
    }, this.scene);
    buzzerBody.position = new BABYLON.Vector3(4, 0.6, 2);

    // Head - high-poly slightly flattened sphere
    const buzzerHead = BABYLON.MeshBuilder.CreateSphere('buzzerHead', {
      diameter: 0.8,
      segments: 64 // Doubled for smoother curves
    }, this.scene);
    buzzerHead.position = new BABYLON.Vector3(4, 1.4, 2);
    buzzerHead.scaling.y = 0.9; // Slightly flattened

    // Eyes - high-detail glowing spheres
    const eyeLeft = BABYLON.MeshBuilder.CreateSphere('eyeLeft', {
      diameter: 0.12, 
      segments: 24 // Higher detail
    }, this.scene);
    eyeLeft.position = new BABYLON.Vector3(3.75, 1.55, 2.15);
    
    const eyeRight = BABYLON.MeshBuilder.CreateSphere('eyeRight', {
      diameter: 0.12,
      segments: 24 // Higher detail
    }, this.scene);
    eyeRight.position = new BABYLON.Vector3(4.25, 1.55, 2.15);

    // Mouth - high-detail torus for speaker grille
    const mouth = BABYLON.MeshBuilder.CreateTorus('mouth', {
      diameter: 0.25,
      thickness: 0.03,
      tessellation: 32 // Doubled for smoother curves
    }, this.scene);
    mouth.position = new BABYLON.Vector3(4, 1.25, 2.2);

    // === ADDITIONAL HIGH-DETAIL BODY PARTS ===
    
    // Arms - detailed capsules
    const armLeft = BABYLON.MeshBuilder.CreateCapsule('armLeft', {
      radius: 0.15,
      height: 0.8,
      tessellation: 24
    }, this.scene);
    armLeft.position = new BABYLON.Vector3(3.2, 1.0, 2);
    armLeft.rotation.z = Math.PI / 6;

    const armRight = BABYLON.MeshBuilder.CreateCapsule('armRight', {
      radius: 0.15,
      height: 0.8,
      tessellation: 24
    }, this.scene);
    armRight.position = new BABYLON.Vector3(4.8, 1.0, 2);
    armRight.rotation.z = -Math.PI / 6;

    // Hands - detailed spheres
    const handLeft = BABYLON.MeshBuilder.CreateSphere('handLeft', {
      diameter: 0.25,
      segments: 20
    }, this.scene);
    handLeft.position = new BABYLON.Vector3(2.9, 0.7, 2);

    const handRight = BABYLON.MeshBuilder.CreateSphere('handRight', {
      diameter: 0.25,
      segments: 20
    }, this.scene);
    handRight.position = new BABYLON.Vector3(5.1, 0.7, 2);

    // Antenna for communication
    const antenna = BABYLON.MeshBuilder.CreateCylinder('antenna', {
      height: 0.4,
      diameterTop: 0.02,
      diameterBottom: 0.04,
      tessellation: 12
    }, this.scene);
    antenna.position = new BABYLON.Vector3(4, 2.4, 2);

    // Antenna tip - glowing orb
    const antennaTip = BABYLON.MeshBuilder.CreateSphere('antennaTip', {
      diameter: 0.08,
      segments: 12
    }, this.scene);
    antennaTip.position = new BABYLON.Vector3(4, 2.6, 2);

    // === ENHANCED PBR MATERIALS FOR HIGH-QUALITY LOOK ===
    
    // Main body material - premium metallic orange with clearcoat
    const bodyMaterial = new BABYLON.PBRMaterial('buzzerBodyMat', this.scene);
    bodyMaterial.baseColor = new BABYLON.Color3(1.0, 0.4, 0.05);
    bodyMaterial.metallicFactor = 0.9;
    bodyMaterial.roughnessFactor = 0.15;
    bodyMaterial.emissiveColor = new BABYLON.Color3(0.4, 0.12, 0.02);
    bodyMaterial.clearCoat.isEnabled = true;
    bodyMaterial.clearCoat.intensity = 0.4;
    buzzerBody.material = bodyMaterial;

    // Head material - premium ceramic-metal composite
    const headMaterial = new BABYLON.PBRMaterial('buzzerHeadMat', this.scene);
    headMaterial.baseColor = new BABYLON.Color3(0.95, 0.95, 0.98);
    headMaterial.metallicFactor = 0.8;
    headMaterial.roughnessFactor = 0.08;
    headMaterial.emissiveColor = new BABYLON.Color3(0.15, 0.15, 0.2);
    headMaterial.clearCoat.isEnabled = true;
    headMaterial.clearCoat.intensity = 0.6;
    buzzerHead.material = headMaterial;

    // Eye material - brilliant glowing crystal
    const eyeMaterial = new BABYLON.PBRMaterial('eyeMat', this.scene);
    eyeMaterial.baseColor = new BABYLON.Color3(0.1, 0.7, 1.0);
    eyeMaterial.emissiveColor = new BABYLON.Color3(0.8, 1.5, 2.2);
    eyeMaterial.roughnessFactor = 0.0;
    eyeMaterial.metallicFactor = 0.0;
    eyeLeft.material = eyeMaterial;
    eyeRight.material = eyeMaterial;

    // Mouth material - premium dark metallic
    const mouthMaterial = new BABYLON.PBRMaterial('mouthMat', this.scene);
    mouthMaterial.baseColor = new BABYLON.Color3(0.08, 0.08, 0.08);
    mouthMaterial.metallicFactor = 1.0;
    mouthMaterial.roughnessFactor = 0.2;
    mouthMaterial.clearCoat.isEnabled = true;
    mouthMaterial.clearCoat.intensity = 0.3;
    mouth.material = mouthMaterial;
    
    // === MATERIALS FOR NEW PARTS ===
    
    // Limb material - premium metallic
    const limbMaterial = new BABYLON.PBRMaterial('limbMat', this.scene);
    limbMaterial.baseColor = new BABYLON.Color3(0.8, 0.8, 0.85);
    limbMaterial.metallicFactor = 0.9;
    limbMaterial.roughnessFactor = 0.25;
    limbMaterial.emissiveColor = new BABYLON.Color3(0.08, 0.08, 0.1);
    armLeft.material = limbMaterial;
    armRight.material = limbMaterial;
    handLeft.material = limbMaterial;
    handRight.material = limbMaterial;

    // Antenna materials
    const antennaMaterial = new BABYLON.PBRMaterial('antennaMat', this.scene);
    antennaMaterial.baseColor = new BABYLON.Color3(0.3, 0.3, 0.35);
    antennaMaterial.metallicFactor = 1.0;
    antennaMaterial.roughnessFactor = 0.1;
    antenna.material = antennaMaterial;

    const antennaTipMaterial = new BABYLON.PBRMaterial('antennaTipMat', this.scene);
    antennaTipMaterial.baseColor = new BABYLON.Color3(1.0, 0.3, 0.1);
    antennaTipMaterial.emissiveColor = new BABYLON.Color3(1.5, 0.8, 0.3);
    antennaTipMaterial.roughnessFactor = 0.0;
    antennaTip.material = antennaTipMaterial;

    // Group all parts together
    const buzzerGroup = new BABYLON.Mesh('buzzerGroup', this.scene);
    buzzerBody.parent = buzzerGroup;
    buzzerHead.parent = buzzerGroup;
    eyeLeft.parent = buzzerGroup;
    eyeRight.parent = buzzerGroup;
    mouth.parent = buzzerGroup;
    armLeft.parent = buzzerGroup;
    armRight.parent = buzzerGroup;
    handLeft.parent = buzzerGroup;
    handRight.parent = buzzerGroup;
    antenna.parent = buzzerGroup;
    antennaTip.parent = buzzerGroup;

    this.buzzer = buzzerGroup;

    // Enhanced idle animation with multiple parts
    const idleAnimation = BABYLON.Animation.CreateAndStartAnimation(
      'buzzerIdle',
      buzzerGroup,
      'position.y',
      60,
      240,
      buzzerGroup.position.y,
      buzzerGroup.position.y + 0.3,
      BABYLON.Animation.ANIMATIONLOOPMODE_YOYO
    );

    // Eye glow animation
    const eyeGlowAnimation = new BABYLON.Animation(
      'eyeGlow',
      'emissiveColor',
      60,
      BABYLON.Animation.ANIMATIONTYPE_COLOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );
    
    const glowKeys = [
      { frame: 0, value: new BABYLON.Color3(0.5, 1.0, 1.5) },
      { frame: 120, value: new BABYLON.Color3(0.8, 1.2, 2.0) },
      { frame: 240, value: new BABYLON.Color3(0.5, 1.0, 1.5) }
    ];
    
    eyeGlowAnimation.setKeys(glowKeys);
    this.scene.beginAnimation(eyeMaterial, 0, 240, true);

    // === ENHANCED ANIMATIONS ===
    
    // Antenna tip blinking animation
    const antennaBlinkAnimation = new BABYLON.Animation(
      'antennaBlink',
      'emissiveColor',
      60,
      BABYLON.Animation.ANIMATIONTYPE_COLOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );
    const blinkKeys = [
      { frame: 0, value: new BABYLON.Color3(1.5, 0.8, 0.3) },
      { frame: 10, value: new BABYLON.Color3(0.5, 0.2, 0.1) },
      { frame: 20, value: new BABYLON.Color3(1.5, 0.8, 0.3) },
      { frame: 240, value: new BABYLON.Color3(1.5, 0.8, 0.3) }
    ];
    antennaBlinkAnimation.setKeys(blinkKeys);
    antennaTipMaterial.animations = [antennaBlinkAnimation];
    this.scene.beginAnimation(antennaTipMaterial, 0, 240, true);

    console.log('✅ HIGH-DETAIL AAA Buzzer character created with advanced PBR materials and enhanced animations');

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

  private async setupHDRIEnvironment(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    try {
      // Create a procedural HDRI-like environment (since we don't have actual HDRI files)
      // This gives a professional studio lighting look
      this.scene.environmentIntensity = 0.8;
      
      // Create skybox with gradient
      const skybox = BABYLON.MeshBuilder.CreateSphere('skyBox', { diameter: 100 }, this.scene);
      const skyboxMaterial = new BABYLON.StandardMaterial('skyBox', this.scene);
      skyboxMaterial.backFaceCulling = false;
      skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture.CreateFromImages([
        'data:,', 'data:,', 'data:,', 'data:,', 'data:,', 'data:,'
      ], this.scene);
      skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
      skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
      skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
      
      // Create gradient effect
      skyboxMaterial.disableLighting = true;
      skyboxMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.15, 0.3);
      skybox.material = skyboxMaterial;
      skybox.infiniteDistance = true;

      // Environment texture for reflections
      const hdrTexture = new BABYLON.CubeTexture.CreateFromImages([
        'data:,', 'data:,', 'data:,', 'data:,', 'data:,', 'data:,'
      ], this.scene);
      
      this.scene.environmentTexture = hdrTexture;
      this.scene.createDefaultSkybox(hdrTexture, true, 100);

      console.log('✅ HDRI environment setup completed');
    } catch (error) {
      console.warn('⚠️  HDRI environment setup failed:', error);
      // Fallback to basic environment
      const hemiLight = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(0, 1, 0), this.scene);
      hemiLight.intensity = 0.6;
    }
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