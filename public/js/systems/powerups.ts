// TapFrenzy Power-Up Interference System for Mobile
export class PowerUpSystem {
  private activeEffects: Map<string, NodeJS.Timeout> = new Map();

  /** Apply freeze effect - player must tap rapidly to unfreeze */
  freezePlayer(duration: number = 3000): Promise<void> {
    return new Promise((resolve) => {
      const overlay = this.createOverlay('freeze');
      overlay.innerHTML = `
        <div class="freeze-effect">
          <div class="freeze-icon">🧊</div>
          <div class="freeze-title">FROZEN!</div>
          <div class="freeze-instruction">Tap rapidly to break free!</div>
          <div class="freeze-counter">${Math.ceil(duration / 100)}</div>
          <div class="freeze-progress">
            <div class="freeze-bar"></div>
          </div>
        </div>
      `;

      let taps = 0;
      const requiredTaps = 15;
      let timeLeft = duration;
      
      const updateCounter = () => {
        const counter = overlay.querySelector('.freeze-counter');
        const bar = overlay.querySelector('.freeze-bar') as HTMLElement;
        
        if (counter) counter.textContent = Math.ceil(timeLeft / 100).toString();
        if (bar) bar.style.width = `${(taps / requiredTaps) * 100}%`;
        
        timeLeft -= 100;
        
        if (timeLeft <= 0 || taps >= requiredTaps) {
          this.removeOverlay();
          resolve();
        } else {
          setTimeout(updateCounter, 100);
        }
      };

      const handleTap = () => {
        taps++;
        this.triggerHaptic('light');
        
        // Visual feedback
        overlay.style.transform = `scale(${0.95 + taps * 0.01})`;
        
        if (taps >= requiredTaps) {
          this.removeOverlay();
          resolve();
        }
      };

      overlay.addEventListener('click', handleTap);
      overlay.addEventListener('touchstart', handleTap);
      
      updateCounter();
    });
  }

