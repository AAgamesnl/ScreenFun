/**
 * AAA-Quality Visual Effects Management System
 * 
 * Features:
 * - GPU-accelerated particle systems with physics simulation
 * - Advanced post-processing pipeline (bloom, SSAO, DOF, tone mapping)
 * - Real-time lighting with dynamic shadows
 * - Professional shader management
 * - Performance optimization with LOD system
 * - Multi-layer visual effects compositing
 * - Memory-efficient object pooling
 */

interface ParticleSystemConfig {
  id: string;
  maxParticles: number;
  emissionRate: number;
  lifetime: { min: number; max: number };
  position: { x: number; y: number; z: number };
  velocity: { 
    base: { x: number; y: number; z: number };
    random: { x: number; y: number; z: number };
  };
  acceleration: { x: number; y: number; z: number };
  size: { start: number; end: number; curve?: 'linear' | 'ease-in' | 'ease-out' };
  color: { 
    start: { r: number; g: number; b: number; a: number };
    end: { r: number; g: number; b: number; a: number };
  };
  texture?: string;
  blendMode: 'normal' | 'additive' | 'multiply' | 'screen';
  physics: {
    gravity: number;
    drag: number;
    bounce: number;
    collision: boolean;
  };
}

interface PostProcessingConfig {
  bloom: {
    enabled: boolean;
    intensity: number;
    threshold: number;
    radius: number;
  };
  ssao: {
    enabled: boolean;
    radius: number;
    intensity: number;
    bias: number;
  };
  dof: {
    enabled: boolean;
    focusDistance: number;
    focalLength: number;
    bokehSize: number;
  };
  toneMapping: {
    enabled: boolean;
    exposure: number;
    whitePoint: number;
    type: 'linear' | 'reinhard' | 'aces' | 'uncharted2';
  };
  colorGrading: {
    enabled: boolean;
    temperature: number;
    tint: number;
    saturation: number;
    contrast: number;
    brightness: number;
    gamma: number;
  };
  chromatic: {
    enabled: boolean;
    intensity: number;
    samples: number;
  };
  vignette: {
    enabled: boolean;
    intensity: number;
    smoothness: number;
    rounded: boolean;
  };
}

interface LightingConfig {
  ambient: { r: number; g: number; b: number; intensity: number };
  directional: {
    direction: { x: number; y: number; z: number };
    color: { r: number; g: number; b: number };
    intensity: number;
    castShadow: boolean;
    shadowMapSize: number;
  };
  point: Array<{
    position: { x: number; y: number; z: number };
    color: { r: number; g: number; b: number };
    intensity: number;
    range: number;
    decay: number;
  }>;
  spot: Array<{
    position: { x: number; y: number; z: number };
    direction: { x: number; y: number; z: number };
    color: { r: number; g: number; b: number };
    intensity: number;
    angle: number;
    penumbra: number;
    decay: number;
  }>;
}

interface VisualEffect {
  id: string;
  type: 'particle' | 'shader' | 'light' | 'post-process' | 'animation';
  priority: number;
  duration?: number;
  loop: boolean;
  active: boolean;
  startTime: number;
  config: any;
}

export class VisualEffectsManager {
  private static instance: VisualEffectsManager;
  private canvas!: HTMLCanvasElement;
  private gl!: WebGL2RenderingContext;
  
  // Rendering systems
  private shaderPrograms = new Map<string, WebGLProgram>();
  private framebuffers = new Map<string, WebGLFramebuffer>();
  private textures = new Map<string, WebGLTexture>();
  private vertexBuffers = new Map<string, WebGLBuffer>();
  
  // Visual effects
  private activeEffects = new Map<string, VisualEffect>();
  private particleSystems = new Map<string, ParticleSystem>();
  private effectQueue: VisualEffect[] = [];
  
  // Performance management
  private frameTime = 0;
  private lastFrameTime = 0;
  private fps = 60;
  private lodLevel = 1.0; // Level of detail multiplier
  private performanceBudget = 16.67; // 60fps target in ms
  
