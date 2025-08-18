import type { Scene } from './scene-manager';

declare const BABYLON: any;

/** 3D Main Menu scene with Babylon.js */
export class Menu3DScene implements Scene {
  private engine?: any;
  private scene?: any;
  private camera?: any;
  private canvas?: HTMLCanvasElement;

  constructor() {}

  mount(root: HTMLElement): void {
    // Create canvas for 3D rendering
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'renderCanvas';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100vh';
    this.canvas.style.display = 'block';
    
    root.innerHTML = '';
    root.appendChild(this.canvas);

    this.initBabylon();
    this.createScene();
    this.setupMenuItems();
    this.startRenderLoop();
  }

  unmount(): void {
    if (this.engine) {
      this.engine.dispose();
    }
    this.canvas?.remove();
  }

  onMessage(): void {
    // Handle server messages
  }

  private initBabylon(): void {
    if (!this.canvas) return;
    
    try {
      this.engine = new BABYLON.Engine(this.canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        antialias: true
      });
      
      // Handle resize
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
    
    // Create camera with cinematic movement
    this.camera = new BABYLON.ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 2.5,
      10,
      BABYLON.Vector3.Zero(),
      this.scene
    );
    
    this.camera.attachControls(this.canvas);
    
    // Add lighting
    const light = new BABYLON.HemisphericLight(
      'light',
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    light.intensity = 0.7;

    // Create TapFrenzy logo/title
    this.createLogo();
    
    // Add ambient environment
    this.createEnvironment();
    
    // Start camera animations
    this.startCameraAnimations();
  }

  private createLogo(): void {
    // Create 3D text or logo placeholder
    const logoBox = BABYLON.MeshBuilder.CreateBox('logo', {size: 2}, this.scene);
    logoBox.position.y = 2;
    
    // Add floating animation
    BABYLON.Animation.CreateAndStartAnimation(
      'logoFloat',
      logoBox,
      'position.y',
      30,
      120,
      2,
      2.5,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );
  }

  private createEnvironment(): void {
    // Create ground/platform
    const ground = BABYLON.MeshBuilder.CreateGround('ground', {width: 20, height: 20}, this.scene);
    ground.position.y = -2;
    
    // Add particle system for ambient effects
    // Note: Requires full Babylon.js for particle systems
  }

  private setupMenuItems(): void {
    // Create 3D menu items: Play, Party Packs, Options, How to Play, Quit
    const menuItems = ['Play', 'Party Packs', 'Options', 'How to Play', 'Quit'];
    
    menuItems.forEach((item, index) => {
      const menuBox = BABYLON.MeshBuilder.CreateBox(`menu_${item}`, {width: 3, height: 0.5, depth: 0.1}, this.scene);
      menuBox.position.x = (index - 2) * 4;
      menuBox.position.y = -1;
      
      // Add click handling
      menuBox.actionManager = new BABYLON.ActionManager(this.scene);
      menuBox.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
          this.handleMenuClick(item);
        })
      );
    });
  }

  private startCameraAnimations(): void {
    // Create cinematic camera sweeps
    if (!this.camera) return;
    
    // Smooth orbital movement
    BABYLON.Animation.CreateAndStartAnimation(
      'cameraOrbit',
      this.camera,
      'alpha',
      60,
      1800, // 30 seconds at 60fps
      -Math.PI / 2,
      -Math.PI / 2 + Math.PI * 2,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );
  }

  private startRenderLoop(): void {
    if (!this.engine || !this.scene) return;
    
    this.engine.runRenderLoop(() => {
      this.scene?.render();
    });
  }

  private handleMenuClick(item: string): void {
    console.log(`Menu clicked: ${item}`);
    
    switch (item) {
      case 'Play':
        // Transition to lobby
        break;
      case 'Party Packs':
        // Show categories
        break;
      case 'Options':
        // Show settings
        break;
      case 'How to Play':
        // Show tutorial
        break;
      case 'Quit':
        // Exit application
        break;
    }
  }
}