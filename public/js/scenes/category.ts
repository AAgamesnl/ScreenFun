import type { S2C } from '../net';
import type { Scene } from './scene-manager';

/** Scene where players select a category to start the game. */
export class CategoryScene implements Scene {
  private el?: HTMLElement;
  private selectedCategory?: string;
  
  mount(root: HTMLElement): void {
    this.el = document.createElement('div');
    this.el.className = 'category-scene';
    
    // Create category selection interface
    this.el.innerHTML = `
      <div class="category-container">
        <div class="category-header">
          <h1 class="category-title">Choose Your Category</h1>
          <p class="category-subtitle">Select a quiz category to begin the game!</p>
        </div>
        
        <div class="categories-grid">
          <button class="category-card" data-category="general">
            <div class="category-icon">🧠</div>
            <h3>General Knowledge</h3>
            <p>Mixed questions from all topics</p>
          </button>
          
          <button class="category-card" data-category="science">
            <div class="category-icon">🔬</div>
            <h3>Science & Nature</h3>
            <p>Biology, chemistry, physics & more</p>
          </button>
          
          <button class="category-card" data-category="entertainment">
            <div class="category-icon">🎬</div>
            <h3>Entertainment</h3>
            <p>Movies, music, TV & celebrities</p>
          </button>
          
          <button class="category-card" data-category="sports">
            <div class="category-icon">⚽</div>
            <h3>Sports</h3>
            <p>Athletics, games & competitions</p>
          </button>
          
          <button class="category-card" data-category="history">
            <div class="category-icon">📚</div>
            <h3>History</h3>
            <p>World events & historical facts</p>
          </button>
          
          <button class="category-card" data-category="geography">
            <div class="category-icon">🌍</div>
            <h3>Geography</h3>
            <p>Countries, capitals & landmarks</p>
          </button>
        </div>
        
        <div class="category-footer">
          <button id="start-game-btn" class="start-game-btn" disabled>
            <span class="btn-icon">🚀</span>
            <span class="btn-text">Start Game</span>
          </button>
        </div>
      </div>
    `;
    
    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
      .category-scene {
        background: linear-gradient(135deg, var(--bg) 0%, #1a1f2e 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
      }
      
      .category-container {
        max-width: 1200px;
        width: 100%;
        text-align: center;
      }
      
      .category-header {
        margin-bottom: 3rem;
      }
      
      .category-title {
        font-size: clamp(2rem, 5vw, 3.5rem);
        color: var(--text);
        margin: 0 0 1rem 0;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
      }
      
      .category-subtitle {
        font-size: 1.2rem;
        color: var(--muted);
        margin: 0;
      }
      
      .categories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;
      }
      
      .category-card {
        background: var(--panel);
        border: 2px solid transparent;
        border-radius: var(--radius);
        padding: 2rem;
        cursor: pointer;
        transition: all var(--duration-normal) var(--ease-smooth);
        text-align: center;
        color: var(--text);
      }
      
      .category-card:hover {
        border-color: var(--accent);
        transform: translateY(-4px);
        box-shadow: var(--shadow-floating);
      }
      
      .category-card.selected {
        border-color: var(--accent);
        background: linear-gradient(135deg, var(--panel), rgba(110, 231, 255, 0.1));
        box-shadow: var(--shadow-glow);
      }
      
      .category-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        display: block;
      }
      
      .category-card h3 {
        font-size: 1.4rem;
        margin: 0 0 0.5rem 0;
        color: var(--text);
      }
      
      .category-card p {
        color: var(--muted);
        margin: 0;
        font-size: 0.9rem;
      }
      
      .start-game-btn {
        background: var(--gradient-primary);
        color: white;
        border: none;
        border-radius: var(--radius-pill);
        padding: 1rem 3rem;
        font-size: 1.2rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--duration-normal) var(--ease-smooth);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0 auto;
      }
      
      .start-game-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .start-game-btn:not(:disabled):hover {
        transform: scale(1.05);
        box-shadow: var(--shadow-floating);
      }
      
      .btn-icon {
        font-size: 1.2rem;
      }
    `;
    document.head.appendChild(style);
    
    root.innerHTML = '';
    root.appendChild(this.el);
    
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    if (!this.el) return;
    
    const categoryCards = this.el.querySelectorAll('.category-card');
    const startBtn = this.el.querySelector('#start-game-btn') as HTMLButtonElement;
    
    categoryCards.forEach(card => {
      card.addEventListener('click', () => {
        // Remove previous selection
        categoryCards.forEach(c => c.classList.remove('selected'));
        
        // Select this category
        card.classList.add('selected');
        this.selectedCategory = card.getAttribute('data-category') || '';
        
        // Enable start button
        startBtn.disabled = false;
        
        console.log(`🎯 Selected category: ${this.selectedCategory}`);
      });
    });
    
    startBtn.addEventListener('click', () => {
      if (this.selectedCategory) {
        this.startGame();
      }
    });
  }
  
  private startGame(): void {
    console.log(`🎮 Starting game with category: ${this.selectedCategory}`);
    
    // Send category selection to server
    const net = (window as any).gameNet;
    if (net) {
      net.send({
        t: 'host:selectCategory',
        category: this.selectedCategory
      });
    }
    
    // Transition to question scene
    const sceneManager = (window as any).gameSceneManager;
    if (sceneManager) {
      // For now, let's create a simple working question scene
      import('./question').then(({ QuestionScene }) => {
        sceneManager.set(new QuestionScene());
      }).catch(error => {
        console.error('❌ Failed to load question scene:', error);
        // Fallback - show success message
        this.showSuccessMessage();
      });
    }
  }
  
  private showSuccessMessage(): void {
    if (this.el) {
      this.el.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; text-align: center;">
          <div style="font-size: 4rem; margin-bottom: 2rem;">🎮</div>
          <h1 style="color: var(--accent); font-size: 3rem; margin-bottom: 1rem;">Game Started!</h1>
          <p style="color: var(--muted); font-size: 1.2rem;">Category: ${this.selectedCategory}</p>
          <p style="color: var(--muted); margin-top: 2rem;">The game is now running. Players can use their devices to answer questions!</p>
        </div>
      `;
    }
  }
  
  unmount(): void {
    this.el?.remove();
  }
  
  onMessage(_msg: S2C): void {
    // Handle any server messages related to category selection
  }
}
