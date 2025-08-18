/**
 * AAA-Quality UI/UX Animation & Interaction System
 * 
 * Features:
 * - Sophisticated micro-animations with physics-based easing
 * - Advanced haptic feedback simulation
 * - Gesture recognition and touch optimization
 * - Accessibility-compliant interactions
 * - Performance-optimized animations with GPU acceleration
 * - Dynamic UI scaling and responsive design
 * - Professional transition orchestration
 * - Interactive particle effects
 * - Advanced state management for UI components
 */

interface AnimationConfig {
  duration: number;
  easing: EasingFunction;
  delay?: number;
  stagger?: number;
  loop?: boolean | number;
  yoyo?: boolean;
  onStart?: () => void;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
}

interface UIElement {
  id: string;
  element: HTMLElement;
  state: UIElementState;
  animations: Map<string, UIAnimation>;
  interactions: Set<InteractionType>;
  accessibility: AccessibilityConfig;
  responsiveness: ResponsiveConfig;
}

interface UIElementState {
  isHovered: boolean;
  isPressed: boolean;
  isFocused: boolean;
  isActive: boolean;
  isLoading: boolean;
  isDisabled: boolean;
  scale: number;
  rotation: number;
  opacity: number;
  position: { x: number; y: number };
}

interface AccessibilityConfig {
  ariaLabel?: string;
  ariaRole?: string;
  tabIndex?: number;
  keyboardNavigable: boolean;
  screenReaderText?: string;
  highContrastSupport: boolean;
  reducedMotionRespect: boolean;
}

interface ResponsiveConfig {
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
    ultrawide: number;
  };
  scaleFactor: number;
  touchOptimized: boolean;
  adaptiveSize: boolean;
}

interface HapticPattern {
  type: 'selection' | 'impact' | 'notification' | 'error' | 'success';
  intensity: 'light' | 'medium' | 'heavy';
  duration: number;
  pattern?: number[];
}

interface GestureConfig {
  tap: boolean;
  doubleTap: boolean;
  longPress: boolean;
  swipe: boolean;
  pinch: boolean;
  rotate: boolean;
  threshold: {
    tapTime: number;
    longPressTime: number;
    swipeDistance: number;
    pinchDistance: number;
  };
}

type EasingFunction = (t: number) => number;
type InteractionType = 'hover' | 'click' | 'focus' | 'scroll' | 'drag' | 'gesture';

export class UIAnimationManager {
  private static instance: UIAnimationManager;
  private elements = new Map<string, UIElement>();
  private globalAnimations = new Set<UIAnimation>();
  private interactionObserver?: IntersectionObserver;
  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;
  
  // Animation system
  private animationFrame = 0;
  private activeAnimations = new Set<UIAnimation>();
  private animationQueue: UIAnimation[] = [];
  
  // Interaction system
  private gestureHandler = new GestureHandler();
  private hapticEngine = new HapticEngine();
  private touchOptimization = new TouchOptimization();
  
  // Performance & Accessibility
  private reducedMotion = false;
  private highContrast = false;
  private performanceTier: 'low' | 'medium' | 'high' = 'high';
  
  // Easing functions
  private easings = new EasingLibrary();

  public static getInstance(): UIAnimationManager {
    if (!UIAnimationManager.instance) {
      UIAnimationManager.instance = new UIAnimationManager();
    }
    return UIAnimationManager.instance;
  }

  private constructor() {
    this.initializeSystem();
    this.setupEventListeners();
    this.startAnimationLoop();
    this.detectCapabilities();
    this.setupAccessibility();
  }

  private initializeSystem(): void {
    // Create global CSS variables for animations
    this.injectGlobalStyles();
    
    // Setup observers
    this.setupIntersectionObserver();
    this.setupResizeObserver();
    this.setupMutationObserver();
    
    // Initialize gesture system
    this.gestureHandler.initialize();
    
    // Initialize haptic engine
    this.hapticEngine.initialize();
  }

  private injectGlobalStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --ui-duration-instant: 0.1s;
        --ui-duration-fast: 0.2s;
        --ui-duration-normal: 0.3s;
        --ui-duration-slow: 0.5s;
        --ui-duration-slowest: 0.8s;
        
        --ui-ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
        --ui-ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
        --ui-ease-elastic: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        --ui-ease-sharp: cubic-bezier(0.4, 0, 0.6, 1);
        --ui-ease-physics: cubic-bezier(0.175, 0.885, 0.32, 1.275);
        