  /** Apply gloop effect - player must swipe to clear vision */
  gloopPlayer(duration: number = 4000): Promise<void> {
    return new Promise((resolve) => {
      const overlay = this.createOverlay('gloop');
      overlay.innerHTML = `
        <div class="gloop-effect">
          <div class="gloop-slime"></div>
          <div class="gloop-icon">🟢</div>
          <div class="gloop-title">GLOOPED!</div>
          <div class="gloop-instruction">Swipe to clear the slime!</div>
          <div class="gloop-progress">
            <div class="gloop-bar"></div>
          </div>
        </div>
      `;

      let swipeProgress = 0;
      let isSwipeActive = false;
      let startX = 0, startY = 0;
      let totalDistance = 0;
      const requiredDistance = 500; // pixels

      const updateProgress = () => {
        const bar = overlay.querySelector('.gloop-bar') as HTMLElement;
        const slime = overlay.querySelector('.gloop-slime') as HTMLElement;
        
        if (bar) bar.style.width = `${(totalDistance / requiredDistance) * 100}%`;
        if (slime) slime.style.opacity = `${1 - (totalDistance / requiredDistance)}`;
        
        if (totalDistance >= requiredDistance) {
          this.removeOverlay();
          resolve();
        }
      };

      const handleTouchStart = (e: TouchEvent) => {
        if (!e.touches.length) return;
        isSwipeActive = true;
        startX = e.touches[0]!.clientX;
        startY = e.touches[0]!.clientY;
      };

      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        if (!isSwipeActive || !e.touches.length) return;
        
        const currentX = e.touches[0]!.clientX;
        const currentY = e.touches[0]!.clientY;
        
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > 20) { // Minimum swipe distance
          totalDistance += distance;
          startX = currentX;
          startY = currentY;
          
          updateProgress();
          this.triggerHaptic('light');
        }
      };

      const handleTouchEnd = () => {
        isSwipeActive = false;
      };

      overlay.addEventListener('touchstart', handleTouchStart);
      overlay.addEventListener('touchmove', handleTouchMove);
      overlay.addEventListener('touchend', handleTouchEnd);
      
      // Auto-resolve after duration
      setTimeout(() => {
        this.removeOverlay();
        resolve();
      }, duration);
    });
  }

  /** Apply double points effect - positive power-up */
  doublePoints(duration: number = 10000): Promise<void> {
    return new Promise((resolve) => {
      const overlay = this.createOverlay('double', false);
      overlay.innerHTML = `
        <div class="double-effect">
          <div class="double-badge">
            <div class="double-icon">⚡</div>
            <div class="double-text">DOUBLE POINTS!</div>
          </div>
          <div class="double-timer">
            <div class="double-timer-bar"></div>
          </div>
        </div>
      `;

      const timerBar = overlay.querySelector('.double-timer-bar') as HTMLElement;
      let timeLeft = duration;
      
      const updateTimer = () => {
        const progress = (timeLeft / duration) * 100;
        if (timerBar) timerBar.style.width = `${progress}%`;
        
        timeLeft -= 100;
        if (timeLeft <= 0) {
          this.removeOverlay();
          resolve();
        } else {
          setTimeout(updateTimer, 100);
        }
      };

      updateTimer();
    });
  }

  private createOverlay(type: string, fullscreen: boolean = true): HTMLElement {
    this.removeOverlay(); // Remove any existing overlay
    
    const overlay = document.createElement('div');
    overlay.id = 'power-up-overlay';
    overlay.className = `power-up-overlay ${type}-overlay`;
    
    if (fullscreen) {
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      `;
    } else {
      overlay.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        pointer-events: none;
      `;
    }

    this.applyOverlayStyles(overlay, type);
    document.body.appendChild(overlay);
    
    return overlay;
  }

  private applyOverlayStyles(overlay: HTMLElement, type: string): void {
    const style = document.createElement('style');
    style.setAttribute('data-power-up', 'true');
    style.textContent = `
      .freeze-overlay {
        background: rgba(100, 200, 255, 0.9);
        backdrop-filter: blur(10px);
      }
      
      .freeze-effect {
        text-align: center;
        color: white;
        animation: shake 0.5s infinite;
      }
      
      .freeze-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        animation: pulse 1s infinite;
      }
      
      .freeze-title {
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
      }
      
      .freeze-instruction {
        font-size: 1.2rem;
        margin-bottom: 1rem;
      }
      
      .freeze-counter {
        font-size: 3rem;
        font-weight: bold;
        margin-bottom: 1rem;
      }
      
      .freeze-progress {
        width: 200px;
        height: 20px;
        background: rgba(255,255,255,0.3);
        border-radius: 10px;
        overflow: hidden;
        margin: 0 auto;
      }
      
      .freeze-bar {
        height: 100%;
        background: linear-gradient(90deg, #4CAF50, #8BC34A);
        width: 0%;
        transition: width 0.1s ease;
      }
      
      .gloop-overlay {
        background: rgba(50, 150, 50, 0.8);
        backdrop-filter: blur(5px);
      }
      
      .gloop-slime {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at 50% 50%, 
          rgba(100, 255, 100, 0.6) 0%, 
          rgba(50, 200, 50, 0.4) 30%, 
          rgba(0, 150, 0, 0.2) 60%,
          transparent 100%);
        pointer-events: none;
      }
      
      .gloop-effect {
        text-align: center;
        color: white;
        position: relative;
        z-index: 2;
      }
      
      .gloop-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        animation: wobble 2s infinite;
      }
      
      .gloop-title {
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
      }
      
      .gloop-instruction {
        font-size: 1.2rem;
        margin-bottom: 2rem;
      }
      
      .gloop-progress {
        width: 200px;
        height: 20px;
        background: rgba(255,255,255,0.3);
        border-radius: 10px;
        overflow: hidden;
        margin: 0 auto;
      }
      
      .gloop-bar {
        height: 100%;
        background: linear-gradient(90deg, #FF9800, #FFC107);
        width: 0%;
        transition: width 0.2s ease;
      }
      
      .double-overlay {
        pointer-events: none;
      }
      
      .double-badge {
        background: linear-gradient(135deg, #FFD700, #FFA500);
        color: #333;
        padding: 15px 20px;
        border-radius: 15px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 8px 20px rgba(255, 215, 0, 0.4);
        animation: bounceIn 0.6s ease-out;
      }
      
      .double-icon {
        font-size: 1.5rem;
        animation: sparkle 1.5s infinite;
      }
      
      .double-text {
        font-weight: bold;
        font-size: 1.1rem;
      }
      
      .double-timer {
        width: 100%;
        height: 4px;
        background: rgba(255,255,255,0.3);
        border-radius: 2px;
        overflow: hidden;
        margin-top: 8px;
      }
      
      .double-timer-bar {
        height: 100%;
        background: linear-gradient(90deg, #4CAF50, #8BC34A);
        width: 100%;
        transition: width 0.1s linear;
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      
      @keyframes wobble {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-5deg); }
        75% { transform: rotate(5deg); }
      }
      
      @keyframes bounceIn {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.1); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      @keyframes sparkle {
        0%, 100% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(1.2) rotate(180deg); }
      }
    `;
    
    document.head.appendChild(style);
  }

  private removeOverlay(): void {
    const existing = document.getElementById('power-up-overlay');
    if (existing) {
      existing.remove();
    }
    
    // Remove any added styles
    const styles = document.querySelectorAll('style[data-power-up]');
    styles.forEach(style => style.remove());
  }

  private triggerHaptic(intensity: 'light' | 'medium' | 'heavy' = 'light'): void {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [25],
        heavy: [50]
      };
      navigator.vibrate(patterns[intensity]);
    }
  }

  /** Clean up all active effects */
  cleanup(): void {
    this.activeEffects.forEach(timeout => clearTimeout(timeout));
    this.activeEffects.clear();
    this.removeOverlay();
  }
}

// Example usage:
// const powerUps = new PowerUpSystem();
// await powerUps.freezePlayer(3000);
// await powerUps.gloopPlayer(4000);
// await powerUps.doublePoints(10000);