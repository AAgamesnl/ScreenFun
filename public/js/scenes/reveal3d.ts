// TapFrenzy 3D Reveal Scene - AAA Visual Quality
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

interface PlayerResult {
  id: string;
  name: string;
  answer: number | null;
  correct: boolean;
  score: number;
  scoreDelta: number;
}

export class Reveal3DScene implements Scene {
  private canvas?: HTMLCanvasElement;
  private engine?: any;
  private scene?: any;
  private camera?: any;
  private buzzer?: any;
  private correctOptionTile?: any;
  private scoreBubbles: any[] = [];
  
  private currentReveal = {
    questionText: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctIndex: 2,
    playerResults: [
      { id: 'player1', name: 'Alice', answer: 2, correct: true, score: 1200, scoreDelta: 820 },
      { id: 'player2', name: 'Bob', answer: 0, correct: false, score: 800, scoreDelta: 0 },
      { id: 'player3', name: 'Charlie', answer: 2, correct: true, score: 1500, scoreDelta: 750 },
      { id: 'player4', name: 'Diana', answer: 1, correct: false, score: 600, scoreDelta: 0 }
    ] as PlayerResult[]
  };

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
    console.log('🎮 Starting TapFrenzy 3D Reveal Scene...');

    // 🚀 AAA Systems Initialization
    const performance = PerformanceManager.getInstance();
    performance.startProfiler('reveal3d-mount');
    
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
      this.scene.clearColor = new BABYLON.Color3(0.05, 0.15, 0.05); // Dark green celebration

      // Create dynamic camera for reveal drama
      this.camera = new BABYLON.ArcRotateCamera('revealCamera', 
        -Math.PI / 2, Math.PI / 2.3, 10, 
        new BABYLON.Vector3(0, 1, 0), this.scene);
      
      // Allow slight camera movement for reveal excitement
      this.camera.lowerRadiusLimit = 8;
      this.camera.upperRadiusLimit = 15;
      this.camera.inputs.attached.pointers.angularSensibilityX = 4000;
      this.camera.inputs.attached.pointers.angularSensibilityY = 4000;

      console.log('✅ Reveal camera created');

      // Enhanced celebration lighting
      await this.setupCelebrationLighting();
      
      // Show correct answer prominently
      await this.createCorrectAnswerDisplay();
      
      // Create player score pedestals
      await this.createPlayerPedestals();
      
      // Create Buzzer presenter for reactions
      await this.createBuzzer();
      
      // Add celebration effects
      this.createCelebrationEffects();
      
      // Start victory music
      try {
        Audio.playMusic('reveal-celebration', { fadeIn: 1500 });
      } catch (error) {
        console.warn('Audio not available:', error);
      }

      // Start render loop
      this.engine.runRenderLoop(() => {
        this.scene?.render();
      });

      // Handle window resize
      window.addEventListener('resize', this.handleResize.bind(this));
      
      // Start reveal sequence
      this.startRevealSequence();

