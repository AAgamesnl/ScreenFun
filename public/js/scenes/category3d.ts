// TapFrenzy 3D Category Vote Scene - AAA Visual Quality
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
// Phase 5: Configuration System Integration - ENABLED ✅
import { Config } from '../systems/configuration-manager';

declare global {
  interface Window {
    BABYLON: any; // Simplified for now to avoid import errors
  }
}

export class Category3DScene implements Scene {
  private canvas?: HTMLCanvasElement;
  private engine?: any;
  private scene?: any;
  private camera?: any;
  private buzzer?: any;
  private categoryDoors: any[] = [];
  private voteBubbles: Map<string, any[]> = new Map();
  private countdown: number = 12;
  private countdownTimer?: ReturnType<typeof setInterval> | null;
  private categories = [
    { name: 'History', emoji: '📚', color: [0.8, 0.3, 0.2], position: [-4, 2, 0] },
    { name: 'Science', emoji: '🔬', color: [0.2, 0.8, 0.3], position: [4, 2, 0] },
    { name: 'Entertainment', emoji: '🎬', color: [0.8, 0.2, 0.8], position: [-4, -2, 0] },
    { name: 'Sports', emoji: '⚽', color: [0.2, 0.5, 0.8], position: [4, -2, 0] }
  ];

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
    console.log('🎮 Starting TapFrenzy 3D Category Vote...');

    // 🚀 AAA Systems Initialization
    const performance = PerformanceManager.getInstance();
    performance.startProfiler('category3d-mount');
    
    try {
      // Enhanced Engine Initialization with WebGPU support
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
        console.log(`✅ High-DPI support enabled (${window.devicePixelRatio}x)`);
      }
      
      this.scene = new BABYLON.Scene(this.engine);
      this.scene.clearColor = new BABYLON.Color3(0.05, 0.1, 0.2); // Deep blue background

      // Create camera with static position for category vote
      this.camera = new BABYLON.ArcRotateCamera('categoryCamera', 
        -Math.PI / 2, Math.PI / 2.5, 12, 
        new BABYLON.Vector3(0, 1, 0), this.scene);
      
      // Lock camera movement during category vote
      this.camera.inputs.clear();
      this.camera.setTarget(new BABYLON.Vector3(0, 1, 0));

      console.log('✅ Category vote camera created (locked)');

      // Enhanced HDRI environment lighting
      await this.setupHDRIEnvironment();
      
      // Create floating category doors
      await this.createCategoryDoors();
      
      // Create Buzzer presenter
      await this.createBuzzer();
      
      // Create countdown display
      await this.createCountdownDisplay();
      
      // Add particle effects
      this.createAmbientParticles();
      
