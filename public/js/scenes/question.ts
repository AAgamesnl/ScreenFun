import type { S2C } from '../net';
import type { Scene } from './scene-manager';

/** Shows the question and answer choices. */
export class QuestionScene implements Scene {
  private el?: HTMLElement;
  
  mount(root: HTMLElement): void {
    this.el = document.createElement('div');
    this.el.className = 'question-scene';
    
    // Create a working game interface
    this.el.innerHTML = `
      <div class="game-container">
        <div class="game-header">
          <div class="game-logo">TapFrenzy</div>
          <div class="round-info">Round 1 of 10</div>
        </div>
        
        <div class="question-container">
          <div class="question-number">Question 1</div>
          <h1 class="question-text">What is the capital of France?</h1>
          
          <div class="answers-grid">
            <div class="answer-card" data-answer="A">
              <span class="answer-letter">A</span>
              <span class="answer-text">London</span>
            </div>
            <div class="answer-card" data-answer="B">
              <span class="answer-letter">B</span>
              <span class="answer-text">Berlin</span>
            </div>
            <div class="answer-card" data-answer="C">
              <span class="answer-letter">C</span>
              <span class="answer-text">Paris</span>
            </div>
            <div class="answer-card" data-answer="D">
              <span class="answer-letter">D</span>
              <span class="answer-text">Madrid</span>
            </div>
          </div>
        </div>
        
        <div class="game-info">
          <div class="timer-container">
            <div class="timer-label">Time Remaining</div>
            <div class="timer-circle">
              <span class="timer-text">15</span>
            </div>
          </div>
          
          <div class="players-info">
            <div class="players-label">Players Answered</div>
            <div class="players-count">0/2</div>
          </div>
        </div>
        
        <div class="instructions">
          <p>Players: Use your mobile devices to select an answer!</p>
          <p>Tap the letter that corresponds to your choice.</p>
        </div>
      </div>
    `;
    
    // Add CSS styles for the game
    const style = document.createElement('style');
    style.textContent = `
      .question-scene {
        background: linear-gradient(135deg, var(--bg) 0%, #1a1f2e 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
      }
      
      .game-container {
        max-width: 1200px;
        width: 100%;
        text-align: center;
      }
      
      .game-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 3rem;
        padding: 0 1rem;
      }
      
      .game-logo {
        font-size: 2rem;
        font-weight: 800;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      
      .round-info {
        color: var(--muted);
        font-size: 1.1rem;
        font-weight: 600;
      }
      
      .question-container {
        margin-bottom: 3rem;
      }
      
      .question-number {
        color: var(--accent);
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 1rem;
      }
      
      .question-text {
        color: var(--text);
        font-size: clamp(1.8rem, 4vw, 3rem);
        font-weight: 700;
        margin: 0 0 2rem 0;
        line-height: 1.2;
      }
      
      .answers-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
        max-width: 800px;
        margin: 0 auto;
      }
      
      .answer-card {
        background: var(--panel);
        border: 2px solid var(--muted);
        border-radius: var(--radius);
        padding: 1.5rem;
        cursor: pointer;
        transition: all var(--duration-normal) var(--ease-smooth);
        display: flex;
        align-items: center;
        gap: 1rem;
        text-align: left;
      }
      
      .answer-card:hover {
        border-color: var(--accent);
        transform: translateY(-2px);
        box-shadow: var(--shadow-floating);
      }
      
      .answer-letter {
        background: var(--accent);
        color: var(--bg);
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
        font-weight: 800;
        flex-shrink: 0;
      }
      
      .answer-text {
        color: var(--text);
        font-size: 1.2rem;
        font-weight: 600;
      }
      
      .game-info {
        display: flex;
        justify-content: center;
        gap: 4rem;
        margin-bottom: 2rem;
      }
      
      .timer-container, .players-info {
        text-align: center;
      }
      
      .timer-label, .players-label {
        color: var(--muted);
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        font-weight: 600;
      }
      
      .timer-circle {
        width: 80px;
        height: 80px;
        border: 3px solid var(--accent);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
      }
      
      .timer-text {
        color: var(--accent);
        font-size: 1.8rem;
        font-weight: 800;
      }
      
      .players-count {
        color: var(--text);
        font-size: 1.8rem;
        font-weight: 800;
      }
      
      .instructions {
        color: var(--muted);
        font-size: 1rem;
        line-height: 1.6;
      }
      
      .instructions p {
        margin: 0.5rem 0;
      }
      
      @media (max-width: 768px) {
        .answers-grid {
          grid-template-columns: 1fr;
        }
        
        .game-info {
          gap: 2rem;
        }
      }
    `;
    document.head.appendChild(style);
    
    root.innerHTML = '';
    root.appendChild(this.el);
    
    // Start a simple countdown timer for demo purposes
    this.startTimer();
  }
  
  private startTimer(): void {
    let timeLeft = 15;
    const timerElement = this.el?.querySelector('.timer-text');
    
    const countdown = setInterval(() => {
      timeLeft--;
      if (timerElement) {
        timerElement.textContent = timeLeft.toString();
      }
      
      if (timeLeft <= 0) {
        clearInterval(countdown);
        this.showResults();
      }
    }, 1000);
  }
  
  private showResults(): void {
    if (this.el) {
      this.el.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; text-align: center;">
          <div style="font-size: 4rem; margin-bottom: 2rem;">🎉</div>
          <h1 style="color: var(--accent); font-size: 3rem; margin-bottom: 1rem;">Question Complete!</h1>
          <p style="color: var(--text); font-size: 1.4rem; margin-bottom: 1rem;">The correct answer was: <strong style="color: var(--accent-2)">C - Paris</strong></p>
          <p style="color: var(--muted); font-size: 1.2rem;">Great job everyone! 🎯</p>
          <div style="margin-top: 3rem;">
            <p style="color: var(--muted);">Next question coming up...</p>
          </div>
        </div>
      `;
      
      // Automatically proceed to next question after 5 seconds
      setTimeout(() => {
        this.nextQuestion();
      }, 5000);
    }
  }
  
  private nextQuestion(): void {
    // For demo purposes, just restart the scene
    if (this.el?.parentElement) {
      this.mount(this.el.parentElement);
    }
  }
  
  unmount(): void {
    this.el?.remove();
  }
  
  onMessage(_msg: S2C): void {
    // Update question state based on server messages
  }
}