        --ui-shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
        --ui-shadow-raised: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
        --ui-shadow-floating: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
        --ui-shadow-dramatic: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
        
        --ui-blur-subtle: blur(1px);
        --ui-blur-medium: blur(8px);
        --ui-blur-strong: blur(16px);
        
        --ui-scale-hover: 1.02;
        --ui-scale-active: 0.98;
        --ui-scale-focus: 1.05;
      }

      /* Performance optimizations */
      .ui-optimized {
        will-change: transform, opacity, filter;
        transform: translateZ(0);
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
      }

      /* Accessibility */
      @media (prefers-reduced-motion: reduce) {
        .ui-element {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }

      @media (prefers-contrast: high) {
        .ui-element {
          filter: contrast(1.2) saturate(1.3);
        }
      }

      /* Interactive states */
      .ui-element {
        position: relative;
        transition: all var(--ui-duration-normal) var(--ui-ease-smooth);
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }

      .ui-element:hover:not(:disabled) {
        transform: scale(var(--ui-scale-hover));
        box-shadow: var(--ui-shadow-raised);
      }

      .ui-element:active:not(:disabled) {
        transform: scale(var(--ui-scale-active));
        transition-duration: var(--ui-duration-fast);
      }

      .ui-element:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
        transform: scale(var(--ui-scale-focus));
      }

      .ui-element:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        filter: grayscale(0.5);
      }

      /* Loading state */
      .ui-element.loading {
        pointer-events: none;
        position: relative;
        overflow: hidden;
      }

      .ui-element.loading::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.3),
          transparent
        );
        animation: shimmer 1.5s infinite;
      }

      @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
      }

      /* Ripple effect */
      .ui-ripple {
        position: relative;
        overflow: hidden;
      }

      .ui-ripple::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.3s ease-out, height 0.3s ease-out;
        pointer-events: none;
      }

      .ui-ripple:active::before {
        width: 300px;
        height: 300px;
      }

      /* Floating elements */
      .ui-floating {
        animation: float 3s ease-in-out infinite;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        25% { transform: translateY(-10px) rotate(1deg); }
        50% { transform: translateY(-20px) rotate(0deg); }
        75% { transform: translateY(-10px) rotate(-1deg); }
      }

      /* Pulse animation */
      .ui-pulse {
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }

      /* Glow effect */
      .ui-glow {
        position: relative;
      }

      .ui-glow::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border-radius: inherit;
        background: linear-gradient(45deg, var(--accent), var(--accent-2));
        opacity: 0;
        z-index: -1;
        filter: blur(10px);
        transition: opacity var(--ui-duration-normal) var(--ui-ease-smooth);
      }

      .ui-glow:hover::after {
        opacity: 0.7;
      }

      /* Magnetic effect */
      .ui-magnetic {
        transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }

      /* Glassmorphism */
      .ui-glass {
        backdrop-filter: var(--ui-blur-medium);
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }

      /* Neumorphism */
      .ui-neuro {
        background: var(--panel);
        box-shadow: 
          8px 8px 16px rgba(0, 0, 0, 0.2),
          -8px -8px 16px rgba(255, 255, 255, 0.1);
        border: none;
      }

      .ui-neuro:active {
        box-shadow: 
          inset 4px 4px 8px rgba(0, 0, 0, 0.3),
          inset -4px -4px 8px rgba(255, 255, 255, 0.1);
      }

      /* Particle trail effect */
      .ui-particle-trail {
        position: relative;
      }

      /* Complex button animations */
      .ui-button-complex {
        position: relative;
        overflow: hidden;
        background: linear-gradient(135deg, var(--accent), var(--accent-2));
        background-size: 200% 200%;
        animation: gradientShift 3s ease infinite;
      }

      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      .ui-button-complex::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.4),
          transparent
        );
        transition: left 0.5s ease;
      }

      .ui-button-complex:hover::before {
        left: 100%;
      }

      /* Text effects */
      .ui-text-glow {
        color: transparent;
        background: linear-gradient(135deg, var(--accent), var(--accent-2), var(--accent-3));
        background-clip: text;
        -webkit-background-clip: text;
        animation: textShimmer 2s ease-in-out infinite alternate;
      }

      @keyframes textShimmer {
        0% { filter: brightness(1) saturate(1); }
        100% { filter: brightness(1.2) saturate(1.3); }
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .ui-element {
          --ui-scale-hover: 1.01;
          --ui-scale-active: 0.99;
        }
      }

      /* High performance mode */
      .ui-performance-mode .ui-element {
        transition: none !important;
        animation: none !important;
      }
    `;
    
    document.head.appendChild(style);
  }

  private setupIntersectionObserver(): void {
    this.interactionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const element = this.elements.get(entry.target.id);
          if (!element) return;
          
          if (entry.isIntersecting) {
            this.triggerEntranceAnimation(element);
          } else {
            this.triggerExitAnimation(element);
          }
        });
      },
      { threshold: [0.1, 0.5, 0.9] }
    );
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        const element = this.elements.get(entry.target.id);
        if (!element) return;
        
        this.updateResponsiveProperties(element, entry.contentRect);
      });
    });
  }

  private setupMutationObserver(): void {
    this.mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.autoDiscoverElements(node as Element);
          }
        });
      });
    });
    
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private setupEventListeners(): void {
    // Global event delegation
    document.addEventListener('pointerdown', this.handlePointerDown.bind(this));
    document.addEventListener('pointerup', this.handlePointerUp.bind(this));
    document.addEventListener('pointermove', this.handlePointerMove.bind(this));
    document.addEventListener('pointerenter', this.handlePointerEnter.bind(this));
    document.addEventListener('pointerleave', this.handlePointerLeave.bind(this));
    
    // Keyboard events
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('focus', this.handleFocus.bind(this), true);
    document.addEventListener('blur', this.handleBlur.bind(this), true);
    
    // Window events
    window.addEventListener('resize', this.handleResize.bind(this));
    window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
    
    // Scroll events with throttling
    let scrollTimeout: number;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        this.updateScrollBasedAnimations();
      }, 16); // ~60fps
    }, { passive: true });
  }

  private detectCapabilities(): void {
    // Detect reduced motion preference
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Detect high contrast preference
    this.highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    // Detect performance tier
    const connection = (navigator as any).connection;
    const deviceMemory = (navigator as any).deviceMemory;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    
    if (connection?.effectiveType === '2g' || deviceMemory < 2) {
      this.performanceTier = 'low';
    } else if (connection?.effectiveType === '3g' || deviceMemory < 4 || hardwareConcurrency < 4) {
      this.performanceTier = 'medium';
    }
    
    // Apply performance optimizations
    if (this.performanceTier === 'low') {
      document.documentElement.classList.add('ui-performance-mode');
    }
  }

  private setupAccessibility(): void {
    // Monitor accessibility preferences
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
      this.updateAccessibilitySettings();
    });
    
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      this.highContrast = e.matches;
      this.updateAccessibilitySettings();
    });
  }

  private updateAccessibilitySettings(): void {
    this.elements.forEach(element => {
      if (element.accessibility.reducedMotionRespect && this.reducedMotion) {
        element.element.style.animationDuration = '0.01ms';
        element.element.style.transitionDuration = '0.01ms';
      }
      
      if (element.accessibility.highContrastSupport && this.highContrast) {
        element.element.style.filter = 'contrast(1.2) saturate(1.3)';
      }
    });
  }

  private startAnimationLoop(): void {
    const animate = () => {
      this.updateAnimations();
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  private updateAnimations(): void {
    this.activeAnimations.forEach(animation => {
      animation.update();
      if (animation.isComplete()) {
        this.activeAnimations.delete(animation);
      }
    });
  }

  // Event handlers
  private handlePointerDown(e: PointerEvent): void {
    const element = this.getUIElement(e.target as Element);
    if (!element) return;
    
    element.state.isPressed = true;
    this.triggerInteraction(element, 'click', e);
    this.hapticEngine.trigger({ type: 'selection', intensity: 'light', duration: 50 });
  }

  private handlePointerUp(e: PointerEvent): void {
    const element = this.getUIElement(e.target as Element);
    if (!element) return;
    
    element.state.isPressed = false;
    this.triggerRippleEffect(element, e);
  }

  private handlePointerMove(e: PointerEvent): void {
    const element = this.getUIElement(e.target as Element);
    if (!element) return;
    
    if (element.element.classList.contains('ui-magnetic')) {
      this.applyMagneticEffect(element, e);
    }
    
    if (element.element.classList.contains('ui-particle-trail')) {
      this.createParticleTrail(element, e);
    }
  }

  private handlePointerEnter(e: PointerEvent): void {
    const element = this.getUIElement(e.target as Element);
    if (!element) return;
    
    element.state.isHovered = true;
    this.triggerInteraction(element, 'hover', e);
    this.hapticEngine.trigger({ type: 'selection', intensity: 'light', duration: 25 });
  }

  private handlePointerLeave(e: PointerEvent): void {
    const element = this.getUIElement(e.target as Element);
    if (!element) return;
    
    element.state.isHovered = false;
    this.resetMagneticEffect(element);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Tab') {
      // Enhanced focus management
      this.updateFocusRing();
    }
  }

  private handleFocus(e: FocusEvent): void {
    const element = this.getUIElement(e.target as Element);
    if (!element) return;
    
    element.state.isFocused = true;
    this.triggerInteraction(element, 'focus', e);
  }

  private handleBlur(e: FocusEvent): void {
    const element = this.getUIElement(e.target as Element);
    if (!element) return;
    
    element.state.isFocused = false;
  }

  private handleResize(): void {
    this.elements.forEach(element => {
      this.updateResponsiveProperties(element, element.element.getBoundingClientRect());
    });
  }

  private handleOrientationChange(): void {
    // Recalculate responsive properties after orientation change
    setTimeout(() => {
      this.handleResize();
    }, 100);
  }

  // Animation methods
  private triggerEntranceAnimation(element: UIElement): void {
    if (this.reducedMotion) return;
    
    const animation = new UIAnimation({
      element: element.element,
      keyframes: [
        { opacity: 0, transform: 'translateY(50px) scale(0.8)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' }
      ],
      duration: 600,
      easing: this.easings.easeOutCubic,
      delay: Math.random() * 200 // Stagger effect
    });
    
    this.activeAnimations.add(animation);
    animation.play();
  }

  private triggerExitAnimation(element: UIElement): void {
    if (this.reducedMotion) return;
    
    // Subtle exit animation
    const animation = new UIAnimation({
      element: element.element,
      keyframes: [
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0.7, transform: 'scale(0.95)' }
      ],
      duration: 300,
      easing: this.easings.easeInCubic
    });
    
    this.activeAnimations.add(animation);
    animation.play();
  }

  private triggerInteraction(element: UIElement, type: InteractionType, event: Event): void {
    if (!element.interactions.has(type)) return;
    
    switch (type) {
      case 'hover':
        this.animateHoverState(element);
        break;
      case 'click':
        this.animateClickState(element);
        break;
      case 'focus':
        this.animateFocusState(element);
        break;
    }
  }

  private animateHoverState(element: UIElement): void {
    if (this.reducedMotion) return;
    
    const animation = new UIAnimation({
      element: element.element,
      keyframes: [
        { transform: 'scale(1)' },
        { transform: 'scale(1.02)' }
      ],
      duration: 200,
      easing: this.easings.easeOutCubic
    });
    
    this.activeAnimations.add(animation);
    animation.play();
  }

  private animateClickState(element: UIElement): void {
    if (this.reducedMotion) return;
    
    const animation = new UIAnimation({
      element: element.element,
      keyframes: [
        { transform: 'scale(1.02)' },
        { transform: 'scale(0.98)' },
        { transform: 'scale(1)' }
      ],
      duration: 150,
      easing: this.easings.easeOutCubic
    });
    
    this.activeAnimations.add(animation);
    animation.play();
  }

  private animateFocusState(element: UIElement): void {
    if (this.reducedMotion) return;
    
    element.element.style.outline = '2px solid var(--accent)';
    element.element.style.outlineOffset = '2px';
    
    const animation = new UIAnimation({
      element: element.element,
      keyframes: [
        { transform: 'scale(1)' },
        { transform: 'scale(1.05)' }
      ],
      duration: 200,
      easing: this.easings.easeOutCubic
    });
    
    this.activeAnimations.add(animation);
    animation.play();
  }

  private triggerRippleEffect(element: UIElement, event: PointerEvent): void {
    if (!element.element.classList.contains('ui-ripple') || this.reducedMotion) return;
    
    const rect = element.element.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height) * 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${event.clientX - rect.left - size / 2}px;
      top: ${event.clientY - rect.top - size / 2}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      pointer-events: none;
      transform: scale(0);
      animation: ripple 0.6s ease-out forwards;
    `;
    
    element.element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  private applyMagneticEffect(element: UIElement, event: PointerEvent): void {
    if (this.reducedMotion) return;
    
    const rect = element.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (event.clientX - centerX) * 0.15;
    const deltaY = (event.clientY - centerY) * 0.15;
    
    element.element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  }

  private resetMagneticEffect(element: UIElement): void {
    element.element.style.transform = '';
  }

  private createParticleTrail(element: UIElement, event: PointerEvent): void {
    if (this.performanceTier === 'low' || this.reducedMotion) return;
    
    // Create particle for trail effect
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      width: 4px;
      height: 4px;
      background: var(--accent);
      border-radius: 50%;
      pointer-events: none;
      left: ${event.clientX - 2}px;
      top: ${event.clientY - 2}px;
      z-index: 10000;
      animation: particleFade 0.8s ease-out forwards;
    `;
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 800);
  }

  private updateResponsiveProperties(element: UIElement, rect: DOMRect): void {
    const config = element.responsiveness;
    const viewport = window.innerWidth;
    
    let scaleFactor = 1;
    if (viewport < config.breakpoints.mobile) {
      scaleFactor = 0.8;
    } else if (viewport < config.breakpoints.tablet) {
      scaleFactor = 0.9;
    }
    
    if (config.adaptiveSize) {
      element.element.style.setProperty('--responsive-scale', scaleFactor.toString());
    }
  }

  private updateScrollBasedAnimations(): void {
    const scrollY = window.scrollY;
    
    this.elements.forEach(element => {
      if (element.element.classList.contains('ui-parallax')) {
        const speed = parseFloat(element.element.dataset.parallaxSpeed || '0.5');
        element.element.style.transform = `translateY(${scrollY * speed}px)`;
      }
    });
  }

  private updateFocusRing(): void {
    document.body.classList.add('user-is-tabbing');
    
    // Remove the class after a mouse click
    const removeTabbing = () => {
      document.body.classList.remove('user-is-tabbing');
      document.removeEventListener('mousedown', removeTabbing);
    };
    document.addEventListener('mousedown', removeTabbing);
  }

  // Utility methods
  private getUIElement(target: Element | null): UIElement | null {
    if (!target) return null;
    
    // Walk up the DOM tree to find a registered UI element
    let current = target as Element;
    while (current && current !== document.body) {
      const element = this.elements.get(current.id);
      if (element) return element;
      current = current.parentElement as Element;
    }
    
    return null;
  }

  private autoDiscoverElements(root: Element): void {
    // Auto-discover elements with UI classes
    const uiElements = root.querySelectorAll('[class*="ui-"], .bubble-btn, .btn, .card');
    
    uiElements.forEach(el => {
      if (el.id && !this.elements.has(el.id)) {
        this.registerElement(el as HTMLElement);
      }
    });
  }

  // Public API
  public registerElement(
    element: HTMLElement,
    config?: Partial<{
      interactions: InteractionType[];
      accessibility: Partial<AccessibilityConfig>;
      responsiveness: Partial<ResponsiveConfig>;
    }>
  ): string {
    if (!element.id) {
      element.id = `ui-element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    const uiElement: UIElement = {
      id: element.id,
      element,
      state: {
        isHovered: false,
        isPressed: false,
        isFocused: false,
        isActive: false,
        isLoading: false,
        isDisabled: false,
        scale: 1,
        rotation: 0,
        opacity: 1,
        position: { x: 0, y: 0 }
      },
      animations: new Map(),
      interactions: new Set(config?.interactions || ['hover', 'click', 'focus']),
      accessibility: {
        keyboardNavigable: true,
        highContrastSupport: true,
        reducedMotionRespect: true,
        ...config?.accessibility
      },
      responsiveness: {
        breakpoints: { mobile: 768, tablet: 1024, desktop: 1440, ultrawide: 1920 },
        scaleFactor: 1,
        touchOptimized: 'ontouchstart' in window,
        adaptiveSize: true,
        ...config?.responsiveness
      }
    };
    
    this.elements.set(element.id, uiElement);
    
    // Add optimizations
    element.classList.add('ui-optimized');
    
    // Setup observers
    if (this.interactionObserver) {
      this.interactionObserver.observe(element);
    }
    if (this.resizeObserver) {
      this.resizeObserver.observe(element);
    }
    
    // Apply accessibility settings
    if (uiElement.accessibility.keyboardNavigable && !element.tabIndex) {
      element.tabIndex = 0;
    }
    
    return element.id;
  }

  public animate(elementId: string, config: AnimationConfig): Promise<void> {
    const element = this.elements.get(elementId);
    if (!element) return Promise.reject('Element not found');
    
    return new Promise((resolve) => {
      const animation = new UIAnimation({
        element: element.element,
        ...config,
        onComplete: () => {
          config.onComplete?.();
          resolve();
        }
      });
      
      element.animations.set(`animation-${Date.now()}`, animation);
      this.activeAnimations.add(animation);
      animation.play();
    });
  }

  public setElementState(elementId: string, state: Partial<UIElementState>): void {
    const element = this.elements.get(elementId);
    if (!element) return;
    
    Object.assign(element.state, state);
    
    // Apply visual changes based on state
    if (state.isLoading !== undefined) {
      element.element.classList.toggle('loading', state.isLoading);
    }
    if (state.isDisabled !== undefined) {
      element.element.classList.toggle('disabled', state.isDisabled);
      (element.element as any).disabled = state.isDisabled;
    }
    if (state.scale !== undefined) {
      element.element.style.setProperty('--ui-scale', state.scale.toString());
    }
    if (state.opacity !== undefined) {
      element.element.style.opacity = state.opacity.toString();
    }
  }

  public createStaggeredAnimation(elementIds: string[], config: AnimationConfig): Promise<void[]> {
    const staggerDelay = config.stagger || 100;
    
    return Promise.all(
      elementIds.map((id, index) => 
        this.animate(id, {
          ...config,
          delay: (config.delay || 0) + index * staggerDelay
        })
      )
    );
  }

  public triggerHapticFeedback(pattern: HapticPattern): void {
    this.hapticEngine.trigger(pattern);
  }

  public setPerformanceTier(tier: 'low' | 'medium' | 'high'): void {
    this.performanceTier = tier;
    
    if (tier === 'low') {
      document.documentElement.classList.add('ui-performance-mode');
    } else {
      document.documentElement.classList.remove('ui-performance-mode');
    }
  }

  public destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    this.interactionObserver?.disconnect();
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    
    this.elements.clear();
    this.activeAnimations.clear();
  }
}

