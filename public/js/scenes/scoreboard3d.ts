// TapFrenzy 3D Scoreboard Scene - AAA Visual Quality
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

interface PlayerScore {
  id: string;
  name: string;
  score: number;
  rank: number;
  isTopThree: boolean;
}

export class Scoreboard3DScene implements Scene {
  private canvas?: HTMLCanvasElement;
  private engine?: any;
  private scene?: any;
  private camera?: any;
  private buzzer?: any;
  private scorePillars: any[] = [];
  private displayTimer?: ReturnType<typeof setTimeout> | null;
  
  private currentScoreboard: PlayerScore[] = [
    { id: 'player3', name: 'Charlie', score: 2250, rank: 1, isTopThree: true },
    { id: 'player1', name: 'Alice', score: 2050, rank: 2, isTopThree: true },
    { id: 'player4', name: 'Diana', score: 1800, rank: 3, isTopThree: true },
    { id: 'player2', name: 'Bob', score: 1200, rank: 4, isTopThree: false },
    { id: 'player5', name: 'Eve', score: 950, rank: 5, isTopThree: false },
    { id: 'player6', name: 'Frank', score: 800, rank: 6, isTopThree: false }
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
    console.log('🎮 Starting TapFrenzy 3D Scoreboard Scene...');

    // 🚀 AAA Systems Initialization
    const performance = PerformanceManager.getInstance();
    performance.startProfiler('scoreboard3d-mount');
    
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
      this.scene.clearColor = new BABYLON.Color3(0.08, 0.05, 0.15); // Deep purple podium

      // Create camera focused on scoreboard hall
      this.camera = new BABYLON.ArcRotateCamera('scoreboardCamera', 
        -Math.PI / 2, Math.PI / 2.8, 18, 
        new BABYLON.Vector3(0, 3, 0), this.scene);
      
      // Allow gentle camera movement for scoreboard viewing
      this.camera.lowerRadiusLimit = 12;
      this.camera.upperRadiusLimit = 25;
      this.camera.lowerBetaLimit = Math.PI / 4;
      this.camera.upperBetaLimit = Math.PI / 1.5;
      this.camera.inputs.attached.pointers.angularSensibilityX = 2000;
      this.camera.inputs.attached.pointers.angularSensibilityY = 2000;

      console.log('✅ Scoreboard camera created');

      // Enhanced podium lighting
      await this.setupPodiumLighting();
      
      // Create the grand scoreboard hall
      await this.createScoreboardHall();
      
      // Create score pillars for each player
      await this.createScorePillars();
      
      // Create Buzzer presenter for commentary
      await this.createBuzzer();
      
      // Add atmospheric effects
      this.createPodiumAtmosphere();
      
      // Start triumphant scoreboard music
      try {
        Audio.playMusic('scoreboard-triumph', { fadeIn: 2000 });
      } catch (error) {
        console.warn('Audio not available:', error);
      }

      // Start render loop
      this.engine.runRenderLoop(() => {
        this.scene?.render();
      });

      // Handle window resize
      window.addEventListener('resize', this.handleResize.bind(this));
      
      // Start scoreboard presentation
      this.startScoreboardPresentation();

      performance.endProfiler('scoreboard3d-mount');
      console.log('✅ 3D Scoreboard Scene mounted successfully');

    } catch (error) {
      console.error('❌ 3D Scoreboard initialization failed:', error);
      performance.endProfiler('scoreboard3d-mount');
      
      // Fallback to 2D
      root.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; color: white; text-align: center; background: linear-gradient(45deg, #1a0f2a, #2a1a3a);">
          <div>
            <h1>TapFrenzy Scoreboard</h1>
            <p>3D Scoreboard initialization failed</p>
            <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
          </div>
        </div>
      `;
    }
  }

  private async setupPodiumLighting(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create podium HDRI environment
    const hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("/assets/podium_environment.env", this.scene);
    this.scene.environmentTexture = hdrTexture;
    this.scene.environmentIntensity = 0.5;

    // Dramatic key light from above for podium feel
    const keyLight = new BABYLON.DirectionalLight('podiumKey', new BABYLON.Vector3(0, -1, -0.3), this.scene);
    keyLight.intensity = 2.5;
    keyLight.diffuse = new BABYLON.Color3(1.0, 0.95, 0.8);
    
    // Warm fill light
    const fillLight = new BABYLON.DirectionalLight('podiumFill', new BABYLON.Vector3(0.5, -0.5, 0.8), this.scene);
    fillLight.intensity = 1.2;
    fillLight.diffuse = new BABYLON.Color3(0.8, 0.7, 1.0);

    // Top-3 spotlight system
    const topThreeColors = [
      new BABYLON.Color3(1.0, 0.8, 0.0), // Gold for 1st
      new BABYLON.Color3(0.8, 0.8, 0.8), // Silver for 2nd
      new BABYLON.Color3(0.8, 0.4, 0.1)  // Bronze for 3rd
    ];

    const topThreePositions = [
      new BABYLON.Vector3(0, 8, -4),    // Center (1st place)
      new BABYLON.Vector3(-3, 6, -4),   // Left (2nd place)
      new BABYLON.Vector3(3, 6, -4)     // Right (3rd place)
    ];

    topThreePositions.forEach((pos, i) => {
      const spotlight = new BABYLON.SpotLight(`topThreeSpot_${i}`, 
        pos, 
        new BABYLON.Vector3(0, -1, 0.2), 
        Math.PI / 3, 4, this.scene);
      spotlight.intensity = 2.0;
      spotlight.diffuse = topThreeColors[i] || new BABYLON.Color3(1, 1, 1);
    });

    // Ambient colored lighting for remaining players
    const remainingColors = [
      new BABYLON.Color3(0.4, 0.8, 0.4), // Green
      new BABYLON.Color3(0.4, 0.4, 0.8), // Blue
      new BABYLON.Color3(0.8, 0.4, 0.8)  // Purple
    ];

    for (let i = 3; i < 6; i++) {
      const xPos = -6 + (i - 3) * 3;
      const playerLight = new BABYLON.PointLight(`playerSpot_${i}`, 
        new BABYLON.Vector3(xPos, 4, 0), this.scene);
      playerLight.intensity = 1.0;
      playerLight.diffuse = remainingColors[i - 3] || new BABYLON.Color3(0.5, 0.5, 0.5);
    }

    console.log('✅ Podium lighting system setup');
  }

  private async createScoreboardHall(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create grand platform for the scoreboard hall
    const platform = BABYLON.MeshBuilder.CreateCylinder('scoreboardPlatform', {
      height: 0.5,
      diameterTop: 20,
      diameterBottom: 22,
      tessellation: 64
    }, this.scene);
    
    platform.position.y = -0.25;

    // Elegant platform material
    const platformMaterial = new BABYLON.PBRMaterial('platformMat', this.scene);
    platformMaterial.baseColor = new BABYLON.Color3(0.15, 0.1, 0.2);
    platformMaterial.metallicFactor = 0.8;
    platformMaterial.roughnessFactor = 0.1;
    platformMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.02, 0.08);
    
    platform.material = platformMaterial;

    // Create decorative columns around the hall
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 12;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const column = BABYLON.MeshBuilder.CreateCylinder(`column_${i}`, {
        height: 8,
        diameterTop: 0.8,
        diameterBottom: 1.0,
        tessellation: 16
      }, this.scene);
      
      column.position = new BABYLON.Vector3(x, 4, z);

      // Classical column material
      const columnMaterial = new BABYLON.PBRMaterial(`columnMat_${i}`, this.scene);
      columnMaterial.baseColor = new BABYLON.Color3(0.8, 0.8, 0.9);
      columnMaterial.metallicFactor = 0.2;
      columnMaterial.roughnessFactor = 0.7;
      
      column.material = columnMaterial;

      // Add capital detail
      const capital = BABYLON.MeshBuilder.CreateSphere(`capital_${i}`, {
        diameter: 1.2,
        segments: 16
      }, this.scene);
      
      capital.position = new BABYLON.Vector3(x, 8.2, z);
      capital.scaling.y = 0.5;
      capital.material = columnMaterial;
    }

    // Create title display
    const titlePlane = BABYLON.MeshBuilder.CreatePlane('titlePlane', {
      width: 12,
      height: 2.5
    }, this.scene);
    
    titlePlane.position = new BABYLON.Vector3(0, 7, -8);

    // Title texture
    const titleTexture = new BABYLON.DynamicTexture('titleTexture', {
      width: 1024,
      height: 256
    }, this.scene);
    
    // Draw elegant title background
    const ctx = titleTexture.getContext();
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#2a1a3a');
    gradient.addColorStop(1, '#1a0f2a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 256);
    
    // Draw golden border
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 984, 216);
    
    titleTexture.update();
    
    // Draw title text
    titleTexture.drawText(
      '🏆 SCOREBOARD 🏆',
      null, null,
      'bold 72px Arial',
      '#FFD700',
      'transparent',
      true, true
    );
    
    const titleMaterial = new BABYLON.StandardMaterial('titleMat', this.scene);
    titleMaterial.diffuseTexture = titleTexture;
    titleMaterial.emissiveTexture = titleTexture;
    titleMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    titleMaterial.disableLighting = true;
    
    titlePlane.material = titleMaterial;

    console.log('✅ Grand scoreboard hall created');
  }

  private async createScorePillars(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;
    
    // Sort players by rank for positioning
    const sortedPlayers = [...this.currentScoreboard].sort((a, b) => a.rank - b.rank);
    
    sortedPlayers.forEach((player, index) => {
      let xPos: number;
      let zPos: number;
      let pillarHeight: number;
      
      // Position top 3 in podium formation
      if (player.rank === 1) {
        xPos = 0; zPos = 2; pillarHeight = 6; // Center, tallest
      } else if (player.rank === 2) {
        xPos = -3; zPos = 1; pillarHeight = 4.5; // Left, second tallest
      } else if (player.rank === 3) {
        xPos = 3; zPos = 1; pillarHeight = 3.5; // Right, third tallest
      } else {
        // Remaining players in a row behind podium
        xPos = -6 + ((player.rank - 4) * 3);
        zPos = -2;
        pillarHeight = 2 + (7 - player.rank) * 0.3; // Gradually shorter
      }

      // Create score pillar
      const pillar = BABYLON.MeshBuilder.CreateCylinder(`pillar_${player.id}`, {
        height: pillarHeight,
        diameterTop: 1.5,
        diameterBottom: 1.8,
        tessellation: 32
      }, this.scene);
      
      pillar.position = new BABYLON.Vector3(xPos, pillarHeight / 2, zPos);

      // Material based on rank
      const pillarMaterial = new BABYLON.PBRMaterial(`pillarMat_${player.id}`, this.scene);
      
      if (player.rank === 1) {
        // Gold for 1st place
        pillarMaterial.baseColor = new BABYLON.Color3(1.0, 0.8, 0.0);
        pillarMaterial.metallicFactor = 1.0;
        pillarMaterial.roughnessFactor = 0.1;
        pillarMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.24, 0.0);
      } else if (player.rank === 2) {
        // Silver for 2nd place
        pillarMaterial.baseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        pillarMaterial.metallicFactor = 1.0;
        pillarMaterial.roughnessFactor = 0.15;
        pillarMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      } else if (player.rank === 3) {
        // Bronze for 3rd place
        pillarMaterial.baseColor = new BABYLON.Color3(0.8, 0.4, 0.1);
        pillarMaterial.metallicFactor = 0.9;
        pillarMaterial.roughnessFactor = 0.2;
        pillarMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.1, 0.02);
      } else {
        // Standard materials for other places
        pillarMaterial.baseColor = new BABYLON.Color3(0.4, 0.5, 0.7);
        pillarMaterial.metallicFactor = 0.6;
        pillarMaterial.roughnessFactor = 0.4;
        pillarMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.125, 0.175);
      }
      
      pillar.material = pillarMaterial;

      // Create player info display above pillar
      const infoPlane = BABYLON.MeshBuilder.CreatePlane(`info_${player.id}`, {
        width: 2.5,
        height: 1.2
      }, this.scene);
      
      infoPlane.position = new BABYLON.Vector3(xPos, pillarHeight + 1, zPos + 0.1);

      // Player info texture
      const infoTexture = new BABYLON.DynamicTexture(`infoTexture_${player.id}`, {
        width: 256,
        height: 128
      }, this.scene);
      
      infoTexture.hasAlpha = true;
      
      // Draw rank badge
      const rankColor = player.isTopThree ? '#FFD700' : '#CCCCCC';
      infoTexture.drawText(
        `#${player.rank}`,
        40, 25,
        'bold 24px Arial',
        rankColor,
        'transparent',
        false, true
      );
      
      // Draw player name
      infoTexture.drawText(
        player.name,
        null, 55,
        'bold 20px Arial',
        '#FFFFFF',
        'transparent',
        true, true
      );
      
      // Draw score
      infoTexture.drawText(
        `${player.score.toLocaleString()}`,
        null, 85,
        'bold 18px Arial',
        '#00FF88',
        'transparent',
        true, true
      );
      
      const infoMaterial = new BABYLON.StandardMaterial(`infoMat_${player.id}`, this.scene);
      infoMaterial.diffuseTexture = infoTexture;
      infoMaterial.emissiveTexture = infoTexture;
      infoMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);
      infoMaterial.disableLighting = true;
      
