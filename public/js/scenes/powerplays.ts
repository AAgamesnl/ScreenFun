// TapFrenzy 3D Power Plays Scene - AAA Visual Quality
import type { Scene } from './scene-manager';
import type { S2C } from '../net';

// Phase 1: Audio Integration - ENABLED ✅
import { Audio } from '../systems/audio-manager';
// Phase 2: Visual Effects Integration - ENABLED ✅
import { VisualEffects } from '../systems/visual-effects-manager';
// Phase 3: UI Animation Integration - ENABLED ✅
import { UIAnimations } from '../systems/ui-animation-manager';
// Phase 4: Performance Monitoring Integration - ENABLED ✅
import { PerformanceManager } from '../systems/performance-manager';

declare global {
  interface Window {
    BABYLON: any; // Simplified for now to avoid import errors
  }
}

interface PowerPlay {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: [number, number, number];
  needsTarget: boolean;
}

export class PowerPlaysScene implements Scene {
  private canvas?: HTMLCanvasElement;
  private engine?: any;
  private scene?: any;
  private camera?: any;
  private buzzer?: any;
  private countdown: number = 8;
  private countdownTimer?: ReturnType<typeof setInterval> | null;
  
  private powerPlays: PowerPlay[] = [
    {
      id: 'freeze',
      name: 'Freeze',
      description: 'Ice overlay on target phone - requires N taps to clear',
      icon: '❄️',
      color: [0.2, 0.7, 1.0],
      needsTarget: true
    },
    {
      id: 'gloop',
      name: 'Gloop',
      description: 'Slime smear - requires 3 swipes to clean',
      icon: '🟢',
      color: [0.3, 0.8, 0.2],
      needsTarget: true
    },
    {
      id: 'double',
      name: 'Double',
      description: 'Next question score ×2 - no hindrance overlay',
      icon: '✨',
      color: [1.0, 0.8, 0.2],
      needsTarget: false
    }
  ];
  
  private playerSelections: Map<string, { power: string; target?: string }> = new Map();
  private playersList: Array<{ id: string; name: string }> = [];

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
    console.log('🎮 Starting TapFrenzy 3D Power Plays...');

    // 🚀 AAA Systems Initialization
    const performance = PerformanceManager.getInstance();
    performance.startProfiler('powerplays3d-mount');
    
