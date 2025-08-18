// TapFrenzy Enhanced Mobile Player Join Scene
import type { Scene } from './scene-manager';
import type { S2C } from '../net';

export class EnhancedJoinScene implements Scene {
  private el?: HTMLElement;
  private onJoin: ((roomCode: string, playerName: string) => void) | undefined;

  constructor(onJoin?: (roomCode: string, playerName: string) => void) {
    this.onJoin = onJoin;
  }

  mount(root: HTMLElement): void {
    this.el = document.createElement('div');
    this.el.className = 'enhanced-join-scene';
    this.el.innerHTML = `
      <div class="join-container">
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
            <input type="text" id="room-code" placeholder="Enter 4-digit code" maxlength="4" pattern="[0-9]*">
            <div class="input-hint">Ask your host for the room code</div>
          </div>

          <div class="input-group">
            <label for="player-name">Your Name</label>
            <input type="text" id="player-name" placeholder="Enter your name" maxlength="20">
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
    const playerNameInput = this.el.querySelector('#player-name') as HTMLInputElement;
    const joinBtn = this.el.querySelector('#join-btn') as HTMLButtonElement;

    // Room code input - only allow numbers and auto-format
    roomCodeInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      target.value = target.value.replace(/[^0-9]/g, '').toUpperCase();
      this.validateForm();
      this.triggerHaptic('light');
    });

    // Player name input
    playerNameInput.addEventListener('input', () => {
      this.validateForm();
      this.triggerHaptic('light');
    });

    // Join button
    joinBtn.addEventListener('click', () => {
      this.handleJoin();
    });

    // Enter key handling
    [roomCodeInput, playerNameInput].forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !joinBtn.disabled) {
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
    const playerNameInput = this.el.querySelector('#player-name') as HTMLInputElement;
    const joinBtn = this.el.querySelector('#join-btn') as HTMLButtonElement;

    const roomCode = roomCodeInput.value.trim();
    const playerName = playerNameInput.value.trim();

    const isValid = roomCode.length === 4 && playerName.length >= 2;
    joinBtn.disabled = !isValid;
    
    // Update button appearance
    joinBtn.classList.toggle('ready', isValid);
  }

  private handleJoin(): void {
    if (!this.el) return;

    const roomCodeInput = this.el.querySelector('#room-code') as HTMLInputElement;
    const playerNameInput = this.el.querySelector('#player-name') as HTMLInputElement;
    const joinBtn = this.el.querySelector('#join-btn') as HTMLButtonElement;
    const selectedAvatar = this.el.querySelector('.avatar-option.selected') as HTMLElement;

    const roomCode = roomCodeInput.value.trim().toUpperCase();
    const playerName = playerNameInput.value.trim();
    const avatar = selectedAvatar?.dataset.avatar || '🦸‍♂️';

    // Show loading state
    joinBtn.classList.add('loading');
    joinBtn.disabled = true;

    // Trigger strong haptic feedback
    this.triggerHaptic('heavy');

    // Store avatar selection
    localStorage.setItem('tapfrenzy-avatar', avatar);
    localStorage.setItem('tapfrenzy-name', playerName);

    // Call join callback
    this.onJoin?.(roomCode, playerName);
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