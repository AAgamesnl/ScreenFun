/**
 * AAA-Quality Performance Monitoring & Optimization System
 * 
 * Features:
 * - Real-time performance monitoring with detailed metrics
 * - Automatic performance optimization and adaptive quality
 * - Memory management with garbage collection optimization
 * - GPU performance tracking and optimization
 * - Network performance monitoring
 * - Professional profiling and debugging tools
 * - Performance budgeting and alerts
 * - Cross-platform optimization
 */

interface PerformanceMetrics {
  fps: {
    current: number;
    average: number;
    min: number;
    max: number;
    target: number;
    samples: number[];
  };
  frameTime: {
    current: number;
    average: number;
    budget: number;
    breakdown: {
      logic: number;
      rendering: number;
      ui: number;
      network: number;
      gc: number;
    };
  };
  memory: {
    used: number;
    total: number;
    peak: number;
    allocated: number;
    freed: number;
    gcCount: number;
    gcTime: number;
  };
  gpu: {
    drawCalls: number;
    triangles: number;
    vertices: number;
    textures: number;
    shaders: number;
    buffers: number;
    memoryUsed: number;
  };
  network: {
    latency: number;
    bandwidth: number;
    packetsLost: number;
    reconnections: number;
    dataReceived: number;
    dataSent: number;
  };
  system: {
    cpuUsage: number;
    batteryLevel: number;
    thermalState: string;
    devicePixelRatio: number;
    hardwareConcurrency: number;
  };
}

interface OptimizationConfig {
  autoAdjustQuality: boolean;
  targetFPS: number;
  qualityLevels: {
    ultra: QualitySettings;
    high: QualitySettings;
    medium: QualitySettings;
    low: QualitySettings;
  };
  performanceBudgets: {
    frameTime: number;
    drawCalls: number;
    triangles: number;
    memoryMB: number;
  };
  alertThresholds: {
    lowFPS: number;
    highFrameTime: number;
    lowMemory: number;
    highLatency: number;
  };
}

interface QualitySettings {
  particleCount: number;
  shadowQuality: 'off' | 'low' | 'medium' | 'high' | 'ultra';
  postProcessing: boolean;
  antiAliasing: 'off' | 'fxaa' | 'msaa2x' | 'msaa4x' | 'msaa8x';
  textureQuality: 'low' | 'medium' | 'high' | 'ultra';
  lodLevel: number;
  renderScale: number;
  maxLights: number;
}