    try {
      // Enhanced Engine Initialization
      this.engine = new BABYLON.Engine(this.canvas, true, { 
        antialias: true, 
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
        stencil: true,
        depth: true
      });
      
      // 4K-ready: Set hardware scaling for high DPI displays
      if (window.devicePixelRatio && window.devicePixelRatio > 1) {
        this.engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
      }
      
      this.scene = new BABYLON.Scene(this.engine);
      this.scene.clearColor = new BABYLON.Color3(0.1, 0.05, 0.15); // Dark purple background

      // Create camera with slight movement for power plays
      this.camera = new BABYLON.ArcRotateCamera('powerCamera', 
        -Math.PI / 2, Math.PI / 2.2, 10, 
        new BABYLON.Vector3(0, 1.5, 0), this.scene);
      
      // Allow minimal camera movement during power plays
      this.camera.lowerRadiusLimit = 8;
      this.camera.upperRadiusLimit = 15;
      this.camera.lowerBetaLimit = Math.PI / 3;
      this.camera.upperBetaLimit = Math.PI / 1.8;
      this.camera.inputs.attached.pointers.angularSensibilityX = 3000;
      this.camera.inputs.attached.pointers.angularSensibilityY = 3000;

      console.log('✅ Power plays camera created');

      // Enhanced lighting
      await this.setupLighting();
      
      // Create power play displays
      await this.createPowerPlayDisplays();
      
      // Create Buzzer presenter
      await this.createBuzzer();
      
      // Create countdown display
      await this.createCountdownDisplay();
      
      // Create player selection grid
      await this.createPlayerSelectionGrid();
      
      // Add atmospheric effects
      this.createAtmosphericEffects();
      
      // Start background music
      try {
        Audio.playMusic('power-plays-selection', { fadeIn: 1500 });
      } catch (error) {
        console.warn('Audio not available:', error);
      }

      // Start render loop
      this.engine.runRenderLoop(() => {
        this.scene?.render();
      });

      // Handle window resize
      window.addEventListener('resize', this.handleResize.bind(this));
      
      // Start countdown timer
      this.startCountdown();

      // Make Buzzer speak introduction
      this.buzzerSpeak('Choose your power plays! You have 8 seconds to decide!', 'excited');

      performance.endProfiler('powerplays3d-mount');
      console.log('✅ 3D Power Plays Scene mounted successfully');

    } catch (error) {
      console.error('❌ 3D Power Plays initialization failed:', error);
      performance.endProfiler('powerplays3d-mount');
      
      // Fallback to 2D
      root.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; color: white; text-align: center; background: linear-gradient(45deg, #0f1a2a, #1a2a3a);">
          <div>
            <h1>TapFrenzy Power Plays</h1>
            <p>3D Power Plays initialization failed</p>
            <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
          </div>
        </div>
      `;
    }
  }

  private async setupLighting(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create HDRI environment
    const hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("/assets/environment.env", this.scene);
    this.scene.environmentTexture = hdrTexture;
    this.scene.environmentIntensity = 0.3;

    // Dramatic key light from above
    const keyLight = new BABYLON.DirectionalLight('keyLight', new BABYLON.Vector3(0, -1, -0.3), this.scene);
    keyLight.intensity = 1.8;
    keyLight.diffuse = new BABYLON.Color3(1.0, 0.95, 0.9);
    
    // Colorful accent lights for each power play
    const freezeLight = new BABYLON.PointLight('freezeLight', new BABYLON.Vector3(-4, 2, 0), this.scene);
    freezeLight.intensity = 0.8;
    freezeLight.diffuse = new BABYLON.Color3(0.2, 0.7, 1.0);
    
    const gloopLight = new BABYLON.PointLight('gloopLight', new BABYLON.Vector3(0, 2, 0), this.scene);
    gloopLight.intensity = 0.8;
    gloopLight.diffuse = new BABYLON.Color3(0.3, 0.8, 0.2);
    
    const doubleLight = new BABYLON.PointLight('doubleLight', new BABYLON.Vector3(4, 2, 0), this.scene);
    doubleLight.intensity = 0.8;
    doubleLight.diffuse = new BABYLON.Color3(1.0, 0.8, 0.2);

    console.log('✅ Power plays lighting setup');
  }

  private async createPowerPlayDisplays(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    this.powerPlays.forEach((power, index) => {
      const xPos = (index - 1) * 4; // -4, 0, 4

      // Create power play pedestal
      const pedestal = BABYLON.MeshBuilder.CreateCylinder(`pedestal_${power.id}`, {
        height: 0.5,
        diameterTop: 2.5,
        diameterBottom: 2.8,
        tessellation: 32
      }, this.scene);
      
      pedestal.position = new BABYLON.Vector3(xPos, 0.25, 0);

      // Create floating power icon
      const iconSphere = BABYLON.MeshBuilder.CreateSphere(`icon_${power.id}`, {
        diameter: 1.5,
        segments: 32
      }, this.scene);
      
      iconSphere.position = new BABYLON.Vector3(xPos, 2, 0);

      // Power play materials
      const pedestalMaterial = new BABYLON.PBRMaterial(`pedestalMat_${power.id}`, this.scene);
      pedestalMaterial.baseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      pedestalMaterial.metallicFactor = 0.8;
      pedestalMaterial.roughnessFactor = 0.2;
      pedestal.material = pedestalMaterial;

      const iconMaterial = new BABYLON.PBRMaterial(`iconMat_${power.id}`, this.scene);
      iconMaterial.baseColor = new BABYLON.Color3(power.color[0], power.color[1], power.color[2]);
      iconMaterial.alpha = 0.8;
      iconMaterial.metallicFactor = 0.0;
      iconMaterial.roughnessFactor = 0.1;
      iconMaterial.emissiveColor = new BABYLON.Color3(
        power.color[0] * 0.5,
        power.color[1] * 0.5,
        power.color[2] * 0.5
      );
      iconSphere.material = iconMaterial;

      // Create text display
      const textPlane = BABYLON.MeshBuilder.CreatePlane(`text_${power.id}`, {
        width: 3,
        height: 1.2
      }, this.scene);
      
      textPlane.position = new BABYLON.Vector3(xPos, 1, 1.5);

      // Dynamic texture for text
      const textTexture = new BABYLON.DynamicTexture(`textTex_${power.id}`, {
        width: 512,
        height: 256
      }, this.scene);
      
      textTexture.hasAlpha = true;
      textTexture.drawText(
        `${power.icon} ${power.name}`,
        null, 80,
        'bold 36px Arial',
        '#FFFFFF',
        'transparent',
        true, true
      );
      
      textTexture.drawText(
        power.description,
        null, 140,
        '24px Arial',
        '#CCCCCC',
        'transparent',
        true, true
      );
      
      const textMaterial = new BABYLON.StandardMaterial(`textMat_${power.id}`, this.scene);
      textMaterial.diffuseTexture = textTexture;
      textMaterial.emissiveTexture = textTexture;
      textMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);
      textMaterial.disableLighting = true;
      
      textPlane.material = textMaterial;

      // Floating animation
      const floatAnimation = BABYLON.Animation.CreateAndStartAnimation(
        `float_${power.id}`,
        iconSphere,
        'position.y',
        30,
        120,
        iconSphere.position.y,
        iconSphere.position.y + 0.5,
        BABYLON.Animation.ANIMATIONLOOPMODE_YOYO,
        BABYLON.EasingFunction.CreateSineEase()
      );

      // Gentle rotation
      const rotateAnimation = BABYLON.Animation.CreateAndStartAnimation(
        `rotate_${power.id}`,
        iconSphere,
        'rotation.y',
        30,
        600, // 20 second rotation
        0,
        Math.PI * 2,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      );

      console.log(`✅ Created power play display: ${power.name}`);
    });

    console.log('✅ All power play displays created');
  }

  private async createBuzzer(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Simplified Buzzer for power plays scene
    const buzzerBody = BABYLON.MeshBuilder.CreateCapsule('buzzerBody', {
      radius: 0.3,
      height: 0.8,
      tessellation: 32
    }, this.scene);
    buzzerBody.position = new BABYLON.Vector3(0, 0.4, -5);

    const buzzerHead = BABYLON.MeshBuilder.CreateSphere('buzzerHead', {
      diameter: 0.5,
      segments: 32
    }, this.scene);
    buzzerHead.position = new BABYLON.Vector3(0, 1.0, -5);

    // Professional materials
    const buzzerMaterial = new BABYLON.PBRMaterial('buzzerMat', this.scene);
    buzzerMaterial.baseColor = new BABYLON.Color3(0.7, 0.8, 0.9);
    buzzerMaterial.metallicFactor = 0.8;
    buzzerMaterial.roughnessFactor = 0.3;
    buzzerMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.1, 0.15);
    
    buzzerBody.material = buzzerMaterial;
    buzzerHead.material = buzzerMaterial;

    // Group together
    const buzzerGroup = new BABYLON.Mesh('buzzerGroup', this.scene);
    buzzerBody.parent = buzzerGroup;
    buzzerHead.parent = buzzerGroup;
    
    this.buzzer = buzzerGroup;

    // Excitement animation for power plays
    const exciteAnimation = BABYLON.Animation.CreateAndStartAnimation(
      'buzzerExcite',
      buzzerGroup,
      'rotation.z',
      60,
      120,
      0,
      0.2,
      BABYLON.Animation.ANIMATIONLOOPMODE_YOYO,
      BABYLON.EasingFunction.CreateSineEase()
    );

    console.log('✅ Buzzer presenter created for power plays');
  }

  private async createCountdownDisplay(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create countdown display
    const countdownPlane = BABYLON.MeshBuilder.CreatePlane('countdownPlane', {
      width: 2.5,
      height: 1
    }, this.scene);
    
    countdownPlane.position = new BABYLON.Vector3(0, 4, 0);

    // Dynamic texture for countdown
    const countdownTexture = new BABYLON.DynamicTexture('countdownTexture', {
      width: 512,
      height: 256
    }, this.scene);
    
    const countdownMaterial = new BABYLON.StandardMaterial('countdownMat', this.scene);
    countdownMaterial.diffuseTexture = countdownTexture;
    countdownMaterial.emissiveTexture = countdownTexture;
    countdownMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    countdownMaterial.disableLighting = true;
    
    countdownPlane.material = countdownMaterial;

    // Store references for updates
    (this as any).countdownPlane = countdownPlane;
    (this as any).countdownTexture = countdownTexture;
    
    this.updateCountdownDisplay();

    console.log('✅ Power plays countdown display created');
  }

  private async createPlayerSelectionGrid(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create selection grid display for host
    const gridPlane = BABYLON.MeshBuilder.CreatePlane('selectionGrid', {
      width: 8,
      height: 4
    }, this.scene);
    
    gridPlane.position = new BABYLON.Vector3(0, 1.5, -3);

    // Dynamic texture for player selections
    const gridTexture = new BABYLON.DynamicTexture('gridTexture', {
      width: 1024,
      height: 512
    }, this.scene);
    
    const gridMaterial = new BABYLON.StandardMaterial('gridMat', this.scene);
    gridMaterial.diffuseTexture = gridTexture;
    gridMaterial.emissiveTexture = gridTexture;
    gridMaterial.emissiveColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    gridMaterial.disableLighting = true;
    
    gridPlane.material = gridMaterial;

    // Store references
    (this as any).gridPlane = gridPlane;
    (this as any).gridTexture = gridTexture;
    
    this.updateSelectionGrid();

    console.log('✅ Player selection grid created');
  }

  private updateCountdownDisplay(): void {
    const countdownTexture = (this as any).countdownTexture;
    if (!countdownTexture) return;

    countdownTexture.clear();
    
    // Color based on urgency
    let color = '#00FF88'; // Green
    if (this.countdown <= 3) color = '#FF4444'; // Red
    else if (this.countdown <= 5) color = '#FF8800'; // Orange
    
    countdownTexture.drawText(
      `Time: ${this.countdown}s`,
      null, 80,
      'bold 48px Arial',
      color,
      'transparent',
      true, true
    );
    
    countdownTexture.drawText(
      'Choose Power Plays!',
      null, 160,
      'bold 32px Arial',
      '#FFFFFF',
      'transparent',
      true, true
    );
  }

  private updateSelectionGrid(): void {
    const gridTexture = (this as any).gridTexture;
    if (!gridTexture) return;

    gridTexture.clear();
    
    // Draw header
    gridTexture.drawText(
      'Player Power Play Selections',
      null, 40,
      'bold 32px Arial',
      '#FFFFFF',
      'transparent',
      true, true
    );

    // Draw player selections (if any)
    let yOffset = 100;
    this.playerSelections.forEach((selection, playerId) => {
      const text = `${playerId}: ${selection.power}${selection.target ? ` → ${selection.target}` : ''}`;
      gridTexture.drawText(
        text,
        20, yOffset,
        '24px Arial',
        '#CCCCCC',
        'transparent',
        false, true
      );
      yOffset += 35;
    });
    
    if (this.playerSelections.size === 0) {
      gridTexture.drawText(
        'Waiting for player selections...',
        null, 200,
        '28px Arial',
        '#888888',
        'transparent',
        true, true
      );
    }
  }

  private createAtmosphericEffects(): void {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create power-up particle effects
    const particleSystem = new BABYLON.ParticleSystem('powerParticles', 150, this.scene);
    
    // Texture
    particleSystem.particleTexture = new BABYLON.Texture('/assets/particles/spark.png', this.scene);
    
    // Emission around power displays
    particleSystem.emitter = new BABYLON.Vector3(0, 3, 0);
    particleSystem.minEmitBox = new BABYLON.Vector3(-6, 0, -1);
    particleSystem.maxEmitBox = new BABYLON.Vector3(6, 0, 1);
    
    // Colors - magical power effect
    particleSystem.color1 = new BABYLON.Color4(1, 0.8, 0.2, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.8, 0.2, 1, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
    
    // Size and life
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.3;
    particleSystem.minLifeTime = 2;
    particleSystem.maxLifeTime = 6;
    
    // Emission rate
    particleSystem.emitRate = 25;
    
    // Velocity - sparkling upward effect
    particleSystem.direction1 = new BABYLON.Vector3(-0.5, 1, -0.5);
    particleSystem.direction2 = new BABYLON.Vector3(0.5, 1.5, 0.5);
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 2;
    
    particleSystem.start();

    console.log('✅ Atmospheric power effects created');
  }

  private startCountdown(): void {
    this.countdownTimer = setInterval(() => {
      this.countdown--;
      this.updateCountdownDisplay();
      
      // Play tick sound
      try {
        if (this.countdown <= 3) {
          Audio.playSound('countdown-urgent', { volume: 0.8 });
        } else {
          Audio.playSound('countdown-tick', { volume: 0.6 });
        }
      } catch (error) {
        // Audio not available
      }
      
      if (this.countdown <= 0) {
        this.endPowerPlays();
      }
    }, 1000);
  }

  private endPowerPlays(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    
    this.buzzerSpeak('Power plays selected! Let\'s begin the questions!', 'excited');
    
    // Transition to questions after 2 seconds
    setTimeout(() => {
      this.transitionToQuestions();
    }, 2000);
    
    console.log('⚡ Power plays selection ended');
  }

  private transitionToQuestions(): void {
    const sceneManager = (window as any).gameSceneManager;
    if (sceneManager) {
      import('./question3d').then(({ Question3DScene }) => {
        sceneManager.set(new Question3DScene());
      }).catch(error => {
        console.error('❌ Failed to load 3D question scene:', error);
        // Fallback to 2D question scene
        import('./question').then(({ QuestionScene }) => {
          sceneManager.set(new QuestionScene());
        });
      });
    }
  }

  private buzzerSpeak(text: string, context: 'introduction' | 'idle' | 'excited' = 'idle'): void {
    try {
      // Web Speech API TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configure voice based on context
        switch (context) {
          case 'introduction':
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            utterance.volume = 0.8;
            break;
          case 'excited':
            utterance.rate = 1.2;
            utterance.pitch = 1.4;
            utterance.volume = 0.9;
            break;
          default: // idle
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 0.7;
        }
        
        // Enhanced voice selection
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Microsoft') ||
          voice.default
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        speechSynthesis.speak(utterance);
        
        // Visual feedback on Buzzer
        this.animateBuzzerSpeaking(true);
        utterance.onend = () => this.animateBuzzerSpeaking(false);
      }
    } catch (error) {
      console.warn('TTS not available:', error);
    }
  }

  private animateBuzzerSpeaking(speaking: boolean): void {
    if (!this.buzzer) return;

    if (speaking) {
      // Add speaking animation
      this.buzzer.scaling = new window.BABYLON.Vector3(1.1, 1.1, 1.1);
    } else {
      // Return to normal
      this.buzzer.scaling = new window.BABYLON.Vector3(1, 1, 1);
    }
  }

  private handleResize(): void {
    if (this.engine && this.canvas) {
      this.engine.resize();
    }
  }

  // Handle player power play selections
  addPlayerSelection(playerId: string, powerPlay: string, target?: string): void {
    const selection = target ? { power: powerPlay, target } : { power: powerPlay };
    this.playerSelections.set(playerId, selection);
    this.updateSelectionGrid();
    
    console.log(`⚡ Player ${playerId} selected ${powerPlay}${target ? ` targeting ${target}` : ''}`);
  }

  unmount(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
    
    try {
      // Audio.stopMusic({ fadeOut: 1000 }); // TODO: Fix audio manager
    } catch (error) {
      // Audio not available
    }
    
    window.removeEventListener('resize', this.handleResize);
    
    if (this.engine) {
      this.engine.dispose();
    }
    
    this.canvas?.remove();
    
    console.log('✅ Power Plays 3D Scene unmounted');
  }

  onMessage(msg: S2C): void {
    // TODO: Add proper message type support for power plays
    console.log('PowerPlays scene received message:', msg.t);
  }
}
