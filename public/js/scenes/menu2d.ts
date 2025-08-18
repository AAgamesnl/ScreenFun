// TapFrenzy 2D Start Screen - AAA Visual Quality
import type { Scene } from './scene-manager';
import type { S2C } from '../net';

export class Menu2DScene implements Scene {
  private root?: HTMLElement;
  private qrUpdateInterval?: number;

  async mount(root: HTMLElement): Promise<void> {
    this.root = root;
    
    console.log('🎮 Starting TapFrenzy 2D Menu...');
    
    // Create 2D start screen with 4K-ready scaling
    root.innerHTML = `
      <div class="menu2d-container">
        <!-- Game Logo -->
        <div class="logo-section">
          <div class="game-logo">
            <div class="logo-text">TapFrenzy</div>
            <div class="logo-subtitle">Party Quiz Extravaganza</div>
          </div>
          
          <!-- Buzzer 2D Portrait -->
          <div class="buzzer-portrait">
            <div class="buzzer-avatar">
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
          <button class="bubble-btn primary" data-action="play">
            <span class="btn-icon">🎮</span>
            <span class="btn-text">Play</span>
          </button>
          
          <button class="bubble-btn secondary" data-action="party-packs">
            <span class="btn-icon">📦</span>
            <span class="btn-text">Party Packs</span>
          </button>
          
          <button class="bubble-btn secondary" data-action="options">
            <span class="btn-icon">⚙️</span>
            <span class="btn-text">Options</span>
          </button>
          
          <button class="bubble-btn secondary" data-action="how-to-play">
            <span class="btn-icon">❓</span>
            <span class="btn-text">How to Play</span>
          </button>
          
          <button class="bubble-btn secondary" data-action="quit">
            <span class="btn-icon">🚪</span>
            <span class="btn-text">Quit</span>
          </button>
        </div>

        <!-- QR Code + Room Code HUD (Top-Right) -->
        <div class="qr-hud">
          <div class="qr-container">
            <img id="qr-code" alt="QR Code" class="qr-image" />
            <div class="room-code-display">
              <div class="room-label">Room Code:</div>
              <div id="room-code-text" class="room-code">----</div>
            </div>
            <div class="join-fallback">
              <button id="copy-url" class="copy-btn">📋 Copy Link</button>
            </div>
          </div>
        </div>

        <!-- Background Effects -->
        <div class="background-effects">
          <div class="glow-orb orb1"></div>
          <div class="glow-orb orb2"></div>
          <div class="glow-orb orb3"></div>
        </div>
      </div>
    `;

    // Add event listeners for buttons
    this.setupButtonHandlers();
    
    // Initialize QR code system
    await this.initializeQRSystem();
    
    // Start Buzzer idle animation
    this.startBuzzerAnimation();
    
    console.log('✅ 2D Menu ready!');
  }

  unmount(): void {
    if (this.qrUpdateInterval) {
      clearInterval(this.qrUpdateInterval);
    }
  }

  onMessage(msg: S2C): void {
    if (msg.t === 'room' && msg.code) {
      this.updateRoomCode(msg.code);
    }
  }

  private setupButtonHandlers(): void {
    if (!this.root) return;

    const buttons = this.root.querySelectorAll('.bubble-btn');
    buttons.forEach(button => {
      // Hover effects
      button.addEventListener('mouseenter', () => {
        button.classList.add('hover');
      });
      
      button.addEventListener('mouseleave', () => {
        button.classList.remove('hover');
      });

      // Click handlers
      button.addEventListener('click', (e) => {
        const action = (e.currentTarget as HTMLElement).getAttribute('data-action');
        this.handleMenuAction(action);
      });
    });

    // Copy URL handler
    const copyBtn = this.root.querySelector('#copy-url');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        this.copyJoinURL();
      });
    }
  }

  private handleMenuAction(action: string | null): void {
    switch (action) {
      case 'play':
        // Start new game - transition to lobby
        console.log('🎮 Starting new game...');
        this.transitionToLobby();
        break;
      case 'party-packs':
        console.log('📦 Party Packs (not implemented yet)');
        break;
      case 'options':
        console.log('⚙️ Options (not implemented yet)');
        break;
      case 'how-to-play':
        console.log('❓ How to Play (not implemented yet)');
        break;
      case 'quit':
        console.log('🚪 Quit');
        window.close();
        break;
    }
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

  private copyJoinURL(): void {
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
      }).catch(err => {
        console.error('Failed to copy URL:', err);
      });
    }
  }

  private startBuzzerAnimation(): void {
    if (!this.root) return;

    const buzzerFace = this.root.querySelector('.buzzer-face');
    const leftEye = this.root.querySelector('.buzzer-eye.left');
    const rightEye = this.root.querySelector('.buzzer-eye.right');
    const mouth = this.root.querySelector('.buzzer-mouth');

    if (!buzzerFace || !leftEye || !rightEye || !mouth) return;

    // Idle blinking animation
    setInterval(() => {
      leftEye.classList.add('blink');
      rightEye.classList.add('blink');
      
      setTimeout(() => {
        leftEye.classList.remove('blink');
        rightEye.classList.remove('blink');
      }, 150);
    }, 3000 + Math.random() * 2000);

    // Subtle mouth movement
    setInterval(() => {
      mouth.classList.add('speak');
      setTimeout(() => {
        mouth.classList.remove('speak');
      }, 200);
    }, 5000 + Math.random() * 3000);

    // Gentle floating animation for the whole face
    buzzerFace.classList.add('float');
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
}