interface PerformanceEvent {
  type: 'fps_drop' | 'memory_spike' | 'gc_pause' | 'network_lag' | 'quality_change';
  timestamp: number;
  data: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export class PerformanceManager {
  private static instance: PerformanceManager;
  private metrics!: PerformanceMetrics;
  private config!: OptimizationConfig;
  private currentQuality: keyof OptimizationConfig['qualityLevels'] = 'high';
  
  // Performance tracking
  private frameTimeSamples: number[] = [];
  private fpsSamples: number[] = [];
  private lastFrameTime = 0;
  private frameCount = 0;
  
  // Event throttling to prevent spam
  private lastEventTimes: Map<string, number> = new Map();
  private eventThrottleMs = 1000; // Throttle events to once per second
  private startTime = performance.now();
  
  // Memory tracking
  private memoryObserver?: PerformanceObserver;
  private gcObserver?: PerformanceObserver;
  private lastGCTime = 0;
  private lastMemoryUsage = 0;
  private lastMemoryAlertTime = 0; // Throttle memory spike alerts
  private lastQualityChangeTime = 0; // Throttle quality changes
  
  // GPU tracking
  private gpuTimer?: any; // WebGL timer queries
  private renderStats = {
    drawCalls: 0,
    triangles: 0,
    vertices: 0
  };
  
  // Network monitoring
  private networkStats = {
    latency: 0,
    bandwidth: 0,
    packetsLost: 0
  };
  
  // Event system
  private eventListeners = new Map<string, Array<(event: PerformanceEvent) => void>>();
  private eventHistory: PerformanceEvent[] = [];
  
  // Optimization state
  private adaptiveQualityEnabled = true;
  private performanceProfile = 'auto';
  private optimizationTimer?: number | null;
  
  public static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

  private constructor() {
    this.initializeMetrics();
    this.initializeConfig();
    this.setupPerformanceObservers();
    this.startMonitoring();
    this.setupAdaptiveOptimization();
    this.detectDeviceCapabilities();
  }

  private initializeMetrics(): void {
    this.metrics = {
      fps: {
        current: 60,
        average: 60,
        min: 60,
        max: 60,
        target: 60,
        samples: []
      },
      frameTime: {
        current: 16.67,
        average: 16.67,
        budget: 16.67,
        breakdown: {
          logic: 0,
          rendering: 0,
          ui: 0,
          network: 0,
          gc: 0
        }
      },
      memory: {
        used: 0,
        total: 0,
        peak: 0,
        allocated: 0,
        freed: 0,
        gcCount: 0,
        gcTime: 0
      },
      gpu: {
        drawCalls: 0,
        triangles: 0,
        vertices: 0,
        textures: 0,
        shaders: 0,
        buffers: 0,
        memoryUsed: 0
      },
      network: {
        latency: 0,
        bandwidth: 0,
        packetsLost: 0,
        reconnections: 0,
        dataReceived: 0,
        dataSent: 0
      },
      system: {
        cpuUsage: 0,
        batteryLevel: 1.0,
        thermalState: 'normal',
        devicePixelRatio: window.devicePixelRatio || 1,
        hardwareConcurrency: navigator.hardwareConcurrency || 4
      }
    };
  }

  private initializeConfig(): void {
    this.config = {
      autoAdjustQuality: true,
      targetFPS: 60,
      qualityLevels: {
        ultra: {
          particleCount: 1.0,
          shadowQuality: 'ultra',
          postProcessing: true,
          antiAliasing: 'msaa4x',
          textureQuality: 'ultra',
          lodLevel: 1.0,
          renderScale: 1.0,
          maxLights: 16
        },
        high: {
          particleCount: 0.8,
          shadowQuality: 'high',
          postProcessing: true,
          antiAliasing: 'fxaa',
          textureQuality: 'high',
          lodLevel: 0.9,
          renderScale: 1.0,
          maxLights: 12
        },
        medium: {
          particleCount: 0.6,
          shadowQuality: 'medium',
          postProcessing: true,
          antiAliasing: 'fxaa',
          textureQuality: 'medium',
          lodLevel: 0.7,
          renderScale: 0.9,
          maxLights: 8
        },
        low: {
          particleCount: 0.3,
          shadowQuality: 'low',
          postProcessing: false,
          antiAliasing: 'off',
          textureQuality: 'low',
          lodLevel: 0.5,
          renderScale: 0.7,
          maxLights: 4
        }
      },
      performanceBudgets: {
        frameTime: 16.67, // 60fps
        drawCalls: 1000,
        triangles: 100000,
        memoryMB: 512
      },
      alertThresholds: {
        lowFPS: 45,
        highFrameTime: 25,
        lowMemory: 5, // MB remaining - more realistic threshold
        highLatency: 100 // ms
      }
    };
  }

  private setupPerformanceObservers(): void {
    // Memory usage observer
    if ('memory' in performance) {
      setInterval(() => {
        this.updateMemoryMetrics();
      }, 1000);
    }

    // Garbage collection observer
    if (PerformanceObserver && PerformanceObserver.supportedEntryTypes?.includes('measure')) {
      try {
        this.gcObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name.includes('gc')) {
              this.metrics.memory.gcCount++;
              this.metrics.memory.gcTime += entry.duration;
            }
          }
        });
        this.gcObserver.observe({ entryTypes: ['measure'] });
      } catch (e) {
        console.warn('GC observer not supported:', e);
      }
    }

    // Resource timing observer
    if (PerformanceObserver && PerformanceObserver.supportedEntryTypes?.includes('resource')) {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.updateNetworkMetrics(entry as PerformanceResourceTiming);
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    }

    // Navigation timing
    if (PerformanceObserver && PerformanceObserver.supportedEntryTypes?.includes('navigation')) {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.analyzeNavigationTiming(entry as PerformanceNavigationTiming);
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });
    }
  }

  private startMonitoring(): void {
    // Main performance monitoring loop
    const monitor = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastFrameTime;
      
      if (this.lastFrameTime > 0) {
        this.updateFrameMetrics(deltaTime);
        this.updateSystemMetrics();
        this.checkPerformanceThresholds();
        this.updateOptimizations();
      }
      
      this.lastFrameTime = currentTime;
      this.frameCount++;
      
      requestAnimationFrame(monitor);
    };
    
    requestAnimationFrame(monitor);
  }

  private updateOptimizations(): void {
    if (!this.adaptiveQualityEnabled) return;
    
    // Throttle quality changes to prevent flickering (max 1 change per 3 seconds)
    const now = performance.now();
    if (this.lastQualityChangeTime && (now - this.lastQualityChangeTime) < 3000) {
      return;
    }
    
    const currentFPS = this.metrics.fps.current;
    const targetFPS = this.metrics.fps.target;
    const frameTime = this.metrics.frameTime.current;
    
    // Use more conservative thresholds and require sustained performance issues
    if (currentFPS < targetFPS * 0.75 && frameTime > this.metrics.frameTime.budget * 1.3) {
      // Performance is consistently poor, consider downgrading quality
      const qualities: (keyof OptimizationConfig['qualityLevels'])[] = ['ultra', 'high', 'medium', 'low'];
      const currentIndex = qualities.indexOf(this.currentQuality);
      
      if (currentIndex < qualities.length - 1 && currentIndex >= 0) {
        const newQuality = qualities[currentIndex + 1];
        if (newQuality) {
          this.setQualityLevel(newQuality);
          this.lastQualityChangeTime = now;
          console.log(`🔽 Performance optimization: Lowered quality to ${newQuality}`);
        }
      }
    } else if (currentFPS > targetFPS * 1.15 && frameTime < this.metrics.frameTime.budget * 0.6) {
      // Performance is consistently excellent, consider upgrading quality
      const qualities: (keyof OptimizationConfig['qualityLevels'])[] = ['low', 'medium', 'high', 'ultra'];
      const currentIndex = qualities.indexOf(this.currentQuality);
      
      if (currentIndex > 0 && currentIndex < qualities.length) {
        const newQuality = qualities[currentIndex - 1];
        if (newQuality) {
          this.setQualityLevel(newQuality);
          this.lastQualityChangeTime = now;
          console.log(`🔼 Performance optimization: Increased quality to ${newQuality}`);
        }
      }
    }
  }

  private updateFrameMetrics(deltaTime: number): void {
    // Update FPS
    this.metrics.fps.current = 1000 / deltaTime;
    this.fpsSamples.push(this.metrics.fps.current);
    
    if (this.fpsSamples.length > 60) {
      this.fpsSamples.shift();
    }
    
    this.metrics.fps.average = this.fpsSamples.reduce((a, b) => a + b) / this.fpsSamples.length;
    this.metrics.fps.min = Math.min(this.metrics.fps.min, this.metrics.fps.current);
    this.metrics.fps.max = Math.max(this.metrics.fps.max, this.metrics.fps.current);

    // Update frame time
    this.metrics.frameTime.current = deltaTime;
    this.frameTimeSamples.push(deltaTime);
    
    if (this.frameTimeSamples.length > 60) {
      this.frameTimeSamples.shift();
    }
    
    this.metrics.frameTime.average = this.frameTimeSamples.reduce((a, b) => a + b) / this.frameTimeSamples.length;
  }

  private updateMemoryMetrics(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      
      this.metrics.memory.used = memory.usedJSHeapSize / 1024 / 1024; // MB
      this.metrics.memory.total = memory.totalJSHeapSize / 1024 / 1024; // MB
      this.metrics.memory.peak = Math.max(this.metrics.memory.peak, this.metrics.memory.used);
      
      // Detect memory allocation/deallocation
      const diff = this.metrics.memory.used - this.lastMemoryUsage;
      if (diff > 0) {
        this.metrics.memory.allocated += diff;
      } else if (diff < 0) {
        this.metrics.memory.freed += Math.abs(diff);
      }
      
      this.lastMemoryUsage = this.metrics.memory.used;
    }
  }

  private updateSystemMetrics(): void {
    // Update battery level if available
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        this.metrics.system.batteryLevel = battery.level;
      });
    }

    // Thermal state detection (iOS)
    if ('webkitGetGamepadAxes' in navigator) {
      // Simplified thermal state detection
      if (this.metrics.fps.average < this.config.targetFPS * 0.7) {
        this.metrics.system.thermalState = 'hot';
      } else if (this.metrics.fps.average < this.config.targetFPS * 0.9) {
        this.metrics.system.thermalState = 'warm';
      } else {
        this.metrics.system.thermalState = 'normal';
      }
    }
  }

  private updateNetworkMetrics(entry: PerformanceResourceTiming): void {
    // Calculate network latency
    const latency = entry.responseStart - entry.requestStart;
    if (latency > 0) {
      this.networkStats.latency = (this.networkStats.latency + latency) / 2; // Moving average
      this.metrics.network.latency = this.networkStats.latency;
    }

    // Update data transfer metrics
    if (entry.transferSize) {
      this.metrics.network.dataReceived += entry.transferSize;
    }
  }

  private analyzeNavigationTiming(entry: PerformanceNavigationTiming): void {
    // Analyze initial load performance - use fetchStart as fallback for navigationStart
    const startTime = (entry as any).navigationStart || entry.fetchStart;
    const loadTime = entry.loadEventEnd - startTime;
    const domContentLoaded = entry.domContentLoadedEventEnd - startTime;
    
    if (loadTime > 5000) { // 5 seconds
      this.emitEvent({
        type: 'network_lag',
        timestamp: performance.now(),
        data: { loadTime, domContentLoaded },
        severity: 'warning'
      });
    }
  }

  private checkPerformanceThresholds(): void {
    // Check FPS threshold
    if (this.metrics.fps.current < this.config.alertThresholds.lowFPS) {
      this.emitEvent({
        type: 'fps_drop',
        timestamp: performance.now(),
        data: { fps: this.metrics.fps.current, target: this.config.targetFPS },
        severity: 'warning'
      });
    }

    // Check frame time threshold
    if (this.metrics.frameTime.current > this.config.alertThresholds.highFrameTime) {
      this.emitEvent({
        type: 'fps_drop',
        timestamp: performance.now(),
        data: { frameTime: this.metrics.frameTime.current, budget: this.metrics.frameTime.budget },
        severity: 'warning'
      });
    }

    // Check memory threshold with more intelligent logic
    if (this.metrics.memory.total > 0) {
      const memoryRemaining = this.metrics.memory.total - this.metrics.memory.used;
      const memoryUsagePercent = (this.metrics.memory.used / this.metrics.memory.total) * 100;
      
      // Only alert if:
      // 1. Memory remaining is critically low (< 5MB) AND
      // 2. Memory usage is over 90% OR
      // 3. Memory usage increased significantly (>20MB) in short time
      const recentMemoryIncrease = this.metrics.memory.used - this.lastMemoryUsage;
      const shouldAlert = (
        memoryRemaining < this.config.alertThresholds.lowMemory && 
        (memoryUsagePercent > 90 || recentMemoryIncrease > 20)
      );
      
      if (shouldAlert) {
        // Throttle alerts to prevent spam (max 1 per 5 seconds)
        const now = performance.now();
        if (!this.lastMemoryAlertTime || (now - this.lastMemoryAlertTime) > 5000) {
          this.emitEvent({
            type: 'memory_spike',
            timestamp: now,
            data: { 
              used: this.metrics.memory.used, 
              remaining: memoryRemaining,
              percent: memoryUsagePercent.toFixed(1)
            },
            severity: 'error'
          });
          this.lastMemoryAlertTime = now;
        }
      }
    }

    // Check network latency
    if (this.metrics.network.latency > this.config.alertThresholds.highLatency) {
      this.emitEvent({
        type: 'network_lag',
        timestamp: performance.now(),
        data: { latency: this.metrics.network.latency },
        severity: 'warning'
      });
    }
  }

  private setupAdaptiveOptimization(): void {
    this.optimizationTimer = window.setInterval(() => {
      if (this.adaptiveQualityEnabled) {
        this.adaptQualitySettings();
      }
    }, 2000); // Check every 2 seconds
  }

  private adaptQualitySettings(): void {
    const avgFPS = this.metrics.fps.average;
    const targetFPS = this.config.targetFPS;
    const performanceRatio = avgFPS / targetFPS;
    
    let newQuality = this.currentQuality;
    
    // Determine quality level based on performance
    if (performanceRatio < 0.75) {
      // Performance is poor, decrease quality
      switch (this.currentQuality) {
        case 'ultra': newQuality = 'high'; break;
        case 'high': newQuality = 'medium'; break;
        case 'medium': newQuality = 'low'; break;
      }
    } else if (performanceRatio > 0.95) {
      // Performance is good, potentially increase quality
      switch (this.currentQuality) {
        case 'low': newQuality = 'medium'; break;
        case 'medium': newQuality = 'high'; break;
        case 'high': newQuality = 'ultra'; break;
      }
    }
    
    // Also consider system factors
    if (this.metrics.system.thermalState === 'hot') {
      newQuality = 'low';
    } else if (this.metrics.system.batteryLevel < 0.2) {
      newQuality = this.currentQuality === 'ultra' ? 'high' : this.currentQuality;
    }
    
    if (newQuality !== this.currentQuality) {
      this.setQualityLevel(newQuality);
    }
  }

  private detectDeviceCapabilities(): void {
    // Detect device type and capabilities
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (gl) {
      // Get GPU info
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        console.log('GPU:', renderer);
        
        // Adjust initial quality based on known GPU performance
        if (renderer.includes('Intel')) {
          this.currentQuality = 'medium';
        } else if (renderer.includes('Mali') || renderer.includes('Adreno')) {
          this.currentQuality = 'low';
        }
      }
    }
    
    // Device memory hint
    if ('deviceMemory' in navigator) {
      const deviceMemory = (navigator as any).deviceMemory;
      if (deviceMemory <= 2) {
        this.currentQuality = 'low';
      } else if (deviceMemory <= 4) {
        this.currentQuality = 'medium';
      }
    }
    
    // Network connection quality
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        // Reduce quality for slow connections
        this.currentQuality = 'low';
      }
    }
    
    console.log(`Initial quality level set to: ${this.currentQuality}`);
  }

  private emitEvent(event: PerformanceEvent): void {
    // Throttle events to prevent spam (except for critical quality changes)
    const eventKey = `${event.type}_${event.severity}`;
    const now = performance.now();
    const lastEventTime = this.lastEventTimes.get(eventKey) || 0;
    
    if (event.type !== 'quality_change' && now - lastEventTime < this.eventThrottleMs) {
      return; // Skip this event to prevent spam
    }
    
    this.lastEventTimes.set(eventKey, now);
    this.eventHistory.push(event);
    
    // Keep only last 100 events
    if (this.eventHistory.length > 100) {
      this.eventHistory.shift();
    }
    
    // Notify listeners
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(callback => callback(event));
    
    // Global listeners
    const globalListeners = this.eventListeners.get('*') || [];
    globalListeners.forEach(callback => callback(event));
    
    // Log critical events (throttled)
    if (event.severity === 'critical') {
      console.error('Performance Critical Event:', event);
    } else if (event.severity === 'error') {
      console.warn('Performance Error:', event);
    }
  }

  // Public API
  
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getCurrentQuality(): keyof OptimizationConfig['qualityLevels'] {
    return this.currentQuality;
  }

  public setQualityLevel(quality: keyof OptimizationConfig['qualityLevels']): void {
    if (quality === this.currentQuality) return;
    
    const oldQuality = this.currentQuality;
    this.currentQuality = quality;
    
    // Apply quality settings
    this.applyQualitySettings(this.config.qualityLevels[quality]);
    
    // Emit quality change event
    this.emitEvent({
      type: 'quality_change',
      timestamp: performance.now(),
      data: { from: oldQuality, to: quality, settings: this.config.qualityLevels[quality] },
      severity: 'info'
    });
    
    console.log(`Quality changed from ${oldQuality} to ${quality}`);
  }

  private applyQualitySettings(settings: QualitySettings): void {
    // Notify other systems of quality changes
    window.dispatchEvent(new CustomEvent('qualityChange', { 
      detail: settings 
    }));
    
    // Apply CSS variables for quality-dependent styling
    const root = document.documentElement;
    root.style.setProperty('--performance-lod', settings.lodLevel.toString());
    root.style.setProperty('--particle-count', settings.particleCount.toString());
    root.style.setProperty('--render-scale', settings.renderScale.toString());
  }

  public setAdaptiveQuality(enabled: boolean): void {
    this.adaptiveQualityEnabled = enabled;
    
    if (!enabled && this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
      this.optimizationTimer = null;
    } else if (enabled && !this.optimizationTimer) {
      this.setupAdaptiveOptimization();
    }
  }

  public setTargetFPS(fps: number): void {
    this.config.targetFPS = fps;
    this.metrics.fps.target = fps;
    this.metrics.frameTime.budget = 1000 / fps;
  }

  public addEventListener(eventType: string, callback: (event: PerformanceEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  public removeEventListener(eventType: string, callback: (event: PerformanceEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  public getEventHistory(): PerformanceEvent[] {
    return [...this.eventHistory];
  }

  // Profiling tools
  public startProfiler(name: string): void {
    performance.mark(`${name}-start`);
  }

  public endProfiler(name: string): number {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const entries = performance.getEntriesByName(name, 'measure');
    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      const duration = lastEntry?.duration || 0;
      
      // Update frame breakdown if it's a known category
      if (name in this.metrics.frameTime.breakdown) {
        (this.metrics.frameTime.breakdown as any)[name] = duration;
      }
      
      return duration;
    }
    
    return 0;
  }

  public measureAsync<T>(name: string, asyncFn: () => Promise<T>): Promise<T> {
    this.startProfiler(name);
    return asyncFn().finally(() => {
      this.endProfiler(name);
    });
  }

  // GPU performance tracking
  public recordGPUStats(stats: { drawCalls: number; triangles: number; vertices: number }): void {
    this.metrics.gpu.drawCalls = stats.drawCalls;
    this.metrics.gpu.triangles = stats.triangles;
    this.metrics.gpu.vertices = stats.vertices;
    
    // Check against budgets
    if (stats.drawCalls > this.config.performanceBudgets.drawCalls) {
      this.emitEvent({
        type: 'fps_drop',
        timestamp: performance.now(),
        data: { reason: 'excessive_draw_calls', count: stats.drawCalls },
        severity: 'warning'
      });
    }
  }

  // Memory management helpers
  public requestGarbageCollection(): void {
    if ('gc' in window) {
      (window as any).gc();
    }
  }

  public getMemoryPressure(): 'low' | 'medium' | 'high' | 'critical' {
    const usage = this.metrics.memory.used / this.metrics.memory.total;
    
    if (usage > 0.9) return 'critical';
    if (usage > 0.75) return 'high';
    if (usage > 0.5) return 'medium';
    return 'low';
  }

  // Development tools
  public exportPerformanceReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.getMetrics(),
      quality: this.getCurrentQuality(),
      events: this.getEventHistory(),
      config: this.config,
      userAgent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height,
        devicePixelRatio: window.devicePixelRatio
      }
    };
    
    return JSON.stringify(report, null, 2);
  }

  public createPerformanceOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'performance-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      font-family: monospace;
      font-size: 12px;
      border-radius: 5px;
      z-index: 10000;
      min-width: 200px;
    `;
    
    const update = () => {
      const metrics = this.getMetrics();
      overlay.innerHTML = `
        <div><strong>Performance Monitor</strong></div>
        <div>FPS: ${metrics.fps.current.toFixed(1)} (${metrics.fps.average.toFixed(1)} avg)</div>
        <div>Frame: ${metrics.frameTime.current.toFixed(1)}ms</div>
        <div>Memory: ${metrics.memory.used.toFixed(1)}MB / ${metrics.memory.total.toFixed(1)}MB</div>
        <div>GPU: ${metrics.gpu.drawCalls} draws, ${metrics.gpu.triangles} tris</div>
        <div>Quality: ${this.getCurrentQuality()}</div>
        <div>LOD: ${this.config.qualityLevels[this.currentQuality].lodLevel}</div>
      `;
    };
    
    // Update every 100ms
    setInterval(update, 100);
    update();
    
    return overlay;
  }

  public destroy(): void {
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
    }
    
    if (this.memoryObserver) {
      this.memoryObserver.disconnect();
    }
    
    if (this.gcObserver) {
      this.gcObserver.disconnect();
    }
    
    this.eventListeners.clear();
    this.eventHistory.length = 0;
  }
}

// Global instance and utilities
export const Performance = PerformanceManager.getInstance();

// Performance decorator for functions
export function measurePerformance(name: string) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      Performance.startProfiler(name);
      try {
        const result = method.apply(this, args);
        if (result instanceof Promise) {
          return result.finally(() => Performance.endProfiler(name));
        } else {
          Performance.endProfiler(name);
          return result;
        }
      } catch (error) {
        Performance.endProfiler(name);
        throw error;
      }
    };
  };
}

// Performance overlay disabled for production build
// Can be manually enabled with localStorage.setItem('debug-performance', 'true') if needed
const isDevelopment = false; // Disabled performance monitor overlay
if (isDevelopment) {
  document.addEventListener('DOMContentLoaded', () => {
    const overlay = Performance.createPerformanceOverlay();
    document.body.appendChild(overlay);
    
    // Toggle with Ctrl+Shift+P
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
      }
    });
  });
}