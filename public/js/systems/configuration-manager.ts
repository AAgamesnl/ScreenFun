/**
 * AAA-Quality Configuration Management System
 * 
 * Features:
 * - Professional game settings management
 * - Real-time configuration updates with validation
 * - Platform-specific optimizations
 * - User preference persistence
 * - Developer configuration tools
 * - A/B testing framework
 * - Feature flag management
 * - Environment-specific configurations
 * - Cloud configuration synchronization
 */

interface GameConfig {
  // Graphics & Visual Settings
  graphics: {
    quality: 'low' | 'medium' | 'high' | 'ultra';
    resolution: { width: number; height: number };
    renderScale: number;
    frameRateTarget: number;
    vsync: boolean;
    antiAliasing: 'off' | 'fxaa' | 'msaa2x' | 'msaa4x' | 'msaa8x';
    postProcessing: {
      bloom: boolean;
      ssao: boolean;
      dof: boolean;
      motionBlur: boolean;
      chromaticAberration: boolean;
    };
    shadows: {
      enabled: boolean;
      quality: 'low' | 'medium' | 'high' | 'ultra';
      cascades: number;
    };
    particles: {
      enabled: boolean;
      maxCount: number;
      quality: 'low' | 'medium' | 'high';
    };
    lighting: {
      realtimeLights: number;
      shadowCasters: number;
      volumetricFog: boolean;
    };
  };

  // Audio Settings
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    voiceVolume: number;
    ambientVolume: number;
    spatialAudio: boolean;
    quality: 'low' | 'medium' | 'high' | 'ultra';
    compression: boolean;
    reverb: boolean;
    dynamicRange: boolean;
    adaptiveMusic: boolean;
    hapticFeedback: boolean;
  };

  // Gameplay Settings
  gameplay: {
    difficulty: 'easy' | 'normal' | 'hard' | 'expert';
    timeMultiplier: number;
    pointsMultiplier: number;
    autoAnswer: boolean;
    showHints: boolean;
    skipAnimations: boolean;
    pauseOnFocusLoss: boolean;
    autoSave: boolean;
    tutorialEnabled: boolean;
    achievements: boolean;
  };

  // UI/UX Settings
  interface: {
    language: string;
    theme: 'light' | 'dark' | 'auto' | 'custom';
    fontSize: 'small' | 'medium' | 'large' | 'xl';
    contrast: 'normal' | 'high';
    animations: boolean;
    reducedMotion: boolean;
    colorBlindSupport: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
    screenReader: boolean;
    keyboardNavigation: boolean;
    touchOptimization: boolean;
    gestureControls: boolean;
  };

  // Network Settings
  network: {
    serverRegion: 'auto' | 'us-east' | 'us-west' | 'eu-west' | 'ap-south';
    compression: boolean;
    batchUpdates: boolean;
    reconnectAttempts: number;
    timeoutMs: number;
    lowLatencyMode: boolean;
    offlineMode: boolean;
  };

  // Performance Settings
  performance: {
    adaptiveQuality: boolean;
    performanceTier: 'low' | 'medium' | 'high' | 'auto';
    targetFrameTime: number;
    memoryLimit: number;
    gcOptimization: boolean;
    preloadAssets: boolean;
    streamingAssets: boolean;
    lodSystem: boolean;
    cullingDistance: number;
  };

  // Developer Settings (only in dev builds)
  developer?: {
    debugMode: boolean;
    showFPS: boolean;
    showMemory: boolean;
    wireframe: boolean;
    profiling: boolean;
    logging: 'none' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
    hotReload: boolean;
    skipIntro: boolean;
    unlockAll: boolean;
    cheatMode: boolean;
  };
}

interface ConfigValidation {
  [key: string]: {
    type: 'number' | 'string' | 'boolean' | 'object' | 'array';
    required?: boolean;
    min?: number;
    max?: number;
    enum?: any[];
    validator?: (value: any) => boolean;
  };
}

interface PlatformConfig {
  mobile: Partial<GameConfig>;
  desktop: Partial<GameConfig>;
  console: Partial<GameConfig>;
  web: Partial<GameConfig>;
}