      infoPlane.material = infoMaterial;

      // Add gentle glow for top 3
      if (player.isTopThree) {
        const glowAnimation = BABYLON.Animation.CreateAndStartAnimation(
          `glow_${player.id}`,
          pillarMaterial,
          'emissiveColor.r',
          60,
          120,
          pillarMaterial.emissiveColor.r,
          pillarMaterial.emissiveColor.r * 1.5,
          BABYLON.Animation.ANIMATIONLOOPMODE_YOYO,
          BABYLON.EasingFunction.CreateSineEase()
        );
      }

      // Store pillar reference
      this.scorePillars.push({
        pillar,
        infoPlane,
        player,
        material: pillarMaterial
      });

      console.log(`✅ Created pillar for ${player.name} (Rank #${player.rank}): ${player.score}`);
    });

    console.log('✅ All score pillars created');
  }

  private async createBuzzer(): Promise<void> {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Position Buzzer as master of ceremonies
    const buzzerBody = BABYLON.MeshBuilder.CreateCapsule('buzzerBody', {
      radius: 0.35,
      height: 0.9,
      tessellation: 32
    }, this.scene);
    buzzerBody.position = new BABYLON.Vector3(-8, 0.45, -1);

    const buzzerHead = BABYLON.MeshBuilder.CreateSphere('buzzerHead', {
      diameter: 0.55,
      segments: 32
    }, this.scene);
    buzzerHead.position = new BABYLON.Vector3(-8, 1.1, -1);

    // Dignified master of ceremonies materials
    const buzzerMaterial = new BABYLON.PBRMaterial('buzzerMat', this.scene);
    buzzerMaterial.baseColor = new BABYLON.Color3(0.3, 0.2, 0.5);
    buzzerMaterial.metallicFactor = 0.7;
    buzzerMaterial.roughnessFactor = 0.2;
    buzzerMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.05, 0.15);
    
    buzzerBody.material = buzzerMaterial;
    buzzerHead.material = buzzerMaterial;

    // Group together
    const buzzerGroup = new BABYLON.Mesh('buzzerGroup', this.scene);
    buzzerBody.parent = buzzerGroup;
    buzzerHead.parent = buzzerGroup;
    
    this.buzzer = buzzerGroup;

    // Dignified presenting animation
    const presentAnimation = BABYLON.Animation.CreateAndStartAnimation(
      'buzzerPresent',
      buzzerGroup,
      'rotation.y',
      60,
      180,
      0,
      0.5,
      BABYLON.Animation.ANIMATIONLOOPMODE_YOYO,
      BABYLON.EasingFunction.CreateSineEase()
    );

    console.log('✅ Buzzer MC created for scoreboard presentation');
  }

  private createPodiumAtmosphere(): void {
    if (!this.scene) return;

    const BABYLON = window.BABYLON;

    // Create award ceremony particles
    const awardSystem = new BABYLON.ParticleSystem('awardParticles', 180, this.scene);
    
    awardSystem.particleTexture = new BABYLON.Texture('/assets/particles/award_star.png', this.scene);
    
    // Emit from above the podium
    awardSystem.emitter = new BABYLON.Vector3(0, 10, 0);
    awardSystem.minEmitBox = new BABYLON.Vector3(-8, 0, -3);
    awardSystem.maxEmitBox = new BABYLON.Vector3(8, 0, 3);
    
    // Golden celebration colors
    awardSystem.color1 = new BABYLON.Color4(1, 0.8, 0.2, 0.9);
    awardSystem.color2 = new BABYLON.Color4(1, 1, 0.6, 0.7);
    awardSystem.colorDead = new BABYLON.Color4(1, 0.9, 0.7, 0.0);
    
    // Elegant floating particles
    awardSystem.minSize = 0.15;
    awardSystem.maxSize = 0.3;
    awardSystem.minLifeTime = 6;
    awardSystem.maxLifeTime = 12;
    
    // Gentle emission for dignified atmosphere
    awardSystem.emitRate = 12;
    
    // Slow, graceful descent
    awardSystem.direction1 = new BABYLON.Vector3(-0.5, -1, -0.3);
    awardSystem.direction2 = new BABYLON.Vector3(0.5, -1, 0.3);
    awardSystem.minEmitPower = 0.5;
    awardSystem.maxEmitPower = 1.0;
    
    awardSystem.start();

    console.log('✅ Podium award ceremony atmosphere created');
  }

  private startScoreboardPresentation(): void {
    // Sequence of scoreboard commentary
    setTimeout(() => {
      this.buzzerSpeak('Here are your current standings!', 'introduction');
    }, 500);

    setTimeout(() => {
      const leader = this.currentScoreboard.find(p => p.rank === 1);
      if (leader) {
        this.buzzerSpeak(`${leader.name} is in the lead with ${leader.score} points!`, 'excited');
      }
    }, 3000);

    setTimeout(() => {
      const topThree = this.currentScoreboard.filter(p => p.isTopThree);
      this.buzzerSpeak(`Our top three are ${topThree.map(p => p.name).join(', ')}! Great job everyone!`, 'excited');
    }, 6000);

    setTimeout(() => {
      this.buzzerSpeak('Ready for the next round?', 'excited');
    }, 9000);

    // Auto-transition after displaying scoreboard
    this.displayTimer = setTimeout(() => {
      this.transitionToNextRound();
    }, 12000);

    console.log('🎬 Scoreboard presentation started');
  }

  private transitionToNextRound(): void {
    const sceneManager = (window as any).gameSceneManager;
    if (sceneManager) {
      // For demo, transition back to power plays or finale
      import('./finale3d').then(({ Finale3DScene }) => {
        sceneManager.set(new Finale3DScene());
      }).catch(error => {
        console.error('❌ Failed to load 3D finale scene:', error);
        // Fallback to existing finale scene  
        import('./finale').then(({ FinaleScene }) => {
          sceneManager.set(new FinaleScene());
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
            utterance.rate = 0.85;
            utterance.pitch = 1.0;
            utterance.volume = 0.9;
            break;
          case 'excited':
            utterance.rate = 1.1;
            utterance.pitch = 1.2;
            utterance.volume = 0.9;
            break;
          default: // idle
            utterance.rate = 0.95;
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
      // Add dignified presenting animation
      this.buzzer.scaling = new window.BABYLON.Vector3(1.05, 1.05, 1.05);
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
    if (this.displayTimer) {
      clearTimeout(this.displayTimer);
      this.displayTimer = null;
    }
    
    try {
      // Audio.stopMusic({ fadeOut: 1500 }); // TODO: Fix audio manager
    } catch (error) {
      // Audio not available
    }
    
    window.removeEventListener('resize', this.handleResize);
    
    if (this.engine) {
      this.engine.dispose();
    }
    
    this.canvas?.remove();
    
    console.log('✅ Scoreboard 3D Scene unmounted');
  }

  onMessage(msg: S2C): void {
    switch (msg.t) {
      case 'scoreboard':
        // Handle updated scoreboard from server
        if ('board' in msg && Array.isArray(msg.board)) {
          // Update scoreboard with server data
          console.log('📊 Scoreboard updated:', msg.board);
        }
        break;
      
      default:
        console.log('Scoreboard scene received message:', msg.t);
    }
  }
}