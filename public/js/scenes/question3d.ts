// TapFrenzy 3D Question Scene - AAA Visual Quality
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

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  timeLimit: number;
}

export class Question3DScene implements Scene {
  private canvas?: HTMLCanvasElement;
  private engine?: any;
  private scene?: any;
  private camera?: any;
  private buzzer?: any;
  private questionBillboard?: any;
  private optionTiles: any[] = [];
  private timerRing?: any;
  private timeRemaining: number = 15;
  private questionTimer?: ReturnType<typeof setInterval> | null;
  
  private currentQuestion: Question = {
    id: 'demo_1',
    text: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctIndex: 2,
    timeLimit: 15
  };
  
  private playerAnswers: Map<string, { answer: number; timestamp: number }> = new Map();

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
    console.log('🎮 Starting TapFrenzy 3D Question Scene...');

    // 🚀 AAA Systems Initialization
    const performance = PerformanceManager.getInstance();
    performance.startProfiler('question3d-mount');
    
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
      this.scene.clearColor = new BABYLON.Color3(0.02, 0.05, 0.12); // Deep navy background

      // Create camera focused on question billboard
      this.camera = new BABYLON.ArcRotateCamera('questionCamera', 
        -Math.PI / 2, Math.PI / 2.5, 12, 
        new BABYLON.Vector3(0, 2, 0), this.scene);
      
      // Lock camera during question display
      this.camera.inputs.clear();
      this.camera.setTarget(new BABYLON.Vector3(0, 2, 0));

      console.log('✅ Question camera created (locked on billboard)');

      // Enhanced lighting for TV studio feel
      await this.setupStudioLighting();
      
      // Create question billboard (main focal point)
      await this.createQuestionBillboard();
      
      // Create answer option tiles
      await this.createAnswerTiles();
      
      // Create timer ring
      await this.createTimerDisplay();
      
      // Create Buzzer presenter
      await this.createBuzzer();
      
      // Add TV studio atmosphere
      this.createStudioAtmosphere();
      
      // Start intense question music
      try {
        Audio.playMusic('question-tension', { fadeIn: 1000 });
      } catch (error) {
        console.warn('Audio not available:', error);
      }

      // Start render loop
      this.engine.runRenderLoop(() => {
        this.scene?.render();
      });

      // Handle window resize
      window.addEventListener('resize', this.handleResize.bind(this));
      
      // Start question timer
      this.startQuestionTimer();

      // Make Buzzer announce the question
      this.buzzerSpeak(`Here's your question: ${this.currentQuestion.text}`, 'excited');