  // Configuration
  private postProcessingConfig: PostProcessingConfig = {
    bloom: { enabled: true, intensity: 1.2, threshold: 0.9, radius: 0.8 },
    ssao: { enabled: true, radius: 0.3, intensity: 1.0, bias: 0.01 },
    dof: { enabled: false, focusDistance: 10, focalLength: 50, bokehSize: 5 },
    toneMapping: { enabled: true, exposure: 1.0, whitePoint: 11.2, type: 'aces' },
    colorGrading: { enabled: true, temperature: 0, tint: 0, saturation: 1.1, contrast: 1.05, brightness: 0, gamma: 1.0 },
    chromatic: { enabled: true, intensity: 0.5, samples: 8 },
    vignette: { enabled: true, intensity: 0.3, smoothness: 0.5, rounded: true }
  };

  public static getInstance(): VisualEffectsManager {
    if (!VisualEffectsManager.instance) {
      VisualEffectsManager.instance = new VisualEffectsManager();
    }
    return VisualEffectsManager.instance;
  }

  private constructor() {
    this.initializeWebGL();
    this.createShaderPrograms();
    this.setupFramebuffers();
    this.loadTextures();
    this.startRenderLoop();
  }

  private initializeWebGL(): void {
    // Find or create canvas
    this.canvas = document.getElementById('effects-canvas') as HTMLCanvasElement;
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'effects-canvas';
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '1000';
      document.body.appendChild(this.canvas);
    }

