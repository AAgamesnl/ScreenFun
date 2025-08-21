// TapFrenzy 2D Start Screen - AAA Visual Quality
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

export class Menu2DScene implements Scene {
  private root?: HTMLElement;
  private qrUpdateInterval?: number;
  private ttsSupported: boolean = false;
  private currentSpeech?: SpeechSynthesisUtterance;
  private players: any[] = []; // Track connected players
  private playButton?: HTMLElement;

  async mount(root: HTMLElement): Promise<void> {
    this.root = root;
    
    console.log('🎮 Starting TapFrenzy 2D Menu...');
    
    // Phase 1: Initialize Audio System - ENABLED
    try {
      // Start ambient menu music
      Audio.playMusic('menu-theme', {
        fadeIn: 2000
      });
      
      console.log('🔊 AAA Audio System Initialized');
    } catch (error) {
      console.warn('Audio system not fully loaded yet:', error);
    }
    
    // Phase 4: Initialize Performance Monitoring - ENABLED ✅
    const performance = PerformanceManager.getInstance();
    performance.startProfiler('menu-mount');
    
    // Phase 5: Initialize Configuration System - ENABLED ✅
    // Get platform-optimized graphics settings
    const graphicsSettings = Config.get('graphics');
    const audioSettings = Config.get('audio');
    
    console.log(`🎯 AAA Configuration:`)
    console.log(`   Graphics Quality: ${graphicsSettings.quality}`);
    console.log(`   Render Scale: ${graphicsSettings.renderScale}`);  
    console.log(`   Audio Quality: ${audioSettings.quality}`);
    console.log(`   Spatial Audio: ${audioSettings.spatialAudio ? 'ON' : 'OFF'}`);
    
    // Phase 2: Create particle effects for background - ENABLED ✅
    try {
      VisualEffects.createParticleSystem({
        id: 'menu-background-particles',
        maxParticles: 50,
        emissionRate: 2,
        lifetime: { min: 10, max: 15 },
        position: { x: 0, y: 0, z: 0 },
        velocity: {
          base: { x: 0, y: 0.1, z: 0 },
          random: { x: 1, y: 0.5, z: 0 }
        },
        acceleration: { x: 0, y: 0, z: 0 },
        size: { start: 8, end: 2 },
        color: {
          start: { r: 0.4, g: 0.9, b: 1, a: 0.8 },
          end: { r: 1, g: 0.8, b: 0.2, a: 0 }
        },
        blendMode: 'additive',
        physics: {
          gravity: 0,
          drag: 0.99,
          bounce: 0,
          collision: false
        }
      });
      console.log('✨ AAA Visual Effects System Initialized');
    } catch (error) {
      console.warn('Visual effects system not fully loaded yet:', error);
    }
    
    // Create 2D start screen with 4K-ready scaling
    root.innerHTML = `
      <div class="menu2d-container">
        <!-- Game Logo -->
        <div class="logo-section">
          <div class="game-logo">
            <div class="logo-text ui-text-glow" data-text="TapFrenzy">TapFrenzy</div>
            <div class="logo-subtitle">Party Quiz Extravaganza</div>
          </div>
          
          <!-- Buzzer 2D Portrait -->
          <div class="buzzer-portrait">
            <div class="buzzer-avatar ui-floating">
              <div class="buzzer-face">
                <div class="buzzer-eye left"></div>
                <div class="buzzer-eye right"></div>
                <div class="buzzer-mouth"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bubble Menu Buttons -->
        <div class="menu-buttons">
          <button class="bubble-btn primary ui-ripple ui-glow ui-magnetic" data-action="play">
            <span class="btn-icon">🎮</span>
            <span class="btn-text">Play</span>
          </button>
          
          <button class="bubble-btn secondary ui-ripple ui-glass" data-action="party-packs">
            <span class="btn-icon">📦</span>
            <span class="btn-text">Party Packs</span>
          </button>
          
          <button class="bubble-btn secondary ui-ripple ui-glass" data-action="options">
            <span class="btn-icon">⚙️</span>
            <span class="btn-text">Options</span>
          </button>
          
          <button class="bubble-btn secondary ui-ripple ui-glass" data-action="how-to-play">
            <span class="btn-icon">❓</span>
            <span class="btn-text">How to Play</span>
          </button>
          
          <button class="bubble-btn secondary ui-ripple ui-glass" data-action="quit">
            <span class="btn-icon">🚪</span>
            <span class="btn-text">Quit</span>
          </button>
        </div>

        <!-- QR Code + Room Code HUD (Top-Right) -->
        <div class="qr-hud ui-glass">
          <div class="qr-container">
            <img id="qr-code" alt="QR Code" class="qr-image" />
            <div class="room-code-display">
              <div class="room-label">Room Code:</div>
              <div id="room-code-text" class="room-code">----</div>
            </div>
            <div class="join-fallback">
              <button id="copy-url" class="copy-btn ui-ripple">📋 Copy Link</button>
            </div>
          </div>
        </div>

        <!-- Enhanced Background Effects -->
        <div class="background-effects">
          <div class="glow-orb orb1 ui-floating"></div>
          <div class="glow-orb orb2 ui-floating"></div>
          <div class="glow-orb orb3 ui-floating"></div>
        </div>
      </div>
    `;

    // Add event listeners for buttons
    this.setupButtonHandlers();
    
    // Initialize QR code system
    await this.initializeQRSystem();
    
    // Start Enhanced Buzzer animations with TTS
    this.initializeBuzzerTTS();
    this.startEnhancedBuzzerAnimation();
    this.addContextualBuzzerReactions();
    
    // Add entrance animations
    this.startEntranceSequence();
    
    // Play entrance audio - temporarily commented
    // Audio.playSound('ui-success', { volume: 0.3 });
    
    // Start ambient audio - temporarily commented
    // Audio.playMusic('lobby-ambient', { fadeIn: 2 });
    
    // Phase 4: End performance profiling - ENABLED ✅
    performance.endProfiler('menu-mount');
    console.log('✅ Enhanced 2D Menu ready!');
  }