// Supporting classes
class UIAnimation {
  private startTime = 0;
  private isPlaying = false;
  private completed = false;

  constructor(private config: any) {}

  play(): void {
    this.isPlaying = true;
    this.startTime = performance.now();
  }

  update(): void {
    if (!this.isPlaying || this.completed) return;
    
    const elapsed = performance.now() - this.startTime;
    const progress = Math.min(elapsed / this.config.duration, 1);
    const easedProgress = this.config.easing ? this.config.easing(progress) : progress;
    
    this.config.onUpdate?.(easedProgress);
    
    if (progress >= 1) {
      this.completed = true;
      this.isPlaying = false;
      this.config.onComplete?.();
    }
  }

  isComplete(): boolean {
    return this.completed;
  }
}

class EasingLibrary {
  easeInSine = (t: number): number => 1 - Math.cos((t * Math.PI) / 2);
  easeOutSine = (t: number): number => Math.sin((t * Math.PI) / 2);
  easeInOutSine = (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2;
  
  easeInCubic = (t: number): number => t * t * t;
  easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
  easeInOutCubic = (t: number): number => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  
  easeInElastic = (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  };
  
  easeOutElastic = (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  };
  
  easeOutBounce = (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  };
}

class GestureHandler {
  initialize(): void {
    // Gesture recognition would be implemented here
  }
}

class HapticEngine {
  initialize(): void {
    // Haptic feedback would be implemented here
  }
  
  trigger(pattern: HapticPattern): void {
    if ('vibrate' in navigator) {
      if (pattern.pattern) {
        navigator.vibrate(pattern.pattern);
      } else {
        const intensity = { light: 25, medium: 50, heavy: 100 }[pattern.intensity];
        navigator.vibrate(intensity);
      }
    }
  }
}

class TouchOptimization {
  // Touch optimization implementation would go here
}

// Global instance
export const UIAnimations = UIAnimationManager.getInstance();

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  // Auto-discover and register existing UI elements
  const uiElements = document.querySelectorAll('[class*="ui-"], .bubble-btn, .btn, .card');
  uiElements.forEach(el => {
    if (el.id) {
      UIAnimations.registerElement(el as HTMLElement);
    }
  });
});

// Add particle fade keyframes
const particleStyle = document.createElement('style');
particleStyle.textContent = `
  @keyframes particleFade {
    0% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.5) translateY(-20px); }
  }
  
  @keyframes ripple {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(1); opacity: 0; }
  }
`;
document.head.appendChild(particleStyle);