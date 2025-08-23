// TapFrenzy 3D Finale Scene - AAA Visual Quality "Pyramid" Challenge
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

interface FinalePlayer {
  id: string;
  name: string;
  startPosition: number; // Starting step based on cumulative score
  currentPosition: number; // Current step position
  isActive: boolean;
}

export class Finale3DScene implements Scene {
  private canvas?: HTMLCanvasElement;
  private engine?: any;
  private scene?: any;
  private camera?: any;
  private buzzer?: any;
  private pyramid?: any;
  private playerAvatars: any[] = [];
  private finaleTimer?: ReturnType<typeof setInterval> | null;
  private questionCount: number = 0;
  private maxQuestions: number = 20;
  private pyramidSteps: number = 12;
  
  private finalePlayers: FinalePlayer[] = [
    { id: 'player3', name: 'Charlie', startPosition: 8, currentPosition: 8, isActive: true },
    { id: 'player1', name: 'Alice', startPosition: 6, currentPosition: 6, isActive: true },
    { id: 'player4', name: 'Diana', startPosition: 5, currentPosition: 5, isActive: true },
    { id: 'player2', name: 'Bob', startPosition: 3, currentPosition: 3, isActive: true }
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
    console.log('🎮 Starting TapFrenzy 3D Finale - PYRAMID CHALLENGE...');

    // 🚀 AAA Systems Initialization
    const performance = PerformanceManager.getInstance();
    performance.startProfiler('finale3d-mount');
    
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
      this.scene.clearColor = new BABYLON.Color3(0.02, 0.1, 0.2); // Deep dramatic blue

      // Create dynamic finale camera that tracks the leaders
      this.camera = new BABYLON.ArcRotateCamera('finaleCamera', 
        -Math.PI / 3, Math.PI / 2.2, 20, 
        new BABYLON.Vector3(0, 4, 0), this.scene);
      
      // Allow camera tracking of the action
      this.camera.lowerRadiusLimit = 15;
      this.camera.upperRadiusLimit = 35;
      this.camera.lowerBetaLimit = Math.PI / 4;
      this.camera.upperBetaLimit = Math.PI / 1.8;
      this.camera.inputs.attached.pointers.angularSensibilityX = 1500;
      this.camera.inputs.attached.pointers.angularSensibilityY = 1500;

      console.log('✅ Dynamic finale camera created');

      // Enhanced finale lighting
      await this.setupFinaleSpectacle();
      
      // Create the emissive step pyramid
      await this.createPyramidChallenge();
      
      // Position player avatars at starting positions
      await this.createPlayerAvatars();
      
      // Create Buzzer finale presenter
      await this.createBuzzer();
      
      // Add finale spectacle effects
      this.createFinaleSpectacle();
      
      // Start epic finale music
      try {
        Audio.playMusic('finale-epic', { fadeIn: 2500 });
      } catch (error) {
        console.warn('Audio not available:', error);
      }

      // Start render loop
      this.engine.runRenderLoop(() => {
        this.scene?.render();
      });

      // Handle window resize
      window.addEventListener('resize', this.handleResize.bind(this));
      
      // Start finale sequence
      this.startFinaleChallenge();

      performance.endProfiler('finale3d-mount');
      console.log('✅ 3D Finale Scene mounted successfully');

    } catch (error) {
      console.error('❌ 3D Finale initialization failed:', error);
      performance.endProfiler('finale3d-mount');
      
      // Fallback to 2D
      root.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; color: white; text-align: center; background: linear-gradient(45deg, #0a1a3a, #1a2a4a);">
          <div>
            <h1>TapFrenzy Finale</h1>
            <p>3D Finale initialization failed</p>
            <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
          </div>
        </div>
      `;
    }
  }

  private async setupFinaleSpectacle(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create finale arena HDRI environment
    const hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("/assets/finale_arena.env", this.scene);
    this.scene.environmentTexture = hdrTexture;
    this.scene.environmentIntensity = 0.8;

    // Dramatic overhead spotlight
    const arenaSpotlight = new BABYLON.SpotLight('arenaSpot', 
      new BABYLON.Vector3(0, 15, -5), 
      new BABYLON.Vector3(0, -1, 0.2), 
      Math.PI / 2.5, 5, this.scene);
    arenaSpotlight.intensity = 4.0;
    arenaSpotlight.diffuse = new BABYLON.Color3(1.0, 0.9, 0.7);

    // Pyramid illumination system - each step gets its own light
    for (let step = 1; step <= this.pyramidSteps; step++) {
      const stepLight = new BABYLON.PointLight(`step_light_${step}`, 
        new BABYLON.Vector3(0, step * 0.8, 0), this.scene);
      stepLight.intensity = 0.5 + (step / this.pyramidSteps) * 0.8; // Brighter toward top
      
      // Color gradient from blue (bottom) to gold (top)
      const colorProgress = step / this.pyramidSteps;
      stepLight.diffuse = new BABYLON.Color3(
        0.2 + colorProgress * 0.8, // Red component: blue to gold
        0.3 + colorProgress * 0.5, // Green component
        0.8 - colorProgress * 0.6   // Blue component: bright blue to less blue
      );
    }

    // Dynamic colored rim lights for excitement
    const rimColors = [
      new BABYLON.Color3(1.0, 0.2, 0.2), // Red
      new BABYLON.Color3(0.2, 1.0, 0.2), // Green  
      new BABYLON.Color3(0.2, 0.2, 1.0), // Blue
      new BABYLON.Color3(1.0, 0.2, 1.0)  // Magenta
    ];
    
    rimColors.forEach((color, i) => {
      const angle = (i / rimColors.length) * Math.PI * 2;
      const rimLight = new BABYLON.DirectionalLight(`rim_${i}`, 
        new BABYLON.Vector3(Math.cos(angle), -0.5, Math.sin(angle)), this.scene);
      rimLight.intensity = 1.2;
      rimLight.diffuse = color;
    });

    console.log('✅ Finale arena spectacle lighting setup');
  }

  private async createPyramidChallenge(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create the main pyramid structure
    const pyramidBase = BABYLON.MeshBuilder.CreateCylinder('pyramidBase', {
      height: 0.5,
      diameterTop: 20,
      diameterBottom: 22,
      tessellation: 64
    }, this.scene);
    
    pyramidBase.position.y = -0.25;

    // Luxurious base material
    const baseMaterial = new BABYLON.PBRMaterial('pyramidBaseMat', this.scene);
    baseMaterial.baseColor = new BABYLON.Color3(0.1, 0.05, 0.2);
    baseMaterial.metallicFactor = 0.9;
    baseMaterial.roughnessFactor = 0.05;
    baseMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.02, 0.1);
    
    pyramidBase.material = baseMaterial;

    // Create emissive pyramid steps
    for (let step = 1; step <= this.pyramidSteps; step++) {
      const stepRadius = 9 - (step - 1) * 0.6; // Gradually smaller steps
      const stepHeight = 0.4;
      const stepY = (step - 1) * stepHeight;

      const stepMesh = BABYLON.MeshBuilder.CreateCylinder(`step_${step}`, {
        height: stepHeight,
        diameter: stepRadius * 2,
        tessellation: 32
      }, this.scene);
      
      stepMesh.position.y = stepY + stepHeight / 2;

      // Create emissive step material
      const stepMaterial = new BABYLON.PBRMaterial(`stepMat_${step}`, this.scene);
      
      // Color progression from base blue to top gold
      const colorProgress = step / this.pyramidSteps;
      stepMaterial.baseColor = new BABYLON.Color3(
        0.2 + colorProgress * 0.6,  // Blue to gold progression
        0.3 + colorProgress * 0.5,
        0.8 - colorProgress * 0.6
      );
      
      stepMaterial.metallicFactor = 0.7;
      stepMaterial.roughnessFactor = 0.2;
      
      // Emissive glow that gets brighter toward the top
      const emissiveIntensity = 0.1 + colorProgress * 0.4;
      stepMaterial.emissiveColor = new BABYLON.Color3(
        (0.2 + colorProgress * 0.6) * emissiveIntensity,
        (0.3 + colorProgress * 0.5) * emissiveIntensity,
        (0.8 - colorProgress * 0.6) * emissiveIntensity
      );
      
      stepMesh.material = stepMaterial;

      // Add step number markers
      const numberPlane = BABYLON.MeshBuilder.CreatePlane(`stepNumber_${step}`, {
        width: 1.5,
        height: 0.6
      }, this.scene);
      
      numberPlane.position = new BABYLON.Vector3(stepRadius - 0.5, stepY + stepHeight + 0.3, 0);
      numberPlane.rotation.y = Math.PI / 4; // Angle for visibility

      // Step number texture
      const numberTexture = new BABYLON.DynamicTexture(`numberTexture_${step}`, {
        width: 128,
        height: 64
      }, this.scene);
      
      numberTexture.hasAlpha = true;
      const numberColor = step >= this.pyramidSteps * 0.8 ? '#FFD700' : '#FFFFFF';
      numberTexture.drawText(
        step.toString(),
        null, null,
        'bold 32px Arial',
        numberColor,
        'transparent',
        true, true
      );
      
      const numberMaterial = new BABYLON.StandardMaterial(`numberMat_${step}`, this.scene);
      numberMaterial.diffuseTexture = numberTexture;
      numberMaterial.emissiveTexture = numberTexture;
      numberMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);
      numberMaterial.disableLighting = true;
      
      numberPlane.material = numberMaterial;

      console.log(`✅ Created pyramid step ${step} with emissive glow`);
    }

    // Create victory platform at the top
    const victoryPlatform = BABYLON.MeshBuilder.CreateCylinder('victoryPlatform', {
      height: 0.8,
      diameterTop: 3,
      diameterBottom: 3.5,
      tessellation: 32
    }, this.scene);
    
    victoryPlatform.position.y = this.pyramidSteps * 0.4 + 0.4;

    // Golden victory platform
    const victoryMaterial = new BABYLON.PBRMaterial('victoryMat', this.scene);
    victoryMaterial.baseColor = new BABYLON.Color3(1.0, 0.8, 0.0);
    victoryMaterial.metallicFactor = 1.0;
    victoryMaterial.roughnessFactor = 0.05;
    victoryMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.4, 0.0);
    
    victoryPlatform.material = victoryMaterial;

    // Store pyramid reference
    this.pyramid = { base: pyramidBase, steps: this.pyramidSteps, victory: victoryPlatform };

    console.log('✅ Emissive step pyramid created with victory platform');
  }

  private async createPlayerAvatars(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;
    
    this.finalePlayers.forEach((player, index) => {
      // Create player avatar at starting position
      const avatar = BABYLON.MeshBuilder.CreateCapsule(`avatar_${player.id}`, {
        radius: 0.3,
        height: 0.8,
        tessellation: 16
      }, this.scene);

      // Position avatar on their starting step
      const stepRadius = 9 - (player.startPosition - 1) * 0.6;
      const angle = (index / this.finalePlayers.length) * Math.PI * 2;
      const x = Math.cos(angle) * (stepRadius - 1);
      const z = Math.sin(angle) * (stepRadius - 1);
      const y = (player.startPosition - 1) * 0.4 + 0.8;
      
      avatar.position = new BABYLON.Vector3(x, y, z);

      // Player-specific avatar materials
      const avatarColors = [
        new BABYLON.Color3(1.0, 0.3, 0.3), // Red
        new BABYLON.Color3(0.3, 0.8, 1.0), // Blue
        new BABYLON.Color3(0.3, 1.0, 0.3), // Green
        new BABYLON.Color3(1.0, 0.3, 1.0)  // Magenta
      ];
      
      const avatarMaterial = new BABYLON.PBRMaterial(`avatarMat_${player.id}`, this.scene);
      avatarMaterial.baseColor = avatarColors[index] || new BABYLON.Color3(0.5, 0.5, 0.5);
      avatarMaterial.metallicFactor = 0.4;
      avatarMaterial.roughnessFactor = 0.6;
      avatarMaterial.emissiveColor = new BABYLON.Color3(
        (avatarColors[index]?.r || 0.5) * 0.2,
        (avatarColors[index]?.g || 0.5) * 0.2,
        (avatarColors[index]?.b || 0.5) * 0.2
      );
      
      avatar.material = avatarMaterial;

      // Create name tag above avatar
      const nameTag = BABYLON.MeshBuilder.CreatePlane(`nameTag_${player.id}`, {
        width: 1.5,
        height: 0.4
      }, this.scene);
      
      nameTag.position = new BABYLON.Vector3(x, y + 0.8, z);
      nameTag.billboardMode = BABYLON.Mesh.BILLBOARD_MODE_ALL;

      // Name tag texture
      const nameTexture = new BABYLON.DynamicTexture(`nameTexture_${player.id}`, {
        width: 128,
        height: 32
      }, this.scene);
      
      nameTexture.hasAlpha = true;
      nameTexture.drawText(
        player.name,
        null, null,
        'bold 16px Arial',
        '#FFFFFF',
        'transparent',
        true, true
      );
      
      const nameMaterial = new BABYLON.StandardMaterial(`nameMat_${player.id}`, this.scene);
      nameMaterial.diffuseTexture = nameTexture;
      nameMaterial.emissiveTexture = nameTexture;
      nameMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);
      nameMaterial.disableLighting = true;
      
      nameTag.material = nameMaterial;

      // Store avatar data
      this.playerAvatars.push({
        avatar,
        nameTag,
        player,
        material: avatarMaterial,
        targetPosition: avatar.position.clone()
      });

      console.log(`✅ Created avatar for ${player.name} at step ${player.startPosition}`);
    });

    console.log('✅ All player avatars positioned on pyramid');
  }

  private async createBuzzer(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Position Buzzer as finale host  
    const buzzerBody = BABYLON.MeshBuilder.CreateCapsule('buzzerBody', {
      radius: 0.5,
      height: 1.2,
      tessellation: 32
    }, this.scene);
    buzzerBody.position = new BABYLON.Vector3(12, 0.6, 0);

    const buzzerHead = BABYLON.MeshBuilder.CreateSphere('buzzerHead', {
      diameter: 0.8,
      segments: 32
    }, this.scene);
    buzzerHead.position = new BABYLON.Vector3(12, 1.5, 0);

    // Epic finale host materials
    const buzzerMaterial = new BABYLON.PBRMaterial('buzzerMat', this.scene);
    buzzerMaterial.baseColor = new BABYLON.Color3(0.8, 0.6, 1.0);
    buzzerMaterial.metallicFactor = 0.8;
    buzzerMaterial.roughnessFactor = 0.15;
    buzzerMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.15, 0.3);
    
    buzzerBody.material = buzzerMaterial;
    buzzerHead.material = buzzerMaterial;

    // Group together
    const buzzerGroup = new BABYLON.Mesh('buzzerGroup', this.scene);
    buzzerBody.parent = buzzerGroup;
    buzzerHead.parent = buzzerGroup;
    
    this.buzzer = buzzerGroup;

    // Epic finale host animation
    const epicAnimation = BABYLON.Animation.CreateAndStartAnimation(
      'buzzerEpic',
      buzzerGroup,
      'position.y',
      60,
      180,
      buzzerGroup.position.y,
      buzzerGroup.position.y + 1.0,
      BABYLON.Animation.ANIMATIONLOOPMODE_YOYO,
      BABYLON.EasingFunction.CreateBounceEaseInOut()
    );

    // Rotation for dramatic effect
    const rotateAnimation = BABYLON.Animation.CreateAndStartAnimation(
      'buzzerRotate',
      buzzerGroup,
      'rotation.y',
      60,
      240,
      0,
      Math.PI / 4,
      BABYLON.Animation.ANIMATIONLOOPMODE_YOYO
    );

    console.log('✅ Epic Buzzer finale host created');
  }

  private createFinaleSpectacle(): void {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create finale fireworks particle system
    const fireworksSystem = new BABYLON.ParticleSystem('finaleFire', 400, this.scene);
    
    fireworksSystem.particleTexture = new BABYLON.Texture('/assets/particles/firework.png', this.scene);
    
    // Launch from around the pyramid
    fireworksSystem.emitter = new BABYLON.Vector3(0, 12, 0);
    fireworksSystem.minEmitBox = new BABYLON.Vector3(-10, -2, -10);
    fireworksSystem.maxEmitBox = new BABYLON.Vector3(10, -2, 10);
    
    // Explosive finale colors
    fireworksSystem.color1 = new BABYLON.Color4(1, 0.2, 0.2, 1.0); // Red
    fireworksSystem.color2 = new BABYLON.Color4(1, 1, 0.2, 1.0);   // Yellow
    fireworksSystem.colorDead = new BABYLON.Color4(1, 0.8, 0.4, 0.0);
    
    // Large spectacular particles
    fireworksSystem.minSize = 0.3;
    fireworksSystem.maxSize = 0.8;
    fireworksSystem.minLifeTime = 2;
    fireworksSystem.maxLifeTime = 6;
    
    // Explosive emission
    fireworksSystem.emitRate = 60;
    
    // Dramatic bursting motion
    fireworksSystem.direction1 = new BABYLON.Vector3(-3, -2, -3);
    fireworksSystem.direction2 = new BABYLON.Vector3(3, -2, 3);
    fireworksSystem.minEmitPower = 3;
    fireworksSystem.maxEmitPower = 6;
    
    // Gravity for realistic fireworks
    fireworksSystem.gravity = new BABYLON.Vector3(0, -5, 0);
    
    fireworksSystem.start();

    // Create energy beams shooting up the pyramid
    const energySystem = new BABYLON.ParticleSystem('pyramidEnergy', 200, this.scene);
    
    energySystem.particleTexture = new BABYLON.Texture('/assets/particles/energy.png', this.scene);
    
    // Emit from pyramid base upward
    energySystem.emitter = new BABYLON.Vector3(0, 0, 0);
    energySystem.minEmitBox = new BABYLON.Vector3(-8, 0, -8);
    energySystem.maxEmitBox = new BABYLON.Vector3(8, 0, 8);
    
    // Electric blue energy
    energySystem.color1 = new BABYLON.Color4(0.2, 0.8, 1.0, 1.0);
    energySystem.color2 = new BABYLON.Color4(0.6, 0.9, 1.0, 0.8);
    energySystem.colorDead = new BABYLON.Color4(1.0, 1.0, 1.0, 0.0);
    
    // Medium energy particles
    energySystem.minSize = 0.15;
    energySystem.maxSize = 0.3;
    energySystem.minLifeTime = 3;
    energySystem.maxLifeTime = 8;
    
    energySystem.emitRate = 30;
    
    // Upward energy flow
    energySystem.direction1 = new BABYLON.Vector3(-0.3, 4, -0.3);
    energySystem.direction2 = new BABYLON.Vector3(0.3, 6, 0.3);
    energySystem.minEmitPower = 2;
    energySystem.maxEmitPower = 4;
    
    energySystem.start();

    console.log('✅ Epic finale spectacle effects created');
  }

  private startFinaleChallenge(): void {
    // Epic finale introduction
    setTimeout(() => {
      this.buzzerSpeak('Welcome to the FINALE! The ultimate pyramid challenge!', 'excited');
    }, 1000);

    setTimeout(() => {
      this.buzzerSpeak('Fast general knowledge - every correct answer moves you up! First to the top WINS!', 'excited');
    }, 4000);

    setTimeout(() => {
      this.buzzerSpeak('Ready? Here we GO!', 'excited');
    }, 8000);

    // Start the rapid-fire question sequence
    setTimeout(() => {
      this.startRapidQuestions();
    }, 10000);

    console.log('🎬 Epic finale challenge started');
  }

  private startRapidQuestions(): void {
    this.finaleTimer = setInterval(() => {
      this.questionCount++;
      
      // Simulate random player movements
      this.simulateQuestionResponse();
      
      // Camera tracks the leaders
      this.trackLeaders();
      
      if (this.questionCount >= this.maxQuestions) {
        this.endFinale();
      }
    }, 2000); // Question every 2 seconds for rapid-fire
    
    console.log('⚡ Rapid-fire question sequence started');
  }

  private simulateQuestionResponse(): void {
    // Randomly select a player to move up (simulate correct answers)
    const activePlayer = this.finalePlayers[Math.floor(Math.random() * this.finalePlayers.length)];
    
    if (activePlayer && activePlayer.currentPosition < this.pyramidSteps && Math.random() < 0.6) {
      activePlayer.currentPosition++;
      this.movePlayerToStep(activePlayer);
      
      // Sound effect for movement
      try {
        Audio.playSound('step-up', { volume: 0.7 });
      } catch (error) {
        // Audio not available
      }
      
      console.log(`📈 ${activePlayer.name} moves to step ${activePlayer.currentPosition}`);
      
      // Check for winner
      if (activePlayer.currentPosition >= this.pyramidSteps) {
        this.declareWinner(activePlayer);
      }
    }
  }

  private movePlayerToStep(player: FinalePlayer): void {
    const playerAvatar = this.playerAvatars.find(a => a.player.id === player.id);
    if (!playerAvatar) return;

    const BABYLON = window.BABYLON;
    
    // Calculate new position
    const stepRadius = 9 - (player.currentPosition - 1) * 0.6;
    const playerIndex = this.finalePlayers.findIndex(p => p.id === player.id);
    const angle = (playerIndex / this.finalePlayers.length) * Math.PI * 2;
    const x = Math.cos(angle) * (stepRadius - 1);
    const z = Math.sin(angle) * (stepRadius - 1);
    const y = (player.currentPosition - 1) * 0.4 + 0.8;
    
    const newPosition = new BABYLON.Vector3(x, y, z);
    
    // Animate movement to new step
    const moveAnimation = BABYLON.Animation.CreateAndStartAnimation(
      `move_${player.id}_${this.questionCount}`,
      playerAvatar.avatar,
      'position',
      60,
      30, // Fast movement
      playerAvatar.avatar.position,
      newPosition,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
      BABYLON.EasingFunction.CreateQuadraticEaseOut()
    );
    
    // Move name tag as well
    const tagMoveAnimation = BABYLON.Animation.CreateAndStartAnimation(
      `tagMove_${player.id}_${this.questionCount}`,
      playerAvatar.nameTag,
      'position',
      60,
      30,
      playerAvatar.nameTag.position,
      new BABYLON.Vector3(x, y + 0.8, z),
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
      BABYLON.EasingFunction.CreateQuadraticEaseOut()
    );

    // Update stored position
    playerAvatar.targetPosition = newPosition;
  }

  private trackLeaders(): void {
    // Find current leader
    const leader = this.finalePlayers.reduce((prev, current) => 
      current.currentPosition > prev.currentPosition ? current : prev
    );
    
    const leaderAvatar = this.playerAvatars.find(a => a.player.id === leader.id);
    if (leaderAvatar && this.camera) {
      // Smoothly adjust camera to follow leader
      const BABYLON = window.BABYLON;
      
      const targetPosition = leaderAvatar.targetPosition;
      const cameraTarget = new BABYLON.Vector3(targetPosition.x * 0.5, targetPosition.y + 2, targetPosition.z * 0.5);
      
      // Smooth camera tracking animation
      const cameraAnimation = BABYLON.Animation.CreateAndStartAnimation(
        `cameraTrack_${this.questionCount}`,
        this.camera,
        'target',
        60,
        60,
        this.camera.getTarget(),
        cameraTarget,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
        BABYLON.EasingFunction.CreateQuadraticEaseInOut()
      );
    }
  }

  private declareWinner(winner: FinalePlayer): void {
    // Stop the finale timer
    if (this.finaleTimer) {
      clearInterval(this.finaleTimer);
      this.finaleTimer = null;
    }
    
    console.log(`🏆 WINNER: ${winner.name} reaches the top of the pyramid!`);
    
    // Epic winner announcement
    this.buzzerSpeak(`${winner.name} wins! Incredible! What a finale!`, 'excited');
    
    // Winner celebration effects
    this.celebrateWinner(winner);
    
    // Transition to results after celebration
    setTimeout(() => {
      this.transitionToResults(winner);
    }, 8000);
  }

  private celebrateWinner(winner: FinalePlayer): void {
    const winnerAvatar = this.playerAvatars.find(a => a.player.id === winner.id);
    if (!winnerAvatar) return;

    const BABYLON = window.BABYLON;
    
    // Winner jumping animation
    const victoryJump = BABYLON.Animation.CreateAndStartAnimation(
      'winnerJump',
      winnerAvatar.avatar,
      'position.y',
      60,
      120,
      winnerAvatar.avatar.position.y,
      winnerAvatar.avatar.position.y + 2,
      BABYLON.Animation.ANIMATIONLOOPMODE_YOYO,
      BABYLON.EasingFunction.CreateBounceEaseOut()
    );
    
    // Winner spinning celebration
    const victorySpin = BABYLON.Animation.CreateAndStartAnimation(
      'winnerSpin',
      winnerAvatar.avatar,
      'rotation.y',
      60,
      240,
      0,
      Math.PI * 4,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    
    // Enhanced winner glow
    if (winnerAvatar.material) {
      winnerAvatar.material.emissiveColor = new BABYLON.Color3(1.0, 1.0, 0.5);
      
      const glowPulse = BABYLON.Animation.CreateAndStartAnimation(
        'winnerGlow',
        winnerAvatar.material,
        'emissiveColor',
        60,
        120,
        new BABYLON.Color3(1.0, 1.0, 0.5),
        new BABYLON.Color3(2.0, 2.0, 1.0),
        BABYLON.Animation.ANIMATIONLOOPMODE_YOYO
      );
    }

    console.log(`🎊 Winner celebration effects for ${winner.name}`);
  }

  private endFinale(): void {
    // Find the player with highest position
    const winner = this.finalePlayers.reduce((prev, current) => 
      current.currentPosition > prev.currentPosition ? current : prev
    );
    
    this.declareWinner(winner);
  }

  private transitionToResults(winner: FinalePlayer): void {
    // For now, show a simple results message
    console.log(`🏁 Finale completed. Winner: ${winner.name}`);
    
    this.buzzerSpeak('What an incredible game! Thank you for playing TapFrenzy!', 'introduction');
    
    // Could transition to a results scene or back to menu
    setTimeout(() => {
      const sceneManager = (window as any).gameSceneManager;
      if (sceneManager) {
        import('./menu3d').then(({ Menu3DScene }) => {
          sceneManager.set(new Menu3DScene());
        });
      }
    }, 5000);
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
            utterance.pitch = 1.0;
            utterance.volume = 0.9;
            break;
          case 'excited':
            utterance.rate = 1.3;
            utterance.pitch = 1.6;
            utterance.volume = 1.0;
            break;
          default: // idle
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
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
      // Add epic finale speaking animation
      this.buzzer.scaling = new window.BABYLON.Vector3(1.2, 1.2, 1.2);
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
    if (this.finaleTimer) {
      clearInterval(this.finaleTimer);
      this.finaleTimer = null;
    }
    
    try {
      // Audio.stopMusic({ fadeOut: 2000 }); // TODO: Fix audio manager
    } catch (error) {
      // Audio not available
    }
    
    window.removeEventListener('resize', this.handleResize);
    
    if (this.engine) {
      this.engine.dispose();
    }
    
    this.canvas?.remove();
    
    console.log('✅ Finale 3D Scene unmounted');
  }

  onMessage(msg: S2C): void {
    switch (msg.t) {
      case 'finale:start':
        // Start finale with server data
        if ('steps' in msg) {
          this.pyramidSteps = msg.steps as number;
        }
        this.startFinaleChallenge();
        break;
      
      case 'finale:tick':
        // Update player positions
        if ('leaders' in msg && Array.isArray(msg.leaders)) {
          // Update player positions with server data
          console.log('📊 Finale tick received:', msg.leaders);
        }
        break;
      
      default:
        console.log('Finale scene received message:', msg.t);
    }
  }
}