  unmount(): void {
    if (this.qrUpdateInterval) {
      clearInterval(this.qrUpdateInterval);
    }
  }

  onMessage(msg: S2C): void {
    if (msg.t === 'room' && msg.code) {
      this.updateRoomCode(msg.code);
      // Update player list and button state
      this.players = msg.players || [];
      this.updatePlayButton();
    }
  }

  private setupButtonHandlers(): void {
    if (!this.root) return;

    // Store play button reference for validation updates
    this.playButton = this.root.querySelector('[data-action="play"]') as HTMLElement;
    
    // Initialize button state
    this.updatePlayButton();

    const buttons = this.root.querySelectorAll('.bubble-btn');
    buttons.forEach(button => {
      // Register with UI animation system - temporarily commented
      // const elementId = UIAnimations.registerElement(button as HTMLElement, {
      //   interactions: ['hover', 'click', 'focus'],
      //   accessibility: {
      //     keyboardNavigable: true,
      //     ariaRole: 'button'
      //   }
      // });

      // Enhanced hover effects with haptic feedback
      button.addEventListener('mouseenter', (e) => {
        // Audio.playSound('ui-hover', { volume: 0.2 });
        // UIAnimations.triggerHapticFeedback({ 
        //   type: 'selection', 
        //   intensity: 'light', 
        //   duration: 25 
        // });
        
        // Create visual feedback
        button.classList.add('hover');
        this.createRippleEffect(e.currentTarget as HTMLElement);
        
        // Create sparkle effect at cursor position - temporarily simplified
        console.log('✨ Sparkle effect would be created here');
      });

      button.addEventListener('mouseleave', () => {
        button.classList.remove('hover');
      });

      // Click handlers with enhanced feedback
      button.addEventListener('click', (e) => {
        const action = (e.currentTarget as HTMLElement).getAttribute('data-action');
        
        // Phase 1: Play click sound - ENABLED
        Audio.playSound('ui-click', { 
          volume: 0.6,
          pitch: 0.95 + Math.random() * 0.1 // Natural variation
        });
        
        // Enhanced click feedback
        if (action === 'play') {
          Audio.playSound('ui-success', { volume: 0.5, delay: 100 });
        }
        
        // Phase 3: Haptic feedback - ENABLED ✅
        try {
          UIAnimations.triggerHapticFeedback({ 
            type: 'impact', 
            intensity: 'medium', 
            duration: 50 
          });
        } catch (error) {
          console.warn('Haptic feedback not available:', error);
        }
        
        // Visual effects
        this.createClickEffect(e.currentTarget as HTMLElement);
        
        // Phase 2: Create explosion effect - ENABLED ✅
        try {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          VisualEffects.createExplosionEffect({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            z: 0
          });
        } catch (error) {
          console.warn('Visual explosion effect not available:', error);
        }
        
        // Animate button state - temporarily simplified
        setTimeout(() => {
          this.handleMenuAction(action);
        }, 150);
      });
    });

    // Copy URL handler
    const copyBtn = this.root.querySelector('#copy-url');
    if (copyBtn) {
      // Phase 3: Register copy button for UI animations - ENABLED ✅
      const copyElementId = UIAnimations.registerElement(copyBtn as HTMLElement);
      
      copyBtn.addEventListener('click', () => {
        // Phase 1: Copy button audio feedback - ENABLED  
        Audio.playSound('ui-click', { volume: 0.5 });
        // Phase 3: Set loading state - ENABLED ✅
        UIAnimations.setElementState(copyElementId, { isLoading: true });
        
        this.copyJoinURL().then(() => {
          // Phase 3: Remove loading state - ENABLED ✅
          UIAnimations.setElementState(copyElementId, { isLoading: false });
          // Phase 1: Success sound - ENABLED
          Audio.playSound('ui-success', { volume: 0.4 });
          console.log('✅ Copy completed');
        });
      });
    }
  }

