// TapFrenzy Enhanced Mobile Player Join Scene - AAA Quality
import type { Scene } from './scene-manager';
import type { S2C } from '../net';
// AAA Systems Integration
import { Audio } from '../systems/audio-manager';
import { VisualEffects } from '../systems/visual-effects-manager';
import { UIAnimations } from '../systems/ui-animation-manager';
import { PerformanceManager } from '../systems/performance-manager';
import { Config } from '../systems/configuration-manager';

export class EnhancedJoinScene implements Scene {
  private el?: HTMLElement;
  private onJoin: ((roomCode: string, playerName: string, pin?: string) => void) | undefined;

  constructor(onJoin?: (roomCode: string, playerName: string, pin?: string) => void) {
    this.onJoin = onJoin;
  }

  mount(root: HTMLElement): void {
    // 🚀 AAA Systems Initialization for Mobile Join
    const performance = PerformanceManager.getInstance();
    performance.startProfiler('join-scene-mount');
    
    // Initialize mobile-optimized audio
    try {
      Audio.playMusic('join-ambient', { fadeIn: 1500 });
      console.log('🔊 Mobile AAA Audio initialized');
    } catch (error) {
      console.warn('Audio not ready:', error);
    }
    
    // Mobile particle effects
    try {
      VisualEffects.createParticleSystem({
        id: 'join-mobile-particles',
        maxParticles: 20, // Reduced for mobile
        emissionRate: 1,
        lifetime: { min: 8, max: 12 },
        position: { x: 0, y: 0, z: 0 },
        velocity: {
          base: { x: 0, y: 0.05, z: 0 },
          random: { x: 0.5, y: 0.3, z: 0 }
        },
        acceleration: { x: 0, y: 0, z: 0 },
        size: { start: 4, end: 1 },
        color: {
          start: { r: 0.2, g: 0.8, b: 1, a: 0.6 },
          end: { r: 0.8, g: 0.6, b: 1, a: 0 }
        },
        blendMode: 'additive',
        physics: {
          gravity: 0,
          drag: 0.98,
          bounce: 0,
          collision: false
        }
      });
    } catch (error) {
      console.warn('Visual effects not ready:', error);
    }

    this.el = document.createElement('div');
    this.el.className = 'player-shell';
    this.el.innerHTML = `
      <div class="player-card">
        <div class="app-header">
          <div class="app-logo">
            <div class="logo-text">TAP</div>
            <div class="logo-text frenzy">FRENZY</div>
          </div>
          <div class="app-tagline">The Ultimate Quiz Experience</div>
        </div>

        <div class="join-form-container">
          <h2 class="form-title">Join the Game</h2>
          
          <div class="input-group">
            <label for="room-code">Room Code</label>
            <input 
              type="text" 
              id="room-code" 
              placeholder="Enter 4-5 letter code" 
              maxlength="5" 
              pattern="[A-Z]*" 
              spellcheck="false" 
              autocomplete="off" 
              autocapitalize="characters"
              autocorrect="off"
              data-lpignore="true"
              data-form-type="other">
            <div class="input-hint">Ask your host for the room code (letters only)</div>
          </div>

          <div class="input-group pin-group" id="pin-group" style="display: none;">
            <label for="pin-code">PIN (Optional)</label>
            <input type="text" id="pin-code" placeholder="Enter 4-digit PIN" maxlength="4" pattern="[0-9]*" spellcheck="false" autocomplete="off">
            <div class="input-hint">Enter PIN if required by host</div>
          </div>

          <div class="input-group">
            <label for="player-name">Your Name</label>
            <input type="text" id="player-name" placeholder="Enter your name" maxlength="20" spellcheck="false" autocomplete="name">
            <div class="input-hint">This is how others will see you</div>
          </div>

          <div class="avatar-selection">
            <label>Choose Your Avatar</label>
            <div class="avatar-grid" id="avatar-grid">
              <!-- Avatars will be populated here -->
            </div>
          </div>

          <button id="join-btn" class="join-button" disabled>
            <span class="btn-text">Join Game</span>
            <div class="btn-loading">
              <div class="loading-spinner"></div>
            </div>
          </button>

          <div id="error-message" class="error-message"></div>
        </div>

        <div class="features-section">
          <h3>Game Features</h3>
          <div class="features-list">
            <div class="feature">
              <span class="feature-icon">⚡</span>
              <span>Fast-paced questions</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🎯</span>
              <span>Power-ups & bonuses</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🏆</span>
              <span>Real-time scoring</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🎉</span>
              <span>Party atmosphere</span>
            </div>
          </div>
        </div>
      </div>
    `;

    root.innerHTML = '';
    root.appendChild(this.el);

    this.setupEventListeners();
    this.generateAvatars();
    this.enableHapticFeedback();

    // Auto-fill from URL parameters if available
    const params = new URLSearchParams(location.search);
    const urlCode = params.get('code');
    const urlName = params.get('name');
    
    if (urlCode) {
      const codeInput = this.el.querySelector('#room-code') as HTMLInputElement;
      codeInput.value = urlCode.toUpperCase();
      this.validateForm();
    }
    
    if (urlName) {
      const nameInput = this.el.querySelector('#player-name') as HTMLInputElement;
      nameInput.value = urlName;
      this.validateForm();
    }

    // Focus on the appropriate input
    setTimeout(() => {
      if (!urlCode) {
        (this.el?.querySelector('#room-code') as HTMLInputElement)?.focus();
      } else if (!urlName) {
        (this.el?.querySelector('#player-name') as HTMLInputElement)?.focus();
      }
    }, 300);
  }