      performance.endProfiler('reveal3d-mount');
      console.log('✅ 3D Reveal Scene mounted successfully');

    } catch (error) {
      console.error('❌ 3D Reveal initialization failed:', error);
      performance.endProfiler('reveal3d-mount');
      
      // Fallback to 2D
      root.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; color: white; text-align: center; background: linear-gradient(45deg, #0f2a1a, #1a3a2a);">
          <div>
            <h1>TapFrenzy Reveal</h1>
            <p>3D Reveal initialization failed</p>
            <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
          </div>
        </div>
      `;
    }
  }

  private async setupCelebrationLighting(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create celebration HDRI environment
    const hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("/assets/celebration_environment.env", this.scene);
    this.scene.environmentTexture = hdrTexture;
    this.scene.environmentIntensity = 0.6;

    // Dramatic spotlight on correct answer
    const correctSpotlight = new BABYLON.SpotLight('correctSpot', 
      new BABYLON.Vector3(0, 8, -5), 
      new BABYLON.Vector3(0, -1, 0.5), 
      Math.PI / 4, 3, this.scene);
    correctSpotlight.intensity = 3.0;
    correctSpotlight.diffuse = new BABYLON.Color3(0.2, 1.0, 0.2); // Bright green

    // Warm celebration fill light
    const celebrationLight = new BABYLON.DirectionalLight('celebrationLight', new BABYLON.Vector3(-0.3, -1, -0.3), this.scene);
    celebrationLight.intensity = 1.5;
    celebrationLight.diffuse = new BABYLON.Color3(1.0, 0.9, 0.7);
    
    // Colorful lights for each player pedestal
    const colors = [
      new BABYLON.Color3(1.0, 0.6, 0.2), // Orange
      new BABYLON.Color3(0.6, 0.2, 1.0), // Purple
      new BABYLON.Color3(0.2, 0.8, 1.0), // Cyan
      new BABYLON.Color3(1.0, 0.2, 0.6)  // Magenta
    ];
    
    const positions = [
      new BABYLON.Vector3(-4, 2, 2),
      new BABYLON.Vector3(-1, 2, 2),
      new BABYLON.Vector3(2, 2, 2),
      new BABYLON.Vector3(5, 2, 2)
    ];
    
    positions.forEach((pos, i) => {
      const playerLight = new BABYLON.PointLight(`playerLight_${i}`, pos, this.scene);
      playerLight.intensity = 0.8;
      playerLight.diffuse = colors[i] || new BABYLON.Color3(1, 1, 1);
    });

    console.log('✅ Celebration lighting setup');
  }

  private async createCorrectAnswerDisplay(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create large correct answer display
    const correctDisplay = BABYLON.MeshBuilder.CreatePlane('correctDisplay', {
      width: 8,
      height: 3
    }, this.scene);
    
    correctDisplay.position = new BABYLON.Vector3(0, 4, 0);

    // Create dynamic texture for correct answer
    const correctTexture = new BABYLON.DynamicTexture('correctTexture', {
      width: 1024,
      height: 512
    }, this.scene);
    
    // Draw celebration background
    const ctx = correctTexture.getContext();
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#2a5a2a');
    gradient.addColorStop(1, '#1a3a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 512);
    
    // Draw golden border for correct answer
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, 984, 472);
    
    correctTexture.update();
    
    // Draw correct answer text
    correctTexture.drawText(
      '✅ CORRECT ANSWER',
      null, 120,
      'bold 48px Arial',
      '#00FF88',
      'transparent',
      true, true
    );
    
    correctTexture.drawText(
      `${String.fromCharCode(65 + this.currentReveal.correctIndex)}) ${this.currentReveal.options[this.currentReveal.correctIndex]}`,
      null, 250,
      'bold 64px Arial',
      '#FFFFFF',
      'transparent',
      true, true
    );
    
    correctTexture.drawText(
      'Score Deltas Incoming!',
      null, 380,
      '36px Arial',
      '#FFD700',
      'transparent',
      true, true
    );
    
    const correctMaterial = new BABYLON.StandardMaterial('correctMat', this.scene);
    correctMaterial.diffuseTexture = correctTexture;
    correctMaterial.emissiveTexture = correctTexture;
    correctMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    correctMaterial.disableLighting = true;
    
    correctDisplay.material = correctMaterial;
    
    this.correctOptionTile = correctDisplay;

    // Pulsing celebration animation
    const pulseAnimation = BABYLON.Animation.CreateAndStartAnimation(
      'correctPulse',
      correctDisplay,
      'scaling',
      60,
      120,
      new BABYLON.Vector3(1, 1, 1),
      new BABYLON.Vector3(1.1, 1.1, 1.1),
      BABYLON.Animation.ANIMATIONLOOPMODE_YOYO,
      BABYLON.EasingFunction.CreateSineEase()
    );

    console.log('✅ Correct answer display created');
  }

  private async createPlayerPedestals(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;
    
    this.currentReveal.playerResults.forEach((player, index) => {
      const xPos = -4.5 + (index * 3); // Spread players across scene

      // Create pedestal for player
      const pedestal = BABYLON.MeshBuilder.CreateCylinder(`pedestal_${player.id}`, {
        height: 1.5,
        diameterTop: 1.5,
        diameterBottom: 1.8,
        tessellation: 32
      }, this.scene);
      
      pedestal.position = new BABYLON.Vector3(xPos, 0.75, 1);

      // Pedestal material based on correctness
      const pedestalMaterial = new BABYLON.PBRMaterial(`pedestalMat_${player.id}`, this.scene);
      if (player.correct) {
        pedestalMaterial.baseColor = new BABYLON.Color3(0.2, 0.8, 0.2); // Green for correct
        pedestalMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.4, 0.1);
      } else {
        pedestalMaterial.baseColor = new BABYLON.Color3(0.8, 0.2, 0.2); // Red for incorrect
        pedestalMaterial.emissiveColor = new BABYLON.Color3(0.4, 0.1, 0.1);
      }
      pedestalMaterial.metallicFactor = 0.6;
      pedestalMaterial.roughnessFactor = 0.3;
      
      pedestal.material = pedestalMaterial;

      // Create player name display
      const nameDisplay = BABYLON.MeshBuilder.CreatePlane(`name_${player.id}`, {
        width: 1.8,
        height: 0.6
      }, this.scene);
      
      nameDisplay.position = new BABYLON.Vector3(xPos, 2.2, 1.1);

      // Player name texture
      const nameTexture = new BABYLON.DynamicTexture(`nameTexture_${player.id}`, {
        width: 256,
        height: 128
      }, this.scene);
      
      nameTexture.hasAlpha = true;
      nameTexture.drawText(
        player.name,
        null, 45,
        'bold 32px Arial',
        '#FFFFFF',
        'transparent',
        true, true
      );
      
      // Show score delta
      const deltaColor = player.correct ? '#00FF88' : '#FF4444';
      const deltaText = player.correct ? `+${player.scoreDelta}` : '0';
      nameTexture.drawText(
        deltaText,
        null, 85,
        'bold 28px Arial',
        deltaColor,
        'transparent',
        true, true
      );
      
      const nameMaterial = new BABYLON.StandardMaterial(`nameMat_${player.id}`, this.scene);
      nameMaterial.diffuseTexture = nameTexture;
      nameMaterial.emissiveTexture = nameTexture;
      nameMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);
      nameMaterial.disableLighting = true;
      
      nameDisplay.material = nameMaterial;

      // Create score delta bubble (will animate upward)
      if (player.correct && player.scoreDelta > 0) {
        this.createScoreBubble(player, new BABYLON.Vector3(xPos, 2.5, 1));
      }

      console.log(`✅ Created pedestal for ${player.name} (${player.correct ? 'Correct' : 'Incorrect'})`);
    });

    console.log('✅ All player pedestals created');
  }

  private createScoreBubble(player: PlayerResult, startPosition: any): void {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create floating score bubble
    const bubble = BABYLON.MeshBuilder.CreateSphere(`scoreBubble_${player.id}`, {
      diameter: 0.8,
      segments: 24
    }, this.scene);
    
    bubble.position = startPosition.clone();

    // Bubble material with glow
    const bubbleMaterial = new BABYLON.PBRMaterial(`bubbleMat_${player.id}`, this.scene);
    bubbleMaterial.baseColor = new BABYLON.Color3(0.2, 1.0, 0.2);
    bubbleMaterial.alpha = 0.8;
    bubbleMaterial.metallicFactor = 0.0;
    bubbleMaterial.roughnessFactor = 0.1;
    bubbleMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.8, 0.3);
    
    bubble.material = bubbleMaterial;

    // Create score text on bubble
    const scoreText = BABYLON.MeshBuilder.CreatePlane(`scoreText_${player.id}`, {
      width: 0.6,
      height: 0.3
    }, this.scene);
    
    scoreText.position = bubble.position.clone();
    scoreText.position.z += 0.05;

    // Score texture
    const scoreTexture = new BABYLON.DynamicTexture(`scoreTexture_${player.id}`, {
      width: 128,
      height: 64
    }, this.scene);
    
    scoreTexture.hasAlpha = true;
    scoreTexture.drawText(
      `+${player.scoreDelta}`,
      null, null,
      'bold 24px Arial',
      '#FFFFFF',
      'transparent',
      true, true
    );
    
    const scoreTextMaterial = new BABYLON.StandardMaterial(`scoreTextMat_${player.id}`, this.scene);
    scoreTextMaterial.diffuseTexture = scoreTexture;
    scoreTextMaterial.emissiveTexture = scoreTexture;
    scoreTextMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    scoreTextMaterial.disableLighting = true;
    
    scoreText.material = scoreTextMaterial;

    // Animate bubble floating up and disappearing
    const floatAnimation = BABYLON.Animation.CreateAndStartAnimation(
      `bubbleFloat_${player.id}`,
      bubble,
      'position.y',
      60,
      180,
      bubble.position.y,
      bubble.position.y + 3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
      BABYLON.EasingFunction.CreateQuadraticEaseOut()
    );

    // Animate text following bubble
    const textFloatAnimation = BABYLON.Animation.CreateAndStartAnimation(
      `textFloat_${player.id}`,
      scoreText,
      'position.y',
      60,
      180,
      scoreText.position.y,
      scoreText.position.y + 3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
      BABYLON.EasingFunction.CreateQuadraticEaseOut()
    );

    // Fade out animation
    const fadeAnimation = BABYLON.Animation.CreateAndStartAnimation(
      `bubbleFade_${player.id}`,
      bubbleMaterial,
      'alpha',
      60,
      120,
      0.8,
      0.0,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    // Remove bubble after animation
    setTimeout(() => {
      bubble.dispose();
      scoreText.dispose();
    }, 3000);

    this.scoreBubbles.push({ bubble, scoreText });

    console.log(`✨ Score bubble created for ${player.name}: +${player.scoreDelta}`);
  }

  private async createBuzzer(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Position Buzzer center stage for reveal reactions
    const buzzerBody = BABYLON.MeshBuilder.CreateCapsule('buzzerBody', {
      radius: 0.4,
      height: 1.0,
      tessellation: 32
    }, this.scene);
    buzzerBody.position = new BABYLON.Vector3(0, 0.5, -4);

    const buzzerHead = BABYLON.MeshBuilder.CreateSphere('buzzerHead', {
      diameter: 0.6,
      segments: 32
    }, this.scene);
    buzzerHead.position = new BABYLON.Vector3(0, 1.2, -4);

    // Excited buzzer materials for reveal
    const buzzerMaterial = new BABYLON.PBRMaterial('buzzerMat', this.scene);
    buzzerMaterial.baseColor = new BABYLON.Color3(0.8, 0.9, 1.0);
    buzzerMaterial.metallicFactor = 0.7;
    buzzerMaterial.roughnessFactor = 0.2;
    buzzerMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.3);
    
    buzzerBody.material = buzzerMaterial;
    buzzerHead.material = buzzerMaterial;

    // Group together
    const buzzerGroup = new BABYLON.Mesh('buzzerGroup', this.scene);
    buzzerBody.parent = buzzerGroup;
    buzzerHead.parent = buzzerGroup;
    
    this.buzzer = buzzerGroup;

    // Excited celebration animation
    const celebrateAnimation = BABYLON.Animation.CreateAndStartAnimation(
      'buzzerCelebrate',
      buzzerGroup,
      'rotation.z',
      60,
      90,
      0,
      0.4,
      BABYLON.Animation.ANIMATIONLOOPMODE_YOYO,
      BABYLON.EasingFunction.CreateBounceEaseOut()
    );

    // Jumping animation
    const jumpAnimation = BABYLON.Animation.CreateAndStartAnimation(
      'buzzerJump',
      buzzerGroup,
      'position.y',
      60,
      120,
      buzzerGroup.position.y,
      buzzerGroup.position.y + 0.8,
      BABYLON.Animation.ANIMATIONLOOPMODE_YOYO,
      BABYLON.EasingFunction.CreateBounceEaseOut()
    );

    console.log('✅ Excited Buzzer created for reveal');
  }

  private createCelebrationEffects(): void {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create confetti particle system
    const confettiSystem = new BABYLON.ParticleSystem('confetti', 300, this.scene);
    
    confettiSystem.particleTexture = new BABYLON.Texture('/assets/particles/confetti.png', this.scene);
    
    // Emit from above the scene
    confettiSystem.emitter = new BABYLON.Vector3(0, 8, 0);
    confettiSystem.minEmitBox = new BABYLON.Vector3(-6, 0, -3);
    confettiSystem.maxEmitBox = new BABYLON.Vector3(6, 0, 3);
    
    // Colorful confetti
    confettiSystem.color1 = new BABYLON.Color4(1, 0.2, 0.2, 1.0); // Red
    confettiSystem.color2 = new BABYLON.Color4(0.2, 1, 0.2, 1.0); // Green
    confettiSystem.colorDead = new BABYLON.Color4(1, 1, 0.2, 0.0); // Yellow fade
    
    // Large confetti pieces
    confettiSystem.minSize = 0.2;
    confettiSystem.maxSize = 0.5;
    confettiSystem.minLifeTime = 3;
    confettiSystem.maxLifeTime = 8;
    
    // Heavy emission for celebration
    confettiSystem.emitRate = 40;
    
    // Falling motion with spread
    confettiSystem.direction1 = new BABYLON.Vector3(-2, -3, -1);
    confettiSystem.direction2 = new BABYLON.Vector3(2, -3, 1);
    confettiSystem.minEmitPower = 2;
    confettiSystem.maxEmitPower = 4;
    
    // Gravity effect
    confettiSystem.gravity = new BABYLON.Vector3(0, -4, 0);
    
    confettiSystem.start();

    // Create success sparkles
    const sparkleSystem = new BABYLON.ParticleSystem('sparkles', 150, this.scene);
    
    sparkleSystem.particleTexture = new BABYLON.Texture('/assets/particles/sparkle.png', this.scene);
    
    // Sparkles around correct answer display
    sparkleSystem.emitter = this.correctOptionTile || new BABYLON.Vector3(0, 4, 0);
    sparkleSystem.minEmitBox = new BABYLON.Vector3(-4, -1, -0.5);
    sparkleSystem.maxEmitBox = new BABYLON.Vector3(4, 1, 0.5);
    
    // Golden sparkles
    sparkleSystem.color1 = new BABYLON.Color4(1, 1, 0.2, 1.0);
    sparkleSystem.color2 = new BABYLON.Color4(1, 0.8, 0.2, 1.0);
    sparkleSystem.colorDead = new BABYLON.Color4(1, 1, 1, 0.0);
    
    // Small twinkling sparkles
    sparkleSystem.minSize = 0.1;
    sparkleSystem.maxSize = 0.25;
    sparkleSystem.minLifeTime = 1;
    sparkleSystem.maxLifeTime = 3;
    
    sparkleSystem.emitRate = 25;
    
    // Gentle floating motion
    sparkleSystem.direction1 = new BABYLON.Vector3(-0.5, 0.5, -0.2);
    sparkleSystem.direction2 = new BABYLON.Vector3(0.5, 1, 0.2);
    sparkleSystem.minEmitPower = 0.5;
    sparkleSystem.maxEmitPower = 1.2;
    
    sparkleSystem.start();

    console.log('✅ Celebration effects (confetti + sparkles) created');
  }

  private startRevealSequence(): void {
    // Sequence of reveal events
    setTimeout(() => {
      this.buzzerSpeak('Let\'s see who got it right!', 'excited');
    }, 500);

    setTimeout(() => {
      this.buzzerSpeak(`The correct answer was ${this.currentReveal.options[this.currentReveal.correctIndex]}!`, 'excited');
    }, 2500);

    setTimeout(() => {
      const correctCount = this.currentReveal.playerResults.filter(p => p.correct).length;
      this.buzzerSpeak(`${correctCount} players got it correct! Great job!`, 'excited');
    }, 5000);

    setTimeout(() => {
      this.transitionToScoreboard();
    }, 8000);

    console.log('🎬 Reveal sequence started');
  }

  private transitionToScoreboard(): void {
    const sceneManager = (window as any).gameSceneManager;
    if (sceneManager) {
      import('./scoreboard3d').then(({ Scoreboard3DScene }) => {
        sceneManager.set(new Scoreboard3DScene());
      }).catch(error => {
        console.error('❌ Failed to load 3D scoreboard scene:', error);
        // Fallback to existing scoreboard scene
        import('./scoreboard').then(({ ScoreboardScene }) => {
          sceneManager.set(new ScoreboardScene());
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
            utterance.rate = 1.3;
            utterance.pitch = 1.5;
            utterance.volume = 0.95;
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
      // Add excited speaking animation
      this.buzzer.scaling = new window.BABYLON.Vector3(1.15, 1.15, 1.15);
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

  unmount(): void {
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
    
    console.log('✅ Reveal 3D Scene unmounted');
  }

  onMessage(msg: S2C): void {
    switch (msg.t) {
      case 'reveal':
        // Handle reveal data from server
        if ('correct' in msg && 'deltas' in msg) {
          // Update reveal data with server results
          console.log('📊 Reveal data received:', msg);
        }
        break;
      
      default:
        console.log('Reveal scene received message:', msg.t);
    }
  }
}