  private handleMenuAction(action: string | null): void {
    switch (action) {
      case 'play':
        // Validate player count before starting  
        if (!this.canStartGame()) {
          this.showToast('Need at least 1 ready player', 'warn');
          return;
        }
        console.log('🎮 Starting new game...');
        this.transitionToLobby();
        break;
      case 'party-packs':
        console.log('📦 Party Packs - Opening party packs...');
        this.showNotImplementedMessage('Party Packs', 'Question packs and themes coming soon!');
        break;
      case 'options':
        console.log('⚙️ Options - Opening settings...');
        this.showNotImplementedMessage('Options', 'Game settings and preferences coming soon!');
        break;
      case 'how-to-play':
        console.log('❓ How to Play - Opening instructions...');
        this.showHowToPlay();
        break;
      case 'quit':
        console.log('🚪 Quit');
        if (confirm('Are you sure you want to quit TapFrenzy?')) {
          window.close();
        }
        break;
    }
  }

  private canStartGame(): boolean {
    // Allow single player for testing purposes
    return this.players.length >= 1 && this.players.every(p => p.ready);
  }

  private updatePlayButton(): void {
    if (this.playButton) {
      const canStart = this.canStartGame();
      if (canStart) {
        this.playButton.classList.remove('disabled');
        (this.playButton as any).disabled = false;
      } else {
        this.playButton.classList.add('disabled');
        (this.playButton as any).disabled = true;
      }
    }
  }

  private showToast(message: string, type: 'info' | 'warn' | 'error' = 'info'): void {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'warn' ? 'var(--accent-2)' : type === 'error' ? 'var(--danger)' : 'var(--accent)'};
      color: ${type === 'warn' ? 'var(--bg)' : 'white'};
      padding: 1rem 2rem;
      border-radius: var(--radius);
      font-weight: 600;
      z-index: 2000;
      box-shadow: var(--shadow-floating);
      animation: toastSlideIn 0.3s ease-out;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'toastSlideOut 0.3s ease-in forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  private showNotImplementedMessage(title: string, message: string): void {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;
    
    overlay.innerHTML = `
      <div style="
        background: var(--gradient-primary);
        border-radius: var(--radius);
        padding: 2rem;
        text-align: center;
        max-width: 400px;
        border: 2px solid rgba(255, 255, 255, 0.1);
      ">
        <h2 style="margin: 0 0 1rem 0; color: white;">${title}</h2>
        <p style="margin: 0 0 1.5rem 0; color: rgba(255, 255, 255, 0.8);">${message}</p>
        <button style="
          background: var(--accent);
          color: var(--bg);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-sm);
          font-weight: 600;
          cursor: pointer;
        " onclick="this.parentElement.parentElement.remove()">
          Got it!
        </button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Close on background click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }

  private showHowToPlay(): void {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      overflow-y: auto;
    `;
    