  private setupEventListeners(): void {
    if (!this.el) return;

    const roomCodeInput = this.el.querySelector('#room-code') as HTMLInputElement;
    const pinCodeInput = this.el.querySelector('#pin-code') as HTMLInputElement;
    const playerNameInput = this.el.querySelector('#player-name') as HTMLInputElement;
    const joinBtn = this.el.querySelector('#join-btn') as HTMLButtonElement;

    // Room code input - only allow letters (A-Z, no numbers) - Enhanced reliability
    roomCodeInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      let value = target.value.replace(/[^A-Z]/g, '').toUpperCase();
      
      // Ensure the value is properly set with immediate visual feedback
      if (target.value !== value) {
        target.value = value;
        // Force visual update with multiple methods
        target.style.color = '#222';
        target.style.backgroundColor = 'white';
        target.style.caretColor = '#222';
      }
      
      this.validateForm();
      this.triggerHaptic('light');
      
      // AAA Audio feedback for typing
      Audio.playSound('ui-type', { volume: 0.2, pitch: 0.9 + Math.random() * 0.2 });
    });

    // Additional keydown handler to ensure proper input - Enhanced
    roomCodeInput.addEventListener('keydown', (e) => {
      // Allow backspace, delete, arrows, tab, escape
      if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Escape'].includes(e.key)) {
        return;
      }
      
      // Only allow A-Z letters, prevent everything else
      if (!/[A-Za-z]/.test(e.key) || roomCodeInput.value.length >= 5) {
        e.preventDefault();
        // Visual feedback for blocked input
        roomCodeInput.style.borderColor = '#ff6b6b';
        setTimeout(() => {
          roomCodeInput.style.borderColor = '#ccc';
        }, 200);
      }
    });

    // Additional safeguards for cross-browser compatibility
    roomCodeInput.addEventListener('paste', (e) => {
      e.preventDefault();
      const paste = (e.clipboardData || (window as any).clipboardData).getData('text');
      const cleanValue = paste.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 5);
      roomCodeInput.value = cleanValue;
      this.validateForm();
    });

    // Ensure focus works properly on mobile
    roomCodeInput.addEventListener('focus', (e) => {
      const target = e.target as HTMLInputElement;
      target.style.borderColor = '#667eea';
      target.style.backgroundColor = 'white';
      target.style.color = '#222';
    });

    roomCodeInput.addEventListener('blur', (e) => {
      const target = e.target as HTMLInputElement;
      target.style.borderColor = '#ccc';
    });

    // PIN code input - only allow numbers when visible
    pinCodeInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      target.value = target.value.replace(/[^0-9]/g, '');
      this.validateForm();
      this.triggerHaptic('light');
      
      // AAA Audio feedback for typing
      Audio.playSound('ui-type', { volume: 0.2, pitch: 1.1 + Math.random() * 0.2 });
    });

    // Player name input
    playerNameInput.addEventListener('input', () => {
      this.validateForm();
      this.triggerHaptic('light');
      
      // AAA Audio feedback for typing
      Audio.playSound('ui-type', { volume: 0.15, pitch: 0.95 + Math.random() * 0.1 });
    });

    // Join button with enhanced feedback
    joinBtn.addEventListener('click', () => {
      // AAA Audio feedback
      Audio.playSound('ui-click', { volume: 0.6 });
      this.handleJoin();
    });
    
    // Enhanced hover effects
    joinBtn.addEventListener('mouseenter', () => {
      Audio.playSound('ui-hover', { volume: 0.3 });
    });

    // Enter key handling
    [roomCodeInput, playerNameInput].forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !joinBtn.disabled) {
          Audio.playSound('ui-success', { volume: 0.5 });
          this.handleJoin();
        }
      });
    });
  }

  private generateAvatars(): void {
    const avatarGrid = this.el?.querySelector('#avatar-grid');
    if (!avatarGrid) return;

    const avatars = [
      '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', '🥷', '🧑‍🚀', '🧑‍💻', '🧑‍🎨',
      '🧑‍🔬', '🧑‍🍳', '🧑‍⚕️', '🧑‍🏫', '🧑‍🎤', '🧑‍🎭', '🧑‍🚒', '🧑‍✈️'
    ];

    avatars.forEach((emoji, index) => {
      const avatarBtn = document.createElement('button');
      avatarBtn.className = 'avatar-option';
      avatarBtn.textContent = emoji;
      avatarBtn.dataset.avatar = emoji;
      
      if (index === 0) {
        avatarBtn.classList.add('selected');
      }

      avatarBtn.addEventListener('click', () => {
        // Remove previous selection
        avatarGrid.querySelectorAll('.avatar-option').forEach(btn => {
          btn.classList.remove('selected');
        });
        
        // Select this avatar
        avatarBtn.classList.add('selected');
        this.triggerHaptic('medium');
      });

      avatarGrid.appendChild(avatarBtn);
    });
  }

  private validateForm(): void {
    if (!this.el) return;

    const roomCodeInput = this.el.querySelector('#room-code') as HTMLInputElement;
    const pinCodeInput = this.el.querySelector('#pin-code') as HTMLInputElement;
    const playerNameInput = this.el.querySelector('#player-name') as HTMLInputElement;
    const joinBtn = this.el.querySelector('#join-btn') as HTMLButtonElement;

    const roomCode = roomCodeInput.value.trim();
    const pinCode = pinCodeInput.value.trim();
    const playerName = playerNameInput.value.trim();

    // Room code: 4-5 letters, Player name: at least 2 chars
    // PIN: either empty (not required) or exactly 4 digits
    const isValidRoomCode = roomCode.length >= 4 && roomCode.length <= 5 && /^[A-Z]+$/.test(roomCode);
    const isValidPlayerName = playerName.length >= 2;
    const isValidPin = pinCode === '' || (pinCode.length === 4 && /^[0-9]{4}$/.test(pinCode));

    const isValid = isValidRoomCode && isValidPlayerName && isValidPin;
    joinBtn.disabled = !isValid;
    
    // Update button appearance
    joinBtn.classList.toggle('ready', isValid);
  }

  private handleJoin(): void {
    if (!this.el) return;

    const roomCodeInput = this.el.querySelector('#room-code') as HTMLInputElement;
    const pinCodeInput = this.el.querySelector('#pin-code') as HTMLInputElement;
    const playerNameInput = this.el.querySelector('#player-name') as HTMLInputElement;
    const joinBtn = this.el.querySelector('#join-btn') as HTMLButtonElement;
    const selectedAvatar = this.el.querySelector('.avatar-option.selected') as HTMLElement;

    const roomCode = roomCodeInput.value.trim().toUpperCase();
    const pinCode = pinCodeInput.value.trim();
    const playerName = playerNameInput.value.trim();
    const avatar = selectedAvatar?.dataset.avatar || '🦸‍♂️';

    // Show loading state with AAA animations
    joinBtn.classList.add('loading');
    joinBtn.disabled = true;

    // AAA Visual Effects for join action
    try {
      const rect = joinBtn.getBoundingClientRect();
      VisualEffects.createExplosionEffect({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        z: 0
      });
    } catch (error) {
      console.warn('Visual effects not available:', error);
    }

    // AAA Haptic feedback and UI animations
    this.triggerHaptic('heavy');
    
    try {
      const buttonId = UIAnimations.registerElement(joinBtn);
      UIAnimations.setElementState(buttonId, { isLoading: true });
    } catch (error) {
      console.warn('UI animations not available:', error);
    }

    // Store avatar selection
    localStorage.setItem('tapfrenzy-avatar', avatar);
    localStorage.setItem('tapfrenzy-name', playerName);

    // Call join callback with optional PIN
    this.onJoin?.(roomCode, playerName, pinCode || undefined);
  }

  private showError(message: string): void {
    const errorEl = this.el?.querySelector('#error-message');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        errorEl.classList.remove('visible');
      }, 5000);
    }

    // Reset join button
    const joinBtn = this.el?.querySelector('#join-btn') as HTMLButtonElement;
    joinBtn?.classList.remove('loading');
    this.validateForm();
    
    this.triggerHaptic('error');
  }

  private enableHapticFeedback(): void {
    // Enable haptic feedback for supported devices
    if ('vibrate' in navigator) {
      console.log('✅ Haptic feedback enabled');
    }
  }

  private triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'error' = 'light'): void {
    if (!('vibrate' in navigator)) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50],
      error: [100, 50, 100]
    };

    navigator.vibrate(patterns[type]);
  }

  unmount(): void {
    this.el?.remove();
  }

  onMessage(msg: S2C): void {
    if (msg.t === 'error') {
      this.showError(msg.message || 'Er ging iets mis. Probeer opnieuw.');
    } else if (msg.t === 'joined') {
      // Success - let the parent handle the transition
      this.triggerHaptic('heavy');
      console.log('✅ Successfully joined game!');
    }
  }
}