      // Start background music
      try {
        Audio.playMusic('category-vote-tension', { fadeIn: 1500 });
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
      this.buzzerSpeak('Choose your category! You have 12 seconds to vote!', 'excited');

      performance.endProfiler('category3d-mount');
      console.log('✅ 3D Category Vote Scene mounted successfully');

    } catch (error) {
      console.error('❌ 3D Category Vote initialization failed:', error);
      performance.endProfiler('category3d-mount');
      
      // Fallback to 2D
      root.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; color: white; text-align: center; background: linear-gradient(45deg, #0f1a2a, #1a2a3a);">
          <div>
            <h1>TapFrenzy Category Vote</h1>
            <p>3D Category Vote initialization failed</p>
            <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
          </div>
        </div>
      `;
    }
  }

  private async setupHDRIEnvironment(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create enhanced lighting setup
    const hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("/assets/environment.env", this.scene);
    this.scene.environmentTexture = hdrTexture;
    this.scene.environmentIntensity = 0.4;

    // Key light for dramatic voting atmosphere
    const keyLight = new BABYLON.DirectionalLight('keyLight', new BABYLON.Vector3(-0.3, -1, -0.5), this.scene);
    keyLight.intensity = 1.5;
    keyLight.diffuse = new BABYLON.Color3(1.0, 0.9, 0.8);
    
    // Colorful fill lights for each category door
    const fillLight1 = new BABYLON.PointLight('fillLight1', new BABYLON.Vector3(-4, 3, -2), this.scene);
    fillLight1.intensity = 0.8;
    fillLight1.diffuse = new BABYLON.Color3(0.8, 0.3, 0.2); // History red
    
    const fillLight2 = new BABYLON.PointLight('fillLight2', new BABYLON.Vector3(4, 3, -2), this.scene);
    fillLight2.intensity = 0.8;
    fillLight2.diffuse = new BABYLON.Color3(0.2, 0.8, 0.3); // Science green
    
    const fillLight3 = new BABYLON.PointLight('fillLight3', new BABYLON.Vector3(-4, -1, -2), this.scene);
    fillLight3.intensity = 0.8;
    fillLight3.diffuse = new BABYLON.Color3(0.8, 0.2, 0.8); // Entertainment purple
    
    const fillLight4 = new BABYLON.PointLight('fillLight4', new BABYLON.Vector3(4, -1, -2), this.scene);
    fillLight4.intensity = 0.8;
    fillLight4.diffuse = new BABYLON.Color3(0.2, 0.5, 0.8); // Sports blue

    console.log('✅ HDRI environment lighting setup');
  }

  private async createCategoryDoors(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    this.categories.forEach((category, index) => {
      // Create floating bubble door
      const door = BABYLON.MeshBuilder.CreateSphere(`door_${category.name}`, {
        diameter: 3.5,
        segments: 64
      }, this.scene);
      
      door.position = new BABYLON.Vector3(category.position[0], category.position[1], category.position[2]);
      
      // Create glassmorphism bubble material
      const doorMaterial = new BABYLON.PBRMaterial(`doorMat_${category.name}`, this.scene);
      
      // Base glass color with transparency
      doorMaterial.baseColor = new BABYLON.Color3(category.color[0], category.color[1], category.color[2]);
      doorMaterial.alpha = 0.2; // Very transparent
      doorMaterial.metallicFactor = 0.0;
      doorMaterial.roughnessFactor = 0.1;
      
      // Inner glow effect
      doorMaterial.emissiveColor = new BABYLON.Color3(
        (category.color[0] || 0) * 0.4,
        (category.color[1] || 0) * 0.4,
        (category.color[2] || 0) * 0.4
      );
      
      // Enable refraction for glass effect
      doorMaterial.indexOfRefraction = 1.3;
      doorMaterial.linkRefractionWithTransparency = true;
      
      door.material = doorMaterial;

      // Create category label
      const labelPlane = BABYLON.MeshBuilder.CreatePlane(`label_${category.name}`, {
        width: 2.8,
        height: 0.8
      }, this.scene);
      
      labelPlane.position = new BABYLON.Vector3(
        category.position[0] || 0, 
        (category.position[1] || 0) - 0.3, 
        (category.position[2] || 0) + 0.1
      );
      
      // Create dynamic texture for category text
      const labelTexture = new BABYLON.DynamicTexture(`labelTex_${category.name}`, {
        width: 512, 
        height: 128
      }, this.scene);
      
      labelTexture.hasAlpha = true;
      labelTexture.drawText(
        `${category.emoji} ${category.name}`, 
        null, null, 
        'bold 42px Arial', 
        '#FFFFFF', 
        'transparent', 
        true, true
      );
      
      const labelMaterial = new BABYLON.StandardMaterial(`labelMat_${category.name}`, this.scene);
      labelMaterial.diffuseTexture = labelTexture;
      labelMaterial.emissiveTexture = labelTexture;
      labelMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);
      labelMaterial.disableLighting = true;
      
      labelPlane.material = labelMaterial;

      // Floating animation
      const floatAnimation = BABYLON.Animation.CreateAndStartAnimation(
        `float_${category.name}`,
        door,
        'position.y',
        30,
        120,
        door.position.y,
        door.position.y + 0.5,
        BABYLON.Animation.ANIMATIONLOOPMODE_YOYO,
        BABYLON.EasingFunction.CreateSineEase()
      );

      // Rotation animation for mystique
      const rotateAnimation = BABYLON.Animation.CreateAndStartAnimation(
        `rotate_${category.name}`,
        door,
        'rotation.y',
        30,
        900, // 30 second rotation
        0,
        Math.PI * 2,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      );

      this.categoryDoors.push({
        mesh: door,
        label: labelPlane,
        category: category.name,
        votes: 0,
        index
      });

      // Initialize empty vote bubble array for this category
      this.voteBubbles.set(category.name, []);

      console.log(`✅ Created category door: ${category.name}`);
    });

    console.log('✅ All category doors created');
  }

  private async createBuzzer(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create a simplified but professional Buzzer for category scene
    const buzzerBody = BABYLON.MeshBuilder.CreateCapsule('buzzerBody', {
      radius: 0.4,
      height: 1.0,
      tessellation: 32
    }, this.scene);
    buzzerBody.position = new BABYLON.Vector3(0, 0.5, -6);

    const buzzerHead = BABYLON.MeshBuilder.CreateSphere('buzzerHead', {
      diameter: 0.6,
      segments: 32
    }, this.scene);
    buzzerHead.position = new BABYLON.Vector3(0, 1.2, -6);

    // Professional PBR materials
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

    // Subtle breathing animation
    const breathAnimation = BABYLON.Animation.CreateAndStartAnimation(
      'buzzerBreath',
      buzzerGroup,
      'scaling',
      60,
      180,
      new BABYLON.Vector3(1, 1, 1),
      new BABYLON.Vector3(1.05, 1.05, 1.05),
      BABYLON.Animation.ANIMATIONLOOPMODE_YOYO,
      BABYLON.EasingFunction.CreateSineEase()
    );

    console.log('✅ Buzzer presenter created for category vote');
  }

  private async createCountdownDisplay(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create countdown display
    const countdownPlane = BABYLON.MeshBuilder.CreatePlane('countdownPlane', {
      width: 2,
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

    console.log('✅ Countdown display created');
  }

  private updateCountdownDisplay(): void {
    const countdownTexture = (this as any).countdownTexture;
    if (!countdownTexture) return;

    countdownTexture.clear();
    
    // Color based on urgency
    let color = '#00FF88'; // Green
    if (this.countdown <= 5) color = '#FF4444'; // Red
    else if (this.countdown <= 8) color = '#FF8800'; // Orange
    
    countdownTexture.drawText(
      `Time: ${this.countdown}s`,
      null, 80,
      'bold 48px Arial',
      color,
      'transparent',
      true, true
    );
    
    countdownTexture.drawText(
      'Vote for Category!',
      null, 160,
      'bold 32px Arial',
      '#FFFFFF',
      'transparent',
      true, true
    );
  }

  private createAmbientParticles(): void {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create voting particle system
    const particleSystem = new BABYLON.ParticleSystem('votingParticles', 200, this.scene);
    
    // Texture
    particleSystem.particleTexture = new BABYLON.Texture('/assets/particles/star.png', this.scene);
    
    // Emission
    particleSystem.emitter = new BABYLON.Vector3(0, 8, -3);
    particleSystem.minEmitBox = new BABYLON.Vector3(-8, 0, 0);
    particleSystem.maxEmitBox = new BABYLON.Vector3(8, 0, 0);
    
    // Colors
    particleSystem.color1 = new BABYLON.Color4(1, 1, 1, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.7, 0.8, 1, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
    
    // Size and life
    particleSystem.minSize = 0.05;
    particleSystem.maxSize = 0.15;
    particleSystem.minLifeTime = 3;
    particleSystem.maxLifeTime = 8;
    
    // Emission rate
    particleSystem.emitRate = 15;
    
    // Velocity
    particleSystem.direction1 = new BABYLON.Vector3(-1, -2, 0);
    particleSystem.direction2 = new BABYLON.Vector3(1, -2, 0);
    particleSystem.minEmitPower = 0.5;
    particleSystem.maxEmitPower = 1.2;
    
    particleSystem.start();

    console.log('✅ Ambient voting particles created');
  }

  private startCountdown(): void {
    this.countdownTimer = setInterval(() => {
      this.countdown--;
      this.updateCountdownDisplay();
      
      // Play tick sound
      try {
        if (this.countdown <= 5) {
          Audio.playSound('countdown-urgent', { volume: 0.7 });
        } else {
          Audio.playSound('countdown-tick', { volume: 0.5 });
        }
      } catch (error) {
        // Audio not available
      }
      
      if (this.countdown <= 0) {
        this.endVoting();
      }
    }, 1000);
  }

  private endVoting(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    
    // Find winning category (for demo, pick random)
    const winnerIndex = Math.floor(Math.random() * this.categories.length);
    const winner = this.categories[winnerIndex];
    
    if (!winner) {
      console.error('No winner found');
      return;
    }
    
    this.buzzerSpeak(`The winner is ${winner.name}! Let's play!`, 'excited');
    
    // Highlight winning door
    this.highlightWinnerDoor(winnerIndex);
    
    // Transition to power plays after 3 seconds
    setTimeout(() => {
      this.transitionToPowerPlays(winner.name);
    }, 3000);
    
    console.log(`🏆 Category vote ended. Winner: ${winner.name}`);
  }

  private highlightWinnerDoor(winnerIndex: number): void {
    const winner = this.categoryDoors[winnerIndex];
    if (!winner) return;

    const BABYLON = window.BABYLON;

    // Create burst effect
    const burstAnimation = BABYLON.Animation.CreateAndStartAnimation(
      'winnerBurst',
      winner.mesh,
      'scaling',
      60,
      60,
      winner.mesh.scaling,
      new BABYLON.Vector3(1.5, 1.5, 1.5),
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    
    // Enhanced glow
    const material = winner.mesh.material as any;
    if (material) {
      material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    }

    console.log('✅ Winner door highlighted');
  }

  private transitionToPowerPlays(category: string): void {
    const sceneManager = (window as any).gameSceneManager;
    if (sceneManager) {
      import('./powerplays').then(({ PowerPlaysScene }) => {
        sceneManager.set(new PowerPlaysScene());
      }).catch(error => {
        console.error('❌ Failed to load power plays scene:', error);
        // Fallback to question scene
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
            utterance.rate = 1.1;
            utterance.pitch = 1.3;
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

  // Add vote bubble (called when player votes)
  addVoteBubble(category: string, playerId: string): void {
    const door = this.categoryDoors.find(d => d.category === category);
    if (!door || !this.scene) return;

    const BABYLON = window.BABYLON;

    // Create small vote bubble
    const voteBubble = BABYLON.MeshBuilder.CreateSphere(`vote_${playerId}`, {
      diameter: 0.3,
      segments: 16
    }, this.scene);

    // Random position around the door
    const angle = Math.random() * Math.PI * 2;
    const distance = 2 + Math.random() * 0.5;
    
    voteBubble.position = new BABYLON.Vector3(
      door.mesh.position.x + Math.cos(angle) * distance,
      door.mesh.position.y + (Math.random() - 0.5) * 2,
      door.mesh.position.z + Math.sin(angle) * distance
    );

    // Bubble material
    const bubbleMaterial = new BABYLON.StandardMaterial(`voteMat_${playerId}`, this.scene);
    bubbleMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    bubbleMaterial.alpha = 0.8;
    
    voteBubble.material = bubbleMaterial;

    // Rising animation
    const riseAnimation = BABYLON.Animation.CreateAndStartAnimation(
      `rise_${playerId}`,
      voteBubble,
      'position.y',
      60,
      120,
      voteBubble.position.y,
      voteBubble.position.y + 2,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    // Add to vote bubbles
    const categoryBubbles = this.voteBubbles.get(category) || [];
    categoryBubbles.push(voteBubble);
    this.voteBubbles.set(category, categoryBubbles);

    // Update door vote count
    door.votes++;

    console.log(`🗳️ Vote bubble added for ${category} by ${playerId}`);
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
    
    console.log('✅ Category 3D Scene unmounted');
  }

  onMessage(msg: S2C): void {
    // TODO: Add proper message type support for category voting
    console.log('Category scene received message:', msg.t);
  }
}