    overlay.innerHTML = `
      <div style="
        background: var(--gradient-primary);
        border-radius: var(--radius);
        padding: 2rem;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        border: 2px solid rgba(255, 255, 255, 0.1);
      ">
        <h2 style="margin: 0 0 1rem 0; color: white; text-align: center;">How to Play TapFrenzy</h2>
        
        <div style="color: rgba(255, 255, 255, 0.9); line-height: 1.6;">
          <h3 style="color: var(--accent);">🎯 Game Setup</h3>
          <p>1. Host displays a QR code on the big screen</p>
          <p>2. Players scan the QR code with their phones</p>
          <p>3. Players enter their names and join the game</p>
          
          <h3 style="color: var(--accent);">🚀 Gameplay</h3>
          <p>1. Answer questions as fast as you can</p>
          <p>2. First correct answer gets the most points</p>
          <p>3. Use power-ups for bonus effects</p>
          <p>4. Watch the live leaderboard</p>
          
          <h3 style="color: var(--accent);">🏆 Winning</h3>
          <p>Player with the highest score wins!</p>
          <p>Celebrate together and play again!</p>
        </div>
        
        <button style="
          background: var(--accent);
          color: var(--bg);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-sm);
          font-weight: 600;
          cursor: pointer;
          display: block;
          margin: 2rem auto 0;
        " onclick="this.parentElement.parentElement.remove()">
          Let's Play!
        </button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Close on background click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }

  private async initializeQRSystem(): Promise<void> {
    try {
      // Request room creation from server using proper socket event
      const net = (window as any).gameNet;
      if (net && net.socket) {
        console.log('🎮 Requesting room creation...');
        net.socket.emit('host:createRoom', {}, (response: any) => {
          if (response?.ok && response?.code) {
            console.log(`✅ Room created successfully: ${response.code}`);
            this.updateRoomCode(response.code);
          } else {
            console.error('❌ Room creation failed:', response);
            this.showQRFallback();
          }
        });
      } else {
        console.warn('⚠️ Network connection not available');
      }
    } catch (error) {
      console.error('Failed to initialize QR system:', error);
      this.showQRFallback();
    }
  }

  private updateRoomCode(roomCode: string): void {
    if (!this.root) return;

    const roomCodeEl = this.root.querySelector('#room-code-text');
    if (roomCodeEl) {
      roomCodeEl.textContent = roomCode;
    }

    // Generate QR code for joining
    this.generateQRCode(roomCode);
  }

  private async generateQRCode(roomCode: string): Promise<void> {
    if (!this.root) return;

    try {
      const joinURL = `${window.location.origin}/player.html?room=${roomCode}`;
      
      // High-DPI QR code generation with improved parameters
      const qrURL = `/qr?text=${encodeURIComponent(joinURL)}`;
      
      const qrImg = this.root.querySelector('#qr-code') as HTMLImageElement;
      if (qrImg) {
        // Preload image to ensure it loads properly
        const img = new Image();
        img.onload = () => {
          qrImg.src = img.src;
          qrImg.style.display = 'block';
          console.log(`✅ High-DPI QR Code loaded for room: ${roomCode}`);
        };
        img.onerror = () => {
          console.error('❌ QR Code image failed to load');
          this.showQRFallback();
        };
        
        // Set high-DPI scaling attributes for crisp rendering
        qrImg.style.imageRendering = 'pixelated'; // For crisp QR codes
        img.src = qrURL;
      }
      
      console.log(`🎯 QR Code URL generated: ${qrURL}`);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      this.showQRFallback();
    }
  }

  private showQRFallback(): void {
    if (!this.root) return;

    const qrImg = this.root.querySelector('#qr-code') as HTMLImageElement;
    if (qrImg) {
      qrImg.style.display = 'none';
    }
    
    // Show fallback message
    const fallback = this.root.querySelector('.join-fallback');
    if (fallback) {
      fallback.innerHTML = `
        <div class="fallback-message">QR Code unavailable</div>
        <div class="manual-url">${window.location.origin}/player.html</div>
      `;
    }
  }

  private copyJoinURL(): Promise<void> {
    return new Promise((resolve, reject) => {
      const roomCode = document.getElementById('room-code-text')?.textContent;
      if (roomCode && roomCode !== '----') {
        const joinURL = `${window.location.origin}/player.html?room=${roomCode}`;
        
        navigator.clipboard.writeText(joinURL).then(() => {
          console.log('✅ Join URL copied to clipboard');
          
          // Visual feedback
          const copyBtn = document.getElementById('copy-url');
          if (copyBtn) {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ Copied!';
            setTimeout(() => {
              copyBtn.textContent = originalText;
            }, 2000);
          }
          resolve();
        }).catch(err => {
          console.error('Failed to copy URL:', err);
          reject(err);
        });
      } else {
        reject(new Error('No room code available'));
      }
    });
  }

  private startEnhancedBuzzerAnimation(): void {
    if (!this.root) return;

    const buzzerFace = this.root.querySelector('.buzzer-face');
    const leftEye = this.root.querySelector('.buzzer-eye.left');
    const rightEye = this.root.querySelector('.buzzer-eye.right');
    const mouth = this.root.querySelector('.buzzer-mouth');

    if (!buzzerFace || !leftEye || !rightEye || !mouth) return;

    // Enhanced idle blinking animation with random patterns
    const blinkPatterns: [number, number][] = [
      [3000, 150], // normal blink
      [4000, 300], // slow blink
      [2500, 100], // quick blink
      [5000, 150], // long pause
    ];
    
    let blinkIndex = 0;
    const scheduleNextBlink = () => {
      const pattern = blinkPatterns[blinkIndex]!; // Safe due to modulo operation
      const delay = pattern[0];
      const duration = pattern[1];
      blinkIndex = (blinkIndex + 1) % blinkPatterns.length;
      
      setTimeout(() => {
        leftEye.classList.add('blink');
        rightEye.classList.add('blink');
        
        setTimeout(() => {
          leftEye.classList.remove('blink');
          rightEye.classList.remove('blink');
          scheduleNextBlink();
        }, duration);
      }, delay + Math.random() * 1000);
    };
    scheduleNextBlink();

    // Enhanced mouth movement with emotional expressions
    const speakPatterns: [number, number][] = [
      [5000, 200], // normal speak
      [7000, 400], // long speak
      [3000, 150], // quick speak
      [8000, 300], // thoughtful speak
    ];
    
    let speakIndex = 0;
    const scheduleNextSpeak = () => {
      const pattern = speakPatterns[speakIndex]!; // Safe due to modulo operation
      const delay = pattern[0];
      const duration = pattern[1];
      speakIndex = (speakIndex + 1) % speakPatterns.length;
      
      setTimeout(() => {
        mouth.classList.add('speak');
        setTimeout(() => {
          mouth.classList.remove('speak');
          scheduleNextSpeak();
        }, duration);
      }, delay + Math.random() * 2000);
    };
    scheduleNextSpeak();

    // Gentle floating animation for the whole face
    buzzerFace.classList.add('float');
    
    // Add occasional excited reactions
    this.addBuzzerReactions();
  }

  private addBuzzerReactions(): void {
    if (!this.root) return;
    
    const buzzerAvatar = this.root.querySelector('.buzzer-avatar');
    if (!buzzerAvatar) return;

    setInterval(() => {
      // Random excited pulse
      if (Math.random() < 0.3) {
        buzzerAvatar.classList.add('excited-pulse');
        setTimeout(() => {
          buzzerAvatar.classList.remove('excited-pulse');
        }, 1000);
      }
    }, 10000);
  }

  private createRippleEffect(button: HTMLElement): void {
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.marginLeft = '-10px';
    ripple.style.marginTop = '-10px';
    ripple.style.pointerEvents = 'none';

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  private createClickEffect(button: HTMLElement): void {
    // Create sparkle effect
    for (let i = 0; i < 5; i++) {
      const sparkle = document.createElement('div');
      sparkle.style.position = 'absolute';
      sparkle.style.width = '4px';
      sparkle.style.height = '4px';
      sparkle.style.background = '#fff';
      sparkle.style.borderRadius = '50%';
      sparkle.style.pointerEvents = 'none';
      sparkle.style.left = '50%';
      sparkle.style.top = '50%';
      
      const angle = (360 / 5) * i;
      const distance = 30;
      sparkle.style.animation = `sparkle-out 0.8s ease-out forwards`;
      sparkle.style.transform = `rotate(${angle}deg) translateX(${distance}px)`;
      
      button.appendChild(sparkle);
      
      setTimeout(() => {
        sparkle.remove();
      }, 800);
    }
  }

  private startEntranceSequence(): void {
    // Add CSS for additional animations
    const style = document.createElement('style');
    style.textContent = `
      .excited-pulse {
        animation: excitedPulse 1s ease-in-out !important;
      }
      