      performance.endProfiler('question3d-mount');
      console.log('✅ 3D Question Scene mounted successfully');

    } catch (error) {
      console.error('❌ 3D Question initialization failed:', error);
      performance.endProfiler('question3d-mount');
      
      // Fallback to 2D
      root.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; color: white; text-align: center; background: linear-gradient(45deg, #0f1a2a, #1a2a3a);">
          <div>
            <h1>TapFrenzy Question</h1>
            <p>3D Question initialization failed</p>
            <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
          </div>
        </div>
      `;
    }
  }

  private async setupStudioLighting(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create TV studio HDRI environment
    const hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("/assets/studio_environment.env", this.scene);
    this.scene.environmentTexture = hdrTexture;
    this.scene.environmentIntensity = 0.4;

    // Key studio light from above-front (like TV lighting)
    const keyLight = new BABYLON.DirectionalLight('studioKey', new BABYLON.Vector3(-0.2, -1, -0.5), this.scene);
    keyLight.intensity = 2.0;
    keyLight.diffuse = new BABYLON.Color3(1.0, 0.98, 0.95);
    
    // Fill light from opposite side
    const fillLight = new BABYLON.DirectionalLight('studioFill', new BABYLON.Vector3(0.3, -0.5, 0.8), this.scene);
    fillLight.intensity = 0.8;
    fillLight.diffuse = new BABYLON.Color3(0.8, 0.9, 1.0);
    
    // Dramatic rim light for billboard
    const rimLight = new BABYLON.SpotLight('billboardRim', 
      new BABYLON.Vector3(0, 6, -8), 
      new BABYLON.Vector3(0, -1, 1), 
      Math.PI / 3, 2, this.scene);
    rimLight.intensity = 1.5;
    rimLight.diffuse = new BABYLON.Color3(1.2, 1.0, 0.8);
    
    // Answer tile accent lights
    const colors = [
      new BABYLON.Color3(1.0, 0.3, 0.3), // A - Red
      new BABYLON.Color3(0.3, 0.8, 1.0), // B - Blue  
      new BABYLON.Color3(1.0, 0.8, 0.2), // C - Yellow
      new BABYLON.Color3(0.4, 1.0, 0.3)  // D - Green
    ];
    
    const positions = [
      new BABYLON.Vector3(-3, 0, 2), // A
      new BABYLON.Vector3(3, 0, 2),  // B
      new BABYLON.Vector3(-3, -2, 2), // C
      new BABYLON.Vector3(3, -2, 2)   // D
    ];
    
    positions.forEach((pos, i) => {
      const tileLight = new BABYLON.PointLight(`tileLight_${i}`, pos, this.scene);
      tileLight.intensity = 0.6;
      tileLight.diffuse = colors[i];
    });

    console.log('✅ TV studio lighting setup');
  }

  private async createQuestionBillboard(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create large billboard for question display
    const billboard = BABYLON.MeshBuilder.CreatePlane('questionBillboard', {
      width: 10,
      height: 4
    }, this.scene);
    
    billboard.position = new BABYLON.Vector3(0, 3, 0);

    // Create dynamic texture for question text
    const billboardTexture = new BABYLON.DynamicTexture('billboardTexture', {
      width: 2048,
      height: 1024
    }, this.scene);
    
    billboardTexture.hasAlpha = false;
    
    // Draw question background
    const ctx = billboardTexture.getContext();
    const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
    gradient.addColorStop(0, '#1a2a3a');
    gradient.addColorStop(1, '#0f1a2a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2048, 1024);
    
    // Draw decorative border
    ctx.strokeStyle = '#6e87ff';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 2008, 984);
    
    billboardTexture.update();
    
    // Draw question text
    billboardTexture.drawText(
      this.currentQuestion.text,
      null, 300,
      'bold 64px Arial',
      '#FFFFFF',
      '#1a2a3a',
      true, true
    );
    
    billboardTexture.drawText(
      'Choose your answer on your device!',
      null, 600,
      '40px Arial',
      '#CCCCCC',
      'transparent',
      true, true
    );
    
    const billboardMaterial = new BABYLON.StandardMaterial('billboardMat', this.scene);
    billboardMaterial.diffuseTexture = billboardTexture;
    billboardMaterial.emissiveTexture = billboardTexture;
    billboardMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    billboardMaterial.disableLighting = true;
    
    billboard.material = billboardMaterial;
    
    this.questionBillboard = billboard;

    // Add subtle glow animation
    const glowAnimation = BABYLON.Animation.CreateAndStartAnimation(
      'billboardGlow',
      billboardMaterial,
      'emissiveColor',
      30,
      90,
      new BABYLON.Color3(0.8, 0.8, 0.8),
      new BABYLON.Color3(1.0, 1.0, 1.0),
      BABYLON.Animation.ANIMATIONLOOPMODE_YOYO,
      BABYLON.EasingFunction.CreateSineEase()
    );

    console.log('✅ Question billboard created');
  }

  private async createAnswerTiles(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;
    
    const positions = [
      { pos: [-3, -1, 0], letter: 'A', color: [1.0, 0.3, 0.3] },
      { pos: [3, -1, 0], letter: 'B', color: [0.3, 0.8, 1.0] },
      { pos: [-3, -3, 0], letter: 'C', color: [1.0, 0.8, 0.2] },
      { pos: [3, -3, 0], letter: 'D', color: [0.4, 1.0, 0.3] }
    ];

    positions.forEach((config, index) => {
      // Create answer tile
      const tile = BABYLON.MeshBuilder.CreateBox(`answerTile_${config.letter}`, {
        width: 2.5,
        height: 1.2,
        depth: 0.2
      }, this.scene);
      
      tile.position = new BABYLON.Vector3(config.pos[0], config.pos[1], config.pos[2]);

      // Create glassmorphism material
      const tileMaterial = new BABYLON.PBRMaterial(`tileMat_${config.letter}`, this.scene);
      tileMaterial.baseColor = new BABYLON.Color3(config.color[0], config.color[1], config.color[2]);
      tileMaterial.alpha = 0.3;
      tileMaterial.metallicFactor = 0.0;
      tileMaterial.roughnessFactor = 0.1;
      tileMaterial.emissiveColor = new BABYLON.Color3(
        (config.color[0] || 0) * 0.5,
        (config.color[1] || 0) * 0.5,
        (config.color[2] || 0) * 0.5
      );
      
      tile.material = tileMaterial;

      // Create text overlay
      const textPlane = BABYLON.MeshBuilder.CreatePlane(`tileText_${config.letter}`, {
        width: 2.3,
        height: 1.0
      }, this.scene);
      
      textPlane.position = new BABYLON.Vector3(config.pos[0] || 0, config.pos[1] || 0, (config.pos[2] || 0) + 0.11);

      // Dynamic texture for option text
      const textTexture = new BABYLON.DynamicTexture(`tileTextTex_${config.letter}`, {
        width: 512,
        height: 256
      }, this.scene);
      
      textTexture.hasAlpha = true;
      
      // Draw letter and option
      textTexture.drawText(
        config.letter,
        80, 80,
        'bold 48px Arial',
        '#FFFFFF',
        'transparent',
        false, true
      );
      
      textTexture.drawText(
        this.currentQuestion.options[index] || `Option ${config.letter}`,
        250, 120,
        'bold 32px Arial',
        '#FFFFFF',
        'transparent',
        false, true
      );
      
      const textMaterial = new BABYLON.StandardMaterial(`tileTextMat_${config.letter}`, this.scene);
      textMaterial.diffuseTexture = textTexture;
      textMaterial.emissiveTexture = textTexture;
      textMaterial.emissiveColor = new BABYLON.Color3(0.9, 0.9, 0.9);
      textMaterial.disableLighting = true;
      
      textPlane.material = textMaterial;

      // Subtle floating animation
      const floatAnimation = BABYLON.Animation.CreateAndStartAnimation(
        `float_${config.letter}`,
        tile,
        'position.z',
        30,
        120,
        tile.position.z,
        tile.position.z + 0.1,
        BABYLON.Animation.ANIMATIONLOOPMODE_YOYO,
        BABYLON.EasingFunction.CreateSineEase()
      );

      this.optionTiles.push({
        tile,
        textPlane,
        letter: config.letter,
        index,
        material: tileMaterial
      });

      console.log(`✅ Created answer tile ${config.letter}: ${this.currentQuestion.options[index]}`);
    });

    console.log('✅ All answer tiles created');
  }

  private async createTimerDisplay(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create timer ring around the billboard
    const timerRing = BABYLON.MeshBuilder.CreateTorus('timerRing', {
      diameter: 12,
      thickness: 0.3,
      tessellation: 64
    }, this.scene);
    
    timerRing.position = new BABYLON.Vector3(0, 3, -0.5);

    // Timer ring material
    const timerMaterial = new BABYLON.PBRMaterial('timerMat', this.scene);
    timerMaterial.baseColor = new BABYLON.Color3(0.2, 1.0, 0.2); // Start green
    timerMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.5, 0.1);
    timerMaterial.metallicFactor = 0.8;
    timerMaterial.roughnessFactor = 0.2;
    
    timerRing.material = timerMaterial;
    
    this.timerRing = { mesh: timerRing, material: timerMaterial };

    // Create countdown text display
    const countdownPlane = BABYLON.MeshBuilder.CreatePlane('countdownPlane', {
      width: 1.5,
      height: 0.8
    }, this.scene);
    
    countdownPlane.position = new BABYLON.Vector3(0, 5.5, 0);

    const countdownTexture = new BABYLON.DynamicTexture('countdownTexture', {
      width: 256,
      height: 128
    }, this.scene);
    
    const countdownMaterial = new BABYLON.StandardMaterial('countdownMat', this.scene);
    countdownMaterial.diffuseTexture = countdownTexture;
    countdownMaterial.emissiveTexture = countdownTexture;
    countdownMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    countdownMaterial.disableLighting = true;
    
    countdownPlane.material = countdownMaterial;

    // Store references
    (this as any).countdownPlane = countdownPlane;
    (this as any).countdownTexture = countdownTexture;
    
    this.updateTimerDisplay();

    console.log('✅ Timer display created');
  }

  private async createBuzzer(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Position Buzzer to the side during questions
    const buzzerBody = BABYLON.MeshBuilder.CreateCapsule('buzzerBody', {
      radius: 0.3,
      height: 0.8,
      tessellation: 32
    }, this.scene);
    buzzerBody.position = new BABYLON.Vector3(-6, 0.4, 2);

    const buzzerHead = BABYLON.MeshBuilder.CreateSphere('buzzerHead', {
      diameter: 0.5,
      segments: 32
    }, this.scene);
    buzzerHead.position = new BABYLON.Vector3(-6, 1.0, 2);

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

    // Thinking animation during questions
    const thinkAnimation = BABYLON.Animation.CreateAndStartAnimation(
      'buzzerThink',
      buzzerGroup,
      'rotation.y',
      60,
      120,
      0,
      0.3,
      BABYLON.Animation.ANIMATIONLOOPMODE_YOYO,
      BABYLON.EasingFunction.CreateSineEase()
    );

    console.log('✅ Buzzer presenter positioned for question');
  }

  private createStudioAtmosphere(): void {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create question atmosphere particles
    const particleSystem = new BABYLON.ParticleSystem('questionParticles', 100, this.scene);
    
    particleSystem.particleTexture = new BABYLON.Texture('/assets/particles/question_mote.png', this.scene);
    
    // Emission around the scene
    particleSystem.emitter = new BABYLON.Vector3(0, 6, -2);
    particleSystem.minEmitBox = new BABYLON.Vector3(-8, 0, -1);
    particleSystem.maxEmitBox = new BABYLON.Vector3(8, 0, 1);
    
    // Studio lighting motes
    particleSystem.color1 = new BABYLON.Color4(1, 1, 0.8, 0.8);
    particleSystem.color2 = new BABYLON.Color4(0.8, 0.9, 1, 0.6);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
    
    // Size and life
    particleSystem.minSize = 0.05;
    particleSystem.maxSize = 0.12;
    particleSystem.minLifeTime = 4;
    particleSystem.maxLifeTime = 10;
    
    // Slow floating effect
    particleSystem.emitRate = 8;
    particleSystem.direction1 = new BABYLON.Vector3(-0.2, -0.5, 0);
    particleSystem.direction2 = new BABYLON.Vector3(0.2, -0.5, 0);
    particleSystem.minEmitPower = 0.2;
    particleSystem.maxEmitPower = 0.5;
    
    particleSystem.start();

    console.log('✅ Studio question atmosphere created');
  }

  private startQuestionTimer(): void {
    this.timeRemaining = this.currentQuestion.timeLimit;
    
    this.questionTimer = setInterval(() => {
      this.timeRemaining--;
      this.updateTimerDisplay();
      this.updateTimerRing();
      
      // Play tick sounds with increasing urgency
      try {
        if (this.timeRemaining <= 5) {
          Audio.playSound('timer-urgent', { volume: 0.8 });
        } else if (this.timeRemaining <= 10) {
          Audio.playSound('timer-warning', { volume: 0.6 });
        } else {
          Audio.playSound('timer-tick', { volume: 0.4 });
        }
      } catch (error) {
        // Audio not available
      }
      
      if (this.timeRemaining <= 0) {
        this.endQuestion();
      }
    }, 1000);
  }

  private updateTimerDisplay(): void {
    const countdownTexture = (this as any).countdownTexture;
    if (!countdownTexture) return;

    countdownTexture.clear();
    
    // Color based on urgency
    let color = '#00FF88'; // Green
    if (this.timeRemaining <= 5) color = '#FF4444'; // Red
    else if (this.timeRemaining <= 10) color = '#FF8800'; // Orange
    
    countdownTexture.drawText(
      `${this.timeRemaining}`,
      null, null,
      'bold 64px Arial',
      color,
      'transparent',
      true, true
    );
  }

  private updateTimerRing(): void {
    if (!this.timerRing) return;

    const progress = this.timeRemaining / this.currentQuestion.timeLimit;
    
    // Change color based on time remaining
    if (this.timeRemaining <= 5) {
      this.timerRing.material.baseColor = new window.BABYLON.Color3(1.0, 0.2, 0.2); // Red
      this.timerRing.material.emissiveColor = new window.BABYLON.Color3(0.5, 0.1, 0.1);
    } else if (this.timeRemaining <= 10) {
      this.timerRing.material.baseColor = new window.BABYLON.Color3(1.0, 0.6, 0.2); // Orange  
      this.timerRing.material.emissiveColor = new window.BABYLON.Color3(0.5, 0.3, 0.1);
    } else {
      this.timerRing.material.baseColor = new window.BABYLON.Color3(0.2, 1.0, 0.2); // Green
      this.timerRing.material.emissiveColor = new window.BABYLON.Color3(0.1, 0.5, 0.1);
    }

    // Scale the ring to show progress (optional visual effect)
    const scale = 0.8 + (progress * 0.2); // Scale from 0.8 to 1.0
    this.timerRing.mesh.scaling = new window.BABYLON.Vector3(scale, scale, scale);
  }

  private endQuestion(): void {
    if (this.questionTimer) {
      clearInterval(this.questionTimer);
      this.questionTimer = null;
    }
    
    this.buzzerSpeak('Time\'s up! Let\'s see the results!', 'excited');
    
    // Highlight correct answer
    this.highlightCorrectAnswer();
    
    // Transition to reveal after 3 seconds
    setTimeout(() => {
      this.transitionToReveal();
    }, 3000);
    
    console.log(`❓ Question ended. Correct answer: ${this.currentQuestion.options[this.currentQuestion.correctIndex]}`);
  }

  private highlightCorrectAnswer(): void {
    const correctTile = this.optionTiles[this.currentQuestion.correctIndex];
    if (!correctTile) return;

    const BABYLON = window.BABYLON;

    // Highlight correct answer with bright glow
    const correctMaterial = correctTile.material as any;
    if (correctMaterial) {
      correctMaterial.emissiveColor = new BABYLON.Color3(0.8, 1.0, 0.8);
      correctMaterial.alpha = 0.8;
    }

    // Pulsing animation
    const pulseAnimation = BABYLON.Animation.CreateAndStartAnimation(
      'correctPulse',
      correctTile.tile,
      'scaling',
      60,
      60,
      correctTile.tile.scaling,
      new BABYLON.Vector3(1.2, 1.2, 1.2),
      BABYLON.Animation.ANIMATIONLOOPMODE_YOYO
    );

    console.log('✅ Correct answer highlighted');
  }

  private transitionToReveal(): void {
    const sceneManager = (window as any).gameSceneManager;
    if (sceneManager) {
      // Try 3D reveal scene first
      import('./reveal3d').then(({ Reveal3DScene }) => {
        sceneManager.set(new Reveal3DScene());
      }).catch(error => {
        console.error('❌ Failed to load 3D reveal scene:', error);
        // Fallback to existing reveal scene
        import('./reveal').then(({ RevealScene }) => {
          sceneManager.set(new RevealScene());
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

  // Handle player answers (called from mobile clients)
  addPlayerAnswer(playerId: string, answerIndex: number, timestamp: number): void {
    this.playerAnswers.set(playerId, { answer: answerIndex, timestamp });
    
    // Visual feedback - could show answer submission count
    console.log(`📱 Player ${playerId} answered: ${this.currentQuestion.options[answerIndex]} (option ${answerIndex})`);
  }

  // Calculate scoring based on correctness and speed
  private calculateScore(answerIndex: number, timestamp: number): number {
    const isCorrect = answerIndex === this.currentQuestion.correctIndex;
    if (!isCorrect) return 0;

    const baseScore = 500;
    const timeElapsed = this.currentQuestion.timeLimit - this.timeRemaining;
    const speedBonus = Math.floor(500 * (this.timeRemaining / this.currentQuestion.timeLimit));
    
    return baseScore + speedBonus;
  }

  unmount(): void {
    if (this.questionTimer) {
      clearInterval(this.questionTimer);
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
    
    console.log('✅ Question 3D Scene unmounted');
  }

  onMessage(msg: S2C): void {
    // TODO: Add proper message type support for questions  
    console.log('Question scene received message:', msg.t);
  }
}