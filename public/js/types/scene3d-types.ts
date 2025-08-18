// Types for 3D scene system in TapFrenzy

export interface Scene3D {
  /** Initialize the 3D scene */
  mount(root: HTMLElement): Promise<void>;
  
  /** Cleanup and dispose the 3D scene */
  unmount(): Promise<void>;
  
  /** Update the scene (called in animation loop) */
  update(deltaTime: number): void;
  
  /** Handle resize events */
  resize(width: number, height: number): void;
  
  /** Handle input events */
  onInput?(event: InputEvent): void;
}

export interface BuzzerCharacter {
  /** Play animation by name */
  playAnimation(name: string, loop?: boolean): void;
  
  /** Stop current animation */
  stopAnimation(): void;
  
  /** Make Buzzer speak (with subtitles) */
  speak(text: string, voice?: boolean): Promise<void>;
  
  /** Gesture animation */
  gesture(type: 'point' | 'wave' | 'thumbsup' | 'celebrate'): void;
  
  /** Set idle state */
  idle(): void;
}

export interface AudioManager {
  /** Play background music */
  playMusic(track: string, loop?: boolean, volume?: number): void;
  
  /** Play sound effect */
  playSFX(sound: string, volume?: number): void;
  
  /** Stop all audio */
  stopAll(): void;
  
  /** Set master volume */
  setVolume(volume: number): void;
}

export interface VFXManager {
  /** Play particle effect */
  playParticles(type: string, position?: { x: number, y: number, z: number }): void;
  
  /** Play confetti effect */
  playConfetti(): void;
  
  /** Screen flash effect */
  flash(color?: string, duration?: number): void;
  
  /** Camera shake */
  shake(intensity?: number, duration?: number): void;
}