      @keyframes excitedPulse {
        0%, 100% { transform: scale(1); }
        30% { transform: scale(1.05) rotate(2deg); }
        60% { transform: scale(1.08) rotate(-1deg); }
      }
      
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
      
      @keyframes sparkle-out {
        0% {
          transform: rotate(var(--angle)) translateX(0) scale(1);
          opacity: 1;
        }
        100% {
          transform: rotate(var(--angle)) translateX(30px) scale(0);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private transitionToLobby(): void {
    const sceneManager = (window as any).gameSceneManager;
    if (sceneManager) {
      // Import and switch to 3D lobby scene
      import('./lobby3d').then(({ Lobby3DScene }) => {
        sceneManager.set(new Lobby3DScene());
      });
    }
  }

  private initializeBuzzerTTS(): void {
    // Check for TTS support
    this.ttsSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    
    if (this.ttsSupported) {
      console.log('🔊 Buzzer TTS system initialized');
      
      // Buzzer welcome message
      setTimeout(() => {
        this.buzzerSpeak("Welcome to TapFrenzy! I'm Buzzer, your quiz host!", 'introduction');
      }, 2000);
    } else {
      console.warn('TTS not supported in this browser');
    }
  }

  private buzzerSpeak(text: string, context: 'introduction' | 'idle' | 'play' | 'excited' = 'idle'): void {
    if (!this.ttsSupported) return;

    // Stop any current speech
    if (this.currentSpeech) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice characteristics for Buzzer personality
    utterance.rate = context === 'excited' ? 1.2 : 0.9;
    utterance.pitch = context === 'introduction' ? 1.2 : 1.1;
    utterance.volume = 0.7;
    
    // Try to use a friendly voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') || 
      voice.lang.startsWith('en')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Animate Buzzer while speaking
    utterance.onstart = () => {
      this.animateBuzzerSpeaking(true);
    };

    utterance.onend = () => {
      this.animateBuzzerSpeaking(false);
    };

    this.currentSpeech = utterance;
    speechSynthesis.speak(utterance);

    console.log(`🎤 Buzzer says: "${text}"`);
  }

  private animateBuzzerSpeaking(speaking: boolean): void {
    if (!this.root) return;

    const buzzerAvatar = this.root.querySelector('.buzzer-avatar');
    const mouth = this.root.querySelector('.buzzer-mouth');

    if (speaking) {
      buzzerAvatar?.classList.add('speaking');
      mouth?.classList.add('speak');
      
      // Add visual feedback during speech
      const speakingAnimation = setInterval(() => {
        mouth?.classList.toggle('speak-intense');
      }, 200);

      // Store animation reference for cleanup
      (buzzerAvatar as any)._speakingAnimation = speakingAnimation;
    } else {
      buzzerAvatar?.classList.remove('speaking');
      mouth?.classList.remove('speak', 'speak-intense');
      
      // Clear animation
      if ((buzzerAvatar as any)._speakingAnimation) {
        clearInterval((buzzerAvatar as any)._speakingAnimation);
        delete (buzzerAvatar as any)._speakingAnimation;
      }
    }
  }

  private addContextualBuzzerReactions(): void {
    if (!this.root) return;

    // React to Play button hover
    const playButton = this.root.querySelector('[data-action="play"]');
    playButton?.addEventListener('mouseenter', () => {
      setTimeout(() => {
        this.buzzerSpeak("Ready to start? Let's do this!", 'excited');
      }, 500);
    });

    // React to QR copy
    const copyButton = this.root.querySelector('.qr-copy-btn');
    copyButton?.addEventListener('click', () => {
      setTimeout(() => {
        this.buzzerSpeak("Perfect! Share that with your friends!", 'excited');
      }, 1000);
    });
  }
}