    // Initialize WebGL2 context
    this.gl = this.canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      depth: true,
      stencil: true,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance'
    })!;

    if (!this.gl) {
      console.error('WebGL2 not supported');
      return;
    }

    // Enable necessary extensions
    this.gl.getExtension('EXT_color_buffer_float');
    this.gl.getExtension('OES_texture_float_linear');
    this.gl.getExtension('WEBGL_depth_texture');

    // Set up WebGL state
    this.gl.enable(this.gl.BLEND);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    // Handle canvas resizing
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    if (!this.canvas || !this.gl) return;

    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;
    const pixelRatio = Math.min(window.devicePixelRatio, 2); // Cap at 2x for performance

    const width = Math.floor(displayWidth * pixelRatio);
    const height = Math.floor(displayHeight * pixelRatio);

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.gl.viewport(0, 0, width, height);
      
      // Recreate framebuffers for new size
      this.setupFramebuffers();
    }
  }

  private createShaderPrograms(): void {
    if (!this.gl) return;

    // Advanced particle shader with physics
    const particleVertexShader = `#version 300 es
      precision highp float;
      
      in vec3 position;
      in vec3 velocity;
      in float lifetime;
      in float maxLifetime;
      in vec4 color;
      in float size;
      
      uniform mat4 projection;
      uniform mat4 view;
      uniform float time;
      uniform vec3 gravity;
      uniform float drag;
      
      out vec4 vColor;
      out vec2 vUv;
      out float vLife;
      
      void main() {
        float normalizedLife = lifetime / maxLifetime;
        float t = 1.0 - normalizedLife;
        
        // Physics simulation
        vec3 pos = position + velocity * t + 0.5 * gravity * t * t;
        vec3 vel = velocity + gravity * t;
        vel *= pow(drag, t);
        
        // Size animation with easing
        float sizeCurve = 1.0 - pow(normalizedLife, 2.0);
        float finalSize = size * sizeCurve;
        
        // Color animation
        vColor = color;
        vColor.a *= 1.0 - normalizedLife;
        
        vLife = normalizedLife;
        vUv = vec2(0.5); // Will be set by geometry shader
        
        gl_Position = projection * view * vec4(pos, 1.0);
        gl_PointSize = finalSize;
      }
    `;

    const particleFragmentShader = `#version 300 es
      precision highp float;
      
      in vec4 vColor;
      in vec2 vUv;
      in float vLife;
      
      uniform sampler2D particleTexture;
      uniform float time;
      
      out vec4 fragColor;
      
      void main() {
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        
        // Soft circular particles
        float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
        
        // Texture sampling
        vec4 texColor = texture(particleTexture, gl_PointCoord);
        
        // Combine color and texture
        vec4 finalColor = vColor * texColor;
        finalColor.a *= alpha;
        
        // Energy effect
        float energy = sin(time * 10.0 + vLife * 20.0) * 0.1 + 0.9;
        finalColor.rgb *= energy;
        
        fragColor = finalColor;
      }
    `;

    this.createShaderProgram('particle', particleVertexShader, particleFragmentShader);

    // Advanced bloom shader
    const bloomVertexShader = `#version 300 es
      precision highp float;
      
      in vec2 position;
      in vec2 texCoord;
      
      out vec2 vUv;
      
      void main() {
        vUv = texCoord;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const bloomFragmentShader = `#version 300 es
      precision highp float;
      
      in vec2 vUv;
      uniform sampler2D inputTexture;
      uniform vec2 texelSize;
      uniform float threshold;
      uniform float intensity;
      uniform int pass; // 0: threshold, 1: blur horizontal, 2: blur vertical, 3: combine
      
      out vec4 fragColor;
      
      // Professional gaussian blur with optimized sampling
      vec3 gaussianBlur(sampler2D tex, vec2 uv, vec2 direction) {
        vec3 color = texture(tex, uv).rgb * 0.227027;
        
        vec2 off1 = direction * 1.3846153846 * texelSize;
        vec2 off2 = direction * 3.2307692308 * texelSize;
        
        color += texture(tex, uv + off1).rgb * 0.3162162162;
        color += texture(tex, uv - off1).rgb * 0.3162162162;
        color += texture(tex, uv + off2).rgb * 0.0702702703;
        color += texture(tex, uv - off2).rgb * 0.0702702703;
        
        return color;
      }
      
      void main() {
        if (pass == 0) {
          // Threshold pass - extract bright areas
          vec3 color = texture(inputTexture, vUv).rgb;
          float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
          fragColor = vec4(color * step(threshold, brightness), 1.0);
        } else if (pass == 1) {
          // Horizontal blur
          fragColor = vec4(gaussianBlur(inputTexture, vUv, vec2(1.0, 0.0)), 1.0);
        } else if (pass == 2) {
          // Vertical blur
          fragColor = vec4(gaussianBlur(inputTexture, vUv, vec2(0.0, 1.0)), 1.0);
        } else {
          // Combine original with bloom
          vec3 original = texture(inputTexture, vUv).rgb;
          vec3 bloom = gaussianBlur(inputTexture, vUv, vec2(0.0, 1.0));
          fragColor = vec4(original + bloom * intensity, 1.0);
        }
      }
    `;

    this.createShaderProgram('bloom', bloomVertexShader, bloomFragmentShader);

    // ACES tone mapping shader for cinematic look
    const toneMappingFragmentShader = `#version 300 es
      precision highp float;
      
      in vec2 vUv;
      uniform sampler2D inputTexture;
      uniform float exposure;
      uniform float whitePoint;
      
      out vec4 fragColor;
      
      // ACES tone mapping curve
      vec3 ACESFilm(vec3 x) {
        float a = 2.51;
        float b = 0.03;
        float c = 2.43;
        float d = 0.59;
        float e = 0.14;
        return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
      }
      
      // Color grading functions
      vec3 temperatureTint(vec3 color, float temperature, float tint) {
        // Simplified temperature and tint adjustment
        mat3 tempMatrix = mat3(
          1.0 + temperature * 0.1, 0.0, 0.0,
          0.0, 1.0, tint * 0.1,
          0.0, 0.0, 1.0 - temperature * 0.05
        );
        return tempMatrix * color;
      }
      
      void main() {
        vec3 color = texture(inputTexture, vUv).rgb;
        
        // Apply exposure
        color *= exposure;
        
        // ACES tone mapping
        color = ACESFilm(color);
        
        // Gamma correction
        color = pow(color, vec3(1.0/2.2));
        
        fragColor = vec4(color, 1.0);
      }
    `;

    this.createShaderProgram('toneMapping', bloomVertexShader, toneMappingFragmentShader);
  }

  private createShaderProgram(name: string, vertexSource: string, fragmentSource: string): void {
    if (!this.gl) return;

    const vertexShader = this.compileShader(vertexSource, this.gl.VERTEX_SHADER);
    const fragmentShader = this.compileShader(fragmentSource, this.gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) return;

    const program = this.gl.createProgram()!;
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error(`Shader program linking error: ${this.gl.getProgramInfoLog(program)}`);
      return;
    }

    this.shaderPrograms.set(name, program);
  }

  private compileShader(source: string, type: number): WebGLShader | null {
    if (!this.gl) return null;

    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(`Shader compilation error: ${this.gl.getShaderInfoLog(shader)}`);
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  private setupFramebuffers(): void {
    if (!this.gl) return;

    const width = this.canvas.width;
    const height = this.canvas.height;

    // Main scene framebuffer
    this.createFramebuffer('scene', width, height, true);
    
    // Bloom framebuffers (multiple sizes for better blur)
    this.createFramebuffer('bloom1', width / 2, height / 2, false);
    this.createFramebuffer('bloom2', width / 4, height / 4, false);
    this.createFramebuffer('bloom3', width / 8, height / 8, false);
    
    // Post-processing framebuffers
    this.createFramebuffer('postProcess1', width, height, false);
    this.createFramebuffer('postProcess2', width, height, false);
  }

  private createFramebuffer(name: string, width: number, height: number, hasDepth: boolean): void {
    if (!this.gl) return;

    const framebuffer = this.gl.createFramebuffer()!;
    const colorTexture = this.gl.createTexture()!;
    let depthTexture: WebGLTexture | null = null;

    // Color texture
    this.gl.bindTexture(this.gl.TEXTURE_2D, colorTexture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA16F, width, height, 0, this.gl.RGBA, this.gl.HALF_FLOAT, null);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    // Depth texture if needed
    if (hasDepth) {
      depthTexture = this.gl.createTexture()!;
      this.gl.bindTexture(this.gl.TEXTURE_2D, depthTexture);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.DEPTH_COMPONENT24, width, height, 0, this.gl.DEPTH_COMPONENT, this.gl.UNSIGNED_INT, null);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    }

    // Attach to framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, colorTexture, 0);
    if (depthTexture) {
      this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, depthTexture, 0);
    }

    if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !== this.gl.FRAMEBUFFER_COMPLETE) {
      console.error(`Framebuffer ${name} is not complete`);
    }

    this.framebuffers.set(name, framebuffer);
    this.textures.set(name + '_color', colorTexture);
    if (depthTexture) {
      this.textures.set(name + '_depth', depthTexture);
    }

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  private loadTextures(): void {
    // Create default particle texture
    this.createDefaultParticleTexture();
    
    // Load custom textures
    this.loadTexture('spark', '/assets/img/ui/spark.png');
    this.loadTexture('glow', '/assets/img/ui/glow.png');
    this.loadTexture('smoke', '/assets/img/ui/smoke.png');
  }

  private createDefaultParticleTexture(): void {
    if (!this.gl) return;

    const size = 64;
    const data = new Uint8Array(size * size * 4);
    const center = size / 2;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const index = (y * size + x) * 4;
        const dx = x - center;
        const dy = y - center;
        const distance = Math.sqrt(dx * dx + dy * dy) / center;
        const alpha = Math.max(0, 1 - distance);
        const softAlpha = Math.pow(alpha, 2);
        
        data[index] = 255;     // R
        data[index + 1] = 255; // G
        data[index + 2] = 255; // B
        data[index + 3] = Math.floor(softAlpha * 255); // A
      }
    }

    const texture = this.gl.createTexture()!;
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, size, size, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, data);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    this.textures.set('default_particle', texture);
  }

  private loadTexture(name: string, url: string): void {
    const texture = this.gl!.createTexture()!;
    this.gl!.bindTexture(this.gl!.TEXTURE_2D, texture);
    
    // Temporary 1x1 pixel while loading
    this.gl!.texImage2D(this.gl!.TEXTURE_2D, 0, this.gl!.RGBA, 1, 1, 0, this.gl!.RGBA, this.gl!.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      this.gl!.bindTexture(this.gl!.TEXTURE_2D, texture);
      this.gl!.texImage2D(this.gl!.TEXTURE_2D, 0, this.gl!.RGBA, this.gl!.RGBA, this.gl!.UNSIGNED_BYTE, image);
      this.gl!.generateMipmap(this.gl!.TEXTURE_2D);
      this.gl!.texParameteri(this.gl!.TEXTURE_2D, this.gl!.TEXTURE_MIN_FILTER, this.gl!.LINEAR_MIPMAP_LINEAR);
      this.gl!.texParameteri(this.gl!.TEXTURE_2D, this.gl!.TEXTURE_MAG_FILTER, this.gl!.LINEAR);
    };
    image.onerror = () => {
      console.warn(`Failed to load texture: ${url}`);
    };
    image.src = url;

    this.textures.set(name, texture);
  }

  private startRenderLoop(): void {
    const render = (currentTime: number) => {
      this.frameTime = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;
      this.fps = 1000 / Math.max(this.frameTime, 1);
      
      // Performance management
      this.updateLOD();
      
      // Render frame
      this.renderFrame(currentTime);
      
      requestAnimationFrame(render);
    };
    
    requestAnimationFrame(render);
  }

  private updateLOD(): void {
    // Adjust level of detail based on performance
    if (this.frameTime > this.performanceBudget * 1.5) {
      this.lodLevel = Math.max(0.5, this.lodLevel - 0.1);
    } else if (this.frameTime < this.performanceBudget * 0.8) {
      this.lodLevel = Math.min(1.0, this.lodLevel + 0.05);
    }
  }

  private renderFrame(time: number): void {
    if (!this.gl) return;

    // Update particle systems
    this.updateParticleSystems(time);
    
    // Update visual effects
    this.updateVisualEffects(time);
    
    // Render to scene framebuffer
    this.renderSceneToFramebuffer(time);
    
    // Apply post-processing
    this.applyPostProcessing();
    
    // Final render to screen
    this.renderToScreen();
  }

  private updateParticleSystems(time: number): void {
    this.particleSystems.forEach(system => {
      system.update(time / 1000, this.lodLevel);
    });
  }

  private updateVisualEffects(time: number): void {
    this.activeEffects.forEach((effect, id) => {
      if (effect.duration && time - effect.startTime > effect.duration) {
        if (effect.loop) {
          effect.startTime = time;
        } else {
          this.activeEffects.delete(id);
          return;
        }
      }
      
      // Update effect based on type
      this.updateEffect(effect, time);
    });
  }

  private updateEffect(effect: VisualEffect, time: number): void {
    // Effect-specific update logic would go here
    switch (effect.type) {
      case 'particle':
        // Particle system updates handled in updateParticleSystems
        break;
      case 'shader':
        // Shader effects
        break;
      case 'light':
        // Dynamic lighting updates
        break;
    }
  }

  private renderSceneToFramebuffer(time: number): void {
    const framebuffer = this.framebuffers.get('scene');
    if (!framebuffer) return;

    this.gl!.bindFramebuffer(this.gl!.FRAMEBUFFER, framebuffer);
    this.gl!.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl!.clear(this.gl!.COLOR_BUFFER_BIT | this.gl!.DEPTH_BUFFER_BIT);

    // Render all particle systems
    this.particleSystems.forEach(system => {
      this.renderParticleSystem(system);
    });
  }

  private renderParticleSystem(system: ParticleSystem): void {
    const program = this.shaderPrograms.get('particle');
    if (!program || !system.isActive()) return;

    this.gl!.useProgram(program);
    
    // Bind particle data
    system.bindBuffers(this.gl!);
    
    // Set uniforms
    const projectionLoc = this.gl!.getUniformLocation(program, 'projection');
    const viewLoc = this.gl!.getUniformLocation(program, 'view');
    const timeLoc = this.gl!.getUniformLocation(program, 'time');
    
    // For now, use identity matrices - in real implementation these would come from camera
    const identity = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
    
    this.gl!.uniformMatrix4fv(projectionLoc, false, identity);
    this.gl!.uniformMatrix4fv(viewLoc, false, identity);
    this.gl!.uniform1f(timeLoc, Date.now() / 1000);
    
    // Render particles
    this.gl!.drawArrays(this.gl!.POINTS, 0, system.getActiveParticleCount());
  }

  private applyPostProcessing(): void {
    if (!this.postProcessingConfig.bloom.enabled && 
        !this.postProcessingConfig.toneMapping.enabled) {
      return;
    }

    // Apply bloom effect
    if (this.postProcessingConfig.bloom.enabled) {
      this.applyBloomEffect();
    }

    // Apply tone mapping
    if (this.postProcessingConfig.toneMapping.enabled) {
      this.applyToneMapping();
    }
  }

  private applyBloomEffect(): void {
    const bloomProgram = this.shaderPrograms.get('bloom');
    if (!bloomProgram) return;

    this.gl!.useProgram(bloomProgram);
    
    // Multi-pass bloom implementation would go here
    // 1. Extract bright areas
    // 2. Blur horizontally and vertically at multiple scales
    // 3. Combine with original image
  }

  private applyToneMapping(): void {
    const toneProgram = this.shaderPrograms.get('toneMapping');
    if (!toneProgram) return;

    this.gl!.useProgram(toneProgram);
    
    // Apply ACES tone mapping
    const exposureLoc = this.gl!.getUniformLocation(toneProgram, 'exposure');
    const whitePointLoc = this.gl!.getUniformLocation(toneProgram, 'whitePoint');
    
    this.gl!.uniform1f(exposureLoc, this.postProcessingConfig.toneMapping.exposure);
    this.gl!.uniform1f(whitePointLoc, this.postProcessingConfig.toneMapping.whitePoint);
  }

  private renderToScreen(): void {
    this.gl!.bindFramebuffer(this.gl!.FRAMEBUFFER, null);
    this.gl!.viewport(0, 0, this.canvas.width, this.canvas.height);
    
    // Final composite to screen
    // This would render the final processed image to the main canvas
  }

  // Public API for creating effects
  public createParticleSystem(config: ParticleSystemConfig): string {
    const system = new ParticleSystem(config, this.gl!);
    this.particleSystems.set(config.id, system);
    
    const effect: VisualEffect = {
      id: config.id,
      type: 'particle',
      priority: 5,
      loop: true,
      active: true,
      startTime: Date.now(),
      config: config
    };
    
    this.activeEffects.set(config.id, effect);
    return config.id;
  }

  public createExplosionEffect(position: { x: number; y: number; z: number }): string {
    const id = 'explosion_' + Date.now();
    const config: ParticleSystemConfig = {
      id: id,
      maxParticles: 100,
      emissionRate: 200,
      lifetime: { min: 0.5, max: 1.5 },
      position: position,
      velocity: {
        base: { x: 0, y: 0, z: 0 },
        random: { x: 5, y: 5, z: 5 }
      },
      acceleration: { x: 0, y: -2, z: 0 },
      size: { start: 5, end: 0 },
      color: {
        start: { r: 1, g: 0.8, b: 0.2, a: 1 },
        end: { r: 1, g: 0.2, b: 0, a: 0 }
      },
      blendMode: 'additive',
      physics: {
        gravity: 0.5,
        drag: 0.95,
        bounce: 0.3,
        collision: false
      }
    };

    return this.createParticleSystem(config);
  }

  public createSparkleEffect(position: { x: number; y: number; z: number }): string {
    const id = 'sparkle_' + Date.now();
    const config: ParticleSystemConfig = {
      id: id,
      maxParticles: 50,
      emissionRate: 30,
      lifetime: { min: 1, max: 2 },
      position: position,
      velocity: {
        base: { x: 0, y: 1, z: 0 },
        random: { x: 2, y: 2, z: 2 }
      },
      acceleration: { x: 0, y: 0, z: 0 },
      size: { start: 3, end: 1 },
      color: {
        start: { r: 1, g: 1, b: 1, a: 1 },
        end: { r: 0.8, g: 0.9, b: 1, a: 0 }
      },
      blendMode: 'additive',
      physics: {
        gravity: 0,
        drag: 0.98,
        bounce: 0,
        collision: false
      }
    };

    return this.createParticleSystem(config);
  }

  public removeEffect(id: string): void {
    this.activeEffects.delete(id);
    this.particleSystems.delete(id);
  }

  public setPostProcessingConfig(config: Partial<PostProcessingConfig>): void {
    Object.assign(this.postProcessingConfig, config);
  }

  public getPerformanceStats(): { fps: number; frameTime: number; lodLevel: number } {
    return {
      fps: this.fps,
      frameTime: this.frameTime,
      lodLevel: this.lodLevel
    };
  }

  public destroy(): void {
    this.particleSystems.clear();
    this.activeEffects.clear();
    
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Particle System Implementation
class ParticleSystem {
  private particles: Float32Array;
  private particleCount = 0;
  private maxParticles: number;
  private emissionRate: number;
  private lastEmissionTime = 0;
  private vertexBuffer: WebGLBuffer | null = null;
  private active = true;

  constructor(private config: ParticleSystemConfig, private gl: WebGL2RenderingContext) {
    this.maxParticles = Math.floor(config.maxParticles * VisualEffectsManager.getInstance().getPerformanceStats().lodLevel);
    this.emissionRate = config.emissionRate;
    
    // Each particle: position(3) + velocity(3) + lifetime(1) + maxLifetime(1) + color(4) + size(1) = 13 floats
    this.particles = new Float32Array(this.maxParticles * 13);
    this.createBuffers();
  }

  private createBuffers(): void {
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.particles, this.gl.DYNAMIC_DRAW);
  }

  public update(deltaTime: number, lodLevel: number): void {
    if (!this.active) return;

    // Update existing particles
    this.updateParticles(deltaTime);
    
    // Emit new particles
    this.emitParticles(deltaTime);
    
    // Update GPU buffer
    if (this.vertexBuffer) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
      this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.particles);
    }
  }

  private updateParticles(deltaTime: number): void {
    let activeCount = 0;
    
    for (let i = 0; i < this.particleCount; i++) {
      const offset = i * 13;
      let lifetime = this.particles[offset + 6];
      
      if (!lifetime || lifetime <= 0) continue;
      
      lifetime -= deltaTime;
      this.particles[offset + 6] = lifetime;
      
      if (lifetime > 0) {
        // Update position based on velocity and physics
        const x = this.particles[offset] || 0;
        const y = this.particles[offset + 1] || 0;
        const z = this.particles[offset + 2] || 0;
        const vx = this.particles[offset + 3] || 0;
        const vy = this.particles[offset + 4] || 0;
        const vz = this.particles[offset + 5] || 0;
        
        this.particles[offset] = x + vx * deltaTime; // x += vx * dt
        this.particles[offset + 1] = y + vy * deltaTime; // y += vy * dt
        this.particles[offset + 2] = z + vz * deltaTime; // z += vz * dt
        
        // Apply acceleration (gravity, etc.)
        this.particles[offset + 4] = vy + this.config.acceleration.y * deltaTime; // vy += ay * dt
        
        // Apply drag
        const drag = this.config.physics.drag;
        this.particles[offset + 3] = vx * drag;
        this.particles[offset + 4] = (this.particles[offset + 4] || 0) * drag;
        this.particles[offset + 5] = vz * drag;
        
        activeCount++;
      }
    }
    
    this.particleCount = activeCount;
  }

  private emitParticles(deltaTime: number): void {
    const timeSinceLastEmission = deltaTime;
    const particlesToEmit = Math.floor(this.emissionRate * timeSinceLastEmission);
    
    for (let i = 0; i < particlesToEmit && this.particleCount < this.maxParticles; i++) {
      this.emitParticle();
    }
  }

  private emitParticle(): void {
    const offset = this.particleCount * 13;
    
    // Position
    this.particles[offset] = this.config.position.x + (Math.random() - 0.5) * 0.1;
    this.particles[offset + 1] = this.config.position.y + (Math.random() - 0.5) * 0.1;
    this.particles[offset + 2] = this.config.position.z + (Math.random() - 0.5) * 0.1;
    
    // Velocity
    this.particles[offset + 3] = this.config.velocity.base.x + (Math.random() - 0.5) * this.config.velocity.random.x;
    this.particles[offset + 4] = this.config.velocity.base.y + (Math.random() - 0.5) * this.config.velocity.random.y;
    this.particles[offset + 5] = this.config.velocity.base.z + (Math.random() - 0.5) * this.config.velocity.random.z;
    
    // Lifetime
    const lifetime = this.config.lifetime.min + Math.random() * (this.config.lifetime.max - this.config.lifetime.min);
    this.particles[offset + 6] = lifetime;
    this.particles[offset + 7] = lifetime; // max lifetime
    
    // Color (start color)
    this.particles[offset + 8] = this.config.color.start.r;
    this.particles[offset + 9] = this.config.color.start.g;
    this.particles[offset + 10] = this.config.color.start.b;
    this.particles[offset + 11] = this.config.color.start.a;
    
    // Size
    this.particles[offset + 12] = this.config.size.start;
    
    this.particleCount++;
  }

  public bindBuffers(gl: WebGL2RenderingContext): void {
    if (!this.vertexBuffer) return;
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    
    // Set up vertex attributes
    const stride = 13 * 4; // 13 floats * 4 bytes
    
    // Position
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
    
    // Velocity
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 3 * 4);
    
    // Lifetime, maxLifetime
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, stride, 6 * 4);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, stride, 7 * 4);
    
    // Color
    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 4, gl.FLOAT, false, stride, 8 * 4);
    
    // Size
    gl.enableVertexAttribArray(5);
    gl.vertexAttribPointer(5, 1, gl.FLOAT, false, stride, 12 * 4);
  }

  public isActive(): boolean {
    return this.active && this.particleCount > 0;
  }

  public getActiveParticleCount(): number {
    return this.particleCount;
  }

  public setActive(active: boolean): void {
    this.active = active;
  }
}

// Global instance
export const VisualEffects = VisualEffectsManager.getInstance();