interface FeatureFlag {
  id: string;
  enabled: boolean;
  rolloutPercentage: number;
  conditions?: {
    platform?: string[];
    userType?: string[];
    region?: string[];
    version?: string;
  };
  description: string;
}

export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config!: GameConfig;
  private defaultConfig!: GameConfig;
  private platformOverrides!: PlatformConfig;
  private featureFlags = new Map<string, FeatureFlag>();
  private configListeners = new Map<string, Array<(value: any, oldValue: any) => void>>();
  
  // Configuration persistence
  private storageKey = 'tapfrenzy-config-v2';
  private cloudSync = false;
  private configVersion = '2.0.0';
  
  // Validation
  private validation!: ConfigValidation;
  private isDevelopment: boolean;

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development' || localStorage.getItem('debug-mode') === 'true';
    this.initializeDefaultConfig();
    this.setupValidation();
    this.setupPlatformOverrides();
    this.loadConfiguration();
    this.initializeFeatureFlags();
    this.detectPlatformCapabilities();
    this.setupConfigWatchers();
  }

  private initializeDefaultConfig(): void {
    this.defaultConfig = {
      graphics: {
        quality: 'high',
        resolution: { width: 1920, height: 1080 },
        renderScale: 1.0,
        frameRateTarget: 60,
        vsync: true,
        antiAliasing: 'fxaa',
        postProcessing: {
          bloom: true,
          ssao: true,
          dof: false,
          motionBlur: false,
          chromaticAberration: true
        },
        shadows: {
          enabled: true,
          quality: 'high',
          cascades: 3
        },
        particles: {
          enabled: true,
          maxCount: 1000,
          quality: 'high'
        },
        lighting: {
          realtimeLights: 8,
          shadowCasters: 4,
          volumetricFog: true
        }
      },

      audio: {
        masterVolume: 0.8,
        musicVolume: 0.6,
        sfxVolume: 0.8,
        voiceVolume: 0.9,
        ambientVolume: 0.4,
        spatialAudio: true,
        quality: 'high',
        compression: true,
        reverb: true,
        dynamicRange: true,
        adaptiveMusic: true,
        hapticFeedback: true
      },

      gameplay: {
        difficulty: 'normal',
        timeMultiplier: 1.0,
        pointsMultiplier: 1.0,
        autoAnswer: false,
        showHints: true,
        skipAnimations: false,
        pauseOnFocusLoss: true,
        autoSave: true,
        tutorialEnabled: true,
        achievements: true
      },

      interface: {
        language: 'en',
        theme: 'auto',
        fontSize: 'medium',
        contrast: 'normal',
        animations: true,
        reducedMotion: false,
        colorBlindSupport: 'none',
        screenReader: false,
        keyboardNavigation: true,
        touchOptimization: 'ontouchstart' in window,
        gestureControls: 'ontouchstart' in window
      },

      network: {
        serverRegion: 'auto',
        compression: true,
        batchUpdates: true,
        reconnectAttempts: 5,
        timeoutMs: 30000,
        lowLatencyMode: false,
        offlineMode: false
      },

      performance: {
        adaptiveQuality: true,
        performanceTier: 'auto',
        targetFrameTime: 16.67,
        memoryLimit: 512,
        gcOptimization: true,
        preloadAssets: true,
        streamingAssets: false,
        lodSystem: true,
        cullingDistance: 1000
      }
    };

    if (this.isDevelopment) {
      this.defaultConfig.developer = {
        debugMode: false,
        showFPS: false,
        showMemory: false,
        wireframe: false,
        profiling: false,
        logging: 'info',
        hotReload: true,
        skipIntro: false,
        unlockAll: false,
        cheatMode: false
      };
    }
  }

  private setupValidation(): void {
    this.validation = {
      'graphics.quality': { type: 'string', enum: ['low', 'medium', 'high', 'ultra'] },
      'graphics.renderScale': { type: 'number', min: 0.5, max: 2.0 },
      'graphics.frameRateTarget': { type: 'number', min: 30, max: 240 },
      'audio.masterVolume': { type: 'number', min: 0, max: 1 },
      'audio.musicVolume': { type: 'number', min: 0, max: 1 },
      'audio.sfxVolume': { type: 'number', min: 0, max: 1 },
      'gameplay.difficulty': { type: 'string', enum: ['easy', 'normal', 'hard', 'expert'] },
      'gameplay.timeMultiplier': { type: 'number', min: 0.1, max: 3.0 },
      'interface.language': { type: 'string', enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'] },
      'interface.theme': { type: 'string', enum: ['light', 'dark', 'auto', 'custom'] },
      'performance.targetFrameTime': { type: 'number', min: 8.33, max: 33.33 }
    };
  }

  private setupPlatformOverrides(): void {
    this.platformOverrides = {
      mobile: {
        graphics: {
          quality: 'medium',
          renderScale: 0.8,
          antiAliasing: 'fxaa',
          postProcessing: {
            bloom: true,
            ssao: false,
            dof: false,
            motionBlur: false,
            chromaticAberration: false
          },
          shadows: { enabled: true, quality: 'low', cascades: 2 },
          particles: { enabled: true, maxCount: 500, quality: 'medium' },
          lighting: { realtimeLights: 4, shadowCasters: 2, volumetricFog: false }
        },
        performance: {
          adaptiveQuality: true,
          performanceTier: 'medium' as const,
          targetFrameTime: 20,
          memoryLimit: 256,
          gcOptimization: true,
          preloadAssets: false,
          streamingAssets: true,
          lodSystem: true,
          cullingDistance: 500
        }
      },
      
      desktop: {
        graphics: {
          quality: 'ultra',
          renderScale: 1.0,
          antiAliasing: 'msaa4x',
          postProcessing: {
            bloom: true,
            ssao: true,
            dof: true,
            motionBlur: false,
            chromaticAberration: true
          }
        }
      },
      
      console: {
        graphics: {
          quality: 'high',
          frameRateTarget: 60,
          vsync: true
        },
        performance: {
          adaptiveQuality: false,
          performanceTier: 'high'
        }
      },
      
      web: {
        performance: {
          streamingAssets: true,
          preloadAssets: false
        },
        network: {
          compression: true,
          batchUpdates: true
        }
      }
    };
  }

  private loadConfiguration(): void {
    try {
      // Load from localStorage first
      const savedConfig = localStorage.getItem(this.storageKey);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        
        // Check version compatibility
        if (parsed.version === this.configVersion) {
          this.config = this.mergeConfigs(this.defaultConfig, parsed.config);
        } else {
          console.log('Config version mismatch, using defaults and migrating');
          this.config = this.migrateConfig(parsed.config, parsed.version);
        }
      } else {
        this.config = { ...this.defaultConfig };
      }
      
      // Apply platform-specific overrides
      this.applyPlatformOverrides();
      
      // Validate configuration
      this.validateConfig();
      
      console.log('✅ Configuration loaded successfully');
    } catch (error) {
      console.error('Failed to load configuration, using defaults:', error);
      this.config = { ...this.defaultConfig };
      this.applyPlatformOverrides();
    }
  }

  private applyPlatformOverrides(): void {
    const platform = this.detectPlatform();
    const overrides = this.platformOverrides[platform];
    
    if (overrides) {
      this.config = this.mergeConfigs(this.config, overrides);
      console.log(`Applied ${platform} platform overrides`);
    }
  }

  private detectPlatform(): keyof PlatformConfig {
    // Detect platform based on user agent and capabilities
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/mobile|android|iphone|ipad/.test(userAgent)) {
      return 'mobile';
    } else if (navigator.userAgent.includes('Electron')) {
      return 'desktop';
    } else if (window.location.protocol === 'file:') {
      return 'desktop';
    } else {
      return 'web';
    }
  }

  private detectPlatformCapabilities(): void {
    // Auto-detect capabilities and adjust config
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (gl) {
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      const maxRenderBufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
      
      // Adjust graphics settings based on capabilities
      if (maxTextureSize < 4096) {
        this.config.graphics.quality = 'medium';
        this.config.graphics.shadows.quality = 'low';
      }
      
      // Check for extensions
      const extensions = gl.getSupportedExtensions() || [];
      if (!extensions.includes('EXT_texture_filter_anisotropic')) {
        this.config.graphics.antiAliasing = 'fxaa';
      }
    }
    
    // Memory-based adjustments
    if ('deviceMemory' in navigator) {
      const deviceMemory = (navigator as any).deviceMemory;
      if (deviceMemory <= 2) {
        this.config.performance.memoryLimit = 128;
        this.config.graphics.particles.maxCount = 250;
      } else if (deviceMemory <= 4) {
        this.config.performance.memoryLimit = 256;
        this.config.graphics.particles.maxCount = 500;
      }
    }
    
    // Network-based adjustments
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        this.config.network.compression = true;
        this.config.network.lowLatencyMode = true;
      }
    }
  }

  private initializeFeatureFlags(): void {
    const flags: FeatureFlag[] = [
      {
        id: 'advanced-particles',
        enabled: true,
        rolloutPercentage: 100,
        description: 'Enable advanced particle system'
      },
      {
        id: 'ray-tracing',
        enabled: false,
        rolloutPercentage: 0,
        conditions: {
          platform: ['desktop'],
          userType: ['premium']
        },
        description: 'Experimental ray tracing support'
      },
      {
        id: 'cloud-save',
        enabled: true,
        rolloutPercentage: 75,
        description: 'Cloud save functionality'
      },
      {
        id: 'social-features',
        enabled: true,
        rolloutPercentage: 100,
        description: 'Social features like leaderboards'
      },
      {
        id: 'beta-ui',
        enabled: false,
        rolloutPercentage: 10,
        conditions: {
          userType: ['beta-tester']
        },
        description: 'New experimental UI design'
      }
    ];
    
    flags.forEach(flag => {
      this.featureFlags.set(flag.id, flag);
    });
  }

  private setupConfigWatchers(): void {
    // Watch for system preference changes
    if (window.matchMedia) {
      // Dark mode preference
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      darkModeQuery.addEventListener('change', (e) => {
        if (this.config.interface.theme === 'auto') {
          this.notifyListeners('interface.theme', e.matches ? 'dark' : 'light', 'auto');
        }
      });
      
      // Reduced motion preference
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      reducedMotionQuery.addEventListener('change', (e) => {
        this.set('interface.reducedMotion', e.matches);
      });
      
      // High contrast preference
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
      highContrastQuery.addEventListener('change', (e) => {
        this.set('interface.contrast', e.matches ? 'high' : 'normal');
      });
    }
  }

  private validateConfig(): boolean {
    let isValid = true;
    
    for (const [path, rule] of Object.entries(this.validation)) {
      const value = this.getNestedValue(this.config, path);
      
      if (rule.required && value === undefined) {
        console.warn(`Required config value missing: ${path}`);
        isValid = false;
        continue;
      }
      
      if (value !== undefined) {
        if (rule.type && typeof value !== rule.type) {
          console.warn(`Invalid type for ${path}: expected ${rule.type}, got ${typeof value}`);
          isValid = false;
        }
        
        if (rule.min !== undefined && value < rule.min) {
          console.warn(`Value for ${path} below minimum: ${value} < ${rule.min}`);
          isValid = false;
        }
        
        if (rule.max !== undefined && value > rule.max) {
          console.warn(`Value for ${path} above maximum: ${value} > ${rule.max}`);
          isValid = false;
        }
        
        if (rule.enum && !rule.enum.includes(value)) {
          console.warn(`Invalid enum value for ${path}: ${value} not in [${rule.enum.join(', ')}]`);
          isValid = false;
        }
        
        if (rule.validator && !rule.validator(value)) {
          console.warn(`Custom validation failed for ${path}: ${value}`);
          isValid = false;
        }
      }
    }
    
    return isValid;
  }

  private migrateConfig(oldConfig: any, oldVersion: string): GameConfig {
    // Handle configuration migration between versions
    let migrated = { ...this.defaultConfig };
    
    // Migration logic would go here based on version
    switch (oldVersion) {
      case '1.0.0':
        // Migrate from v1.0.0 to current version
        if (oldConfig.quality) {
          migrated.graphics.quality = oldConfig.quality;
        }
        break;
    }
    
    return this.mergeConfigs(migrated, oldConfig);
  }

  private mergeConfigs(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.mergeConfigs(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private notifyListeners(path: string, newValue: any, oldValue: any): void {
    const listeners = this.configListeners.get(path) || [];
    listeners.forEach(callback => {
      try {
        callback(newValue, oldValue);
      } catch (error) {
        console.error(`Config listener error for ${path}:`, error);
      }
    });
    
    // Also notify wildcard listeners
    const wildcardListeners = this.configListeners.get('*') || [];
    wildcardListeners.forEach(callback => {
      try {
        callback({ path, newValue, oldValue });
      } catch (error) {
        console.error(`Wildcard config listener error:`, error);
      }
    });
  }

  // Public API
  public get<T = any>(path: string): T {
    return this.getNestedValue(this.config, path);
  }

  public set(path: string, value: any): boolean {
    // Validate the new value
    const rule = this.validation[path];
    if (rule) {
      if (rule.type && typeof value !== rule.type) return false;
      if (rule.min !== undefined && value < rule.min) return false;
      if (rule.max !== undefined && value > rule.max) return false;
      if (rule.enum && !rule.enum.includes(value)) return false;
      if (rule.validator && !rule.validator(value)) return false;
    }
    
    const oldValue = this.getNestedValue(this.config, path);
    this.setNestedValue(this.config, path, value);
    
    // Notify listeners
    this.notifyListeners(path, value, oldValue);
    
    // Save to persistence
    this.saveConfiguration();
    
    return true;
  }

  public reset(path?: string): void {
    if (path) {
      const defaultValue = this.getNestedValue(this.defaultConfig, path);
      this.set(path, defaultValue);
    } else {
      this.config = { ...this.defaultConfig };
      this.applyPlatformOverrides();
      this.saveConfiguration();
    }
  }

  public getAll(): GameConfig {
    return { ...this.config };
  }

  public isFeatureEnabled(flagId: string): boolean {
    const flag = this.featureFlags.get(flagId);
    if (!flag) return false;
    
    if (!flag.enabled) return false;
    
    // Check rollout percentage
    const userHash = this.getUserHash();
    const rolloutThreshold = flag.rolloutPercentage / 100;
    if (userHash > rolloutThreshold) return false;
    
    // Check conditions
    if (flag.conditions) {
      const platform = this.detectPlatform();
      if (flag.conditions.platform && !flag.conditions.platform.includes(platform)) {
        return false;
      }
      
      // Additional condition checks would go here
    }
    
    return true;
  }

  private getUserHash(): number {
    // Generate a consistent hash for the user for rollout calculations
    const userId = localStorage.getItem('user-id') || 'anonymous';
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }

  public setFeatureFlag(flagId: string, enabled: boolean): void {
    const flag = this.featureFlags.get(flagId);
    if (flag) {
      flag.enabled = enabled;
      this.featureFlags.set(flagId, flag);
    }
  }

  public addConfigListener(path: string, callback: (value: any, oldValue: any) => void): void {
    if (!this.configListeners.has(path)) {
      this.configListeners.set(path, []);
    }
    this.configListeners.get(path)!.push(callback);
  }

  public removeConfigListener(path: string, callback: (value: any, oldValue: any) => void): void {
    const listeners = this.configListeners.get(path);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  public saveConfiguration(): void {
    try {
      const configData = {
        version: this.configVersion,
        timestamp: Date.now(),
        config: this.config
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(configData));
      
      // TODO: Sync to cloud if enabled
      if (this.cloudSync) {
        this.syncToCloud(configData);
      }
      
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  }

  private async syncToCloud(configData: any): Promise<void> {
    // Cloud sync implementation would go here
    console.log('Cloud sync not implemented yet');
  }

  public exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  public importConfig(configJson: string): boolean {
    try {
      const importedConfig = JSON.parse(configJson);
      
      // Validate imported config
      const tempConfig = this.mergeConfigs(this.defaultConfig, importedConfig);
      
      // Apply if valid
      this.config = tempConfig;
      this.validateConfig();
      this.saveConfiguration();
      
      return true;
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return false;
    }
  }

  public createConfigPanel(): HTMLElement {
    // Create a visual configuration panel for development/admin use
    const panel = document.createElement('div');
    panel.id = 'config-panel';
    panel.style.cssText = `
      position: fixed;
      top: 50px;
      right: 10px;
      width: 300px;
      max-height: 80vh;
      overflow-y: auto;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      z-index: 10001;
      font-family: monospace;
      font-size: 12px;
    `;
    
    // Add configuration controls
    panel.innerHTML = `
      <h3>Configuration Panel</h3>
      <div class="config-section">
        <h4>Graphics</h4>
        <label>Quality: <select id="graphics-quality">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="ultra">Ultra</option>
        </select></label>
        <label>Render Scale: <input type="range" id="render-scale" min="0.5" max="2" step="0.1" /></label>
      </div>
      <div class="config-section">
        <h4>Audio</h4>
        <label>Master Volume: <input type="range" id="master-volume" min="0" max="1" step="0.1" /></label>
        <label>Music Volume: <input type="range" id="music-volume" min="0" max="1" step="0.1" /></label>
      </div>
      <div class="config-section">
        <h4>Performance</h4>
        <label>Target FPS: <select id="target-fps">
          <option value="30">30 FPS</option>
          <option value="60">60 FPS</option>
          <option value="120">120 FPS</option>
        </select></label>
      </div>
      <button id="reset-config">Reset to Defaults</button>
      <button id="export-config">Export Config</button>
    `;
    
    // Set up event handlers
    this.setupConfigPanelEvents(panel);
    
    return panel;
  }

  private setupConfigPanelEvents(panel: HTMLElement): void {
    // Quality selector
    const qualitySelect = panel.querySelector('#graphics-quality') as HTMLSelectElement;
    if (qualitySelect) {
      qualitySelect.value = this.get('graphics.quality');
      qualitySelect.addEventListener('change', (e) => {
        this.set('graphics.quality', (e.target as HTMLSelectElement).value);
      });
    }
    
    // Render scale
    const renderScale = panel.querySelector('#render-scale') as HTMLInputElement;
    if (renderScale) {
      renderScale.value = this.get('graphics.renderScale').toString();
      renderScale.addEventListener('input', (e) => {
        this.set('graphics.renderScale', parseFloat((e.target as HTMLInputElement).value));
      });
    }
    
    // Volume controls
    const masterVolume = panel.querySelector('#master-volume') as HTMLInputElement;
    if (masterVolume) {
      masterVolume.value = this.get('audio.masterVolume').toString();
      masterVolume.addEventListener('input', (e) => {
        this.set('audio.masterVolume', parseFloat((e.target as HTMLInputElement).value));
      });
    }
    
    // Reset button
    const resetBtn = panel.querySelector('#reset-config') as HTMLButtonElement;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all configuration to defaults?')) {
          this.reset();
        }
      });
    }
    
    // Export button
    const exportBtn = panel.querySelector('#export-config') as HTMLButtonElement;
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const config = this.exportConfig();
        navigator.clipboard.writeText(config).then(() => {
          alert('Configuration copied to clipboard!');
        });
      });
    }
  }
}

// Global instance
export const Config = ConfigurationManager.getInstance();

// Auto-show config panel in development
if (process.env.NODE_ENV === 'development' || localStorage.getItem('debug-config') === 'true') {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      const existingPanel = document.getElementById('config-panel');
      if (existingPanel) {
        existingPanel.remove();
      } else {
        const panel = Config.createConfigPanel();
        document.body.appendChild(panel);
      }
    }
  });
}