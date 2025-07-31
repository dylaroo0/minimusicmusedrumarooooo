
import type { DrumPattern, DrumHit, DrumInstrument, DrumSamples } from '../types';

class AudioPlayerService {
  private audioContext: AudioContext;
  private mainAudioBuffer: AudioBuffer | null = null;
  private mainAudioSource: AudioBufferSourceNode | null = null;
  private drumPattern: DrumPattern | null = null;
  private drumSamples: { [key in DrumInstrument]?: AudioBuffer } = {};
  private drumVolumeNode: GainNode;
  private mainVolumeNode: GainNode;

  private isPlaying = false;
  private startTime = 0; // context.currentTime at the moment playback started
  private pauseTime = 0; // time in the audio track where it was paused

  public onTimeUpdate: (time: number) => void = () => {};
  public onEnded: () => void = () => {};

  private animationFrameId: number | null = null;
  private scheduledDrumSources: AudioBufferSourceNode[] = [];

  constructor() {
    this.audioContext = new AudioContext();
    this.drumVolumeNode = this.audioContext.createGain();
    this.drumVolumeNode.connect(this.audioContext.destination);
    this.mainVolumeNode = this.audioContext.createGain();
    this.mainVolumeNode.connect(this.audioContext.destination);
  }

  async loadAudio(audioDataUrl: string): Promise<number> {
    this.stop();
    const response = await fetch(audioDataUrl);
    const arrayBuffer = await response.arrayBuffer();
    this.mainAudioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    return this.mainAudioBuffer.duration;
  }

  async loadSamples(samples: DrumSamples) {
    for (const key in samples) {
      try {
        const instrument = key as DrumInstrument;
        const base64 = samples[instrument];
        if (!base64) continue;
        const audioData = atob(base64);
        const arrayBuffer = new ArrayBuffer(audioData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioData.length; i++) {
            uint8Array[i] = audioData.charCodeAt(i);
        }
        this.drumSamples[instrument] = await this.audioContext.decodeAudioData(arrayBuffer.slice(0));
      } catch (e) {
        console.error(`Failed to load sample for ${key}:`, e);
      }
    }
  }
  
  setDrumPattern(pattern: DrumPattern) {
    this.drumPattern = pattern;
  }

  setDrumVolume(volume: number) {
    this.drumVolumeNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
  }

  play() {
    if (this.isPlaying || !this.mainAudioBuffer) return;
    this.audioContext.resume();

    this.mainAudioSource = this.audioContext.createBufferSource();
    this.mainAudioSource.buffer = this.mainAudioBuffer;
    this.mainAudioSource.connect(this.mainVolumeNode);
    this.mainAudioSource.onended = () => {
        // Only trigger onEnded if it finished naturally and wasn't manually stopped
        if (this.isPlaying) {
           this.stop();
           this.onEnded();
        }
    };

    this.startTime = this.audioContext.currentTime - this.pauseTime;
    this.mainAudioSource.start(0, this.pauseTime);
    this.scheduleDrums();

    this.isPlaying = true;
    this.tick();
  }

  pause() {
    if (!this.isPlaying || !this.mainAudioSource) return;
    this.pauseTime = this.audioContext.currentTime - this.startTime;
    this.isPlaying = false;
    
    this.mainAudioSource.onended = null; // Prevent onended from firing on manual stop
    this.mainAudioSource.stop();
    this.stopScheduledDrums();

    if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    }
  }

  stop() {
    if (this.isPlaying && this.mainAudioSource) {
      this.mainAudioSource.onended = null;
      this.mainAudioSource.stop();
    }
    this.stopScheduledDrums();
    this.isPlaying = false;
    this.pauseTime = 0;
    this.onTimeUpdate(0);
    if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    }
  }
  
  seek(time: number) {
      const wasPlaying = this.isPlaying;
      if (wasPlaying) {
          this.pause();
      }
      this.pauseTime = Math.max(0, time);
      this.onTimeUpdate(this.pauseTime);
      if (wasPlaying) {
          this.play();
      }
  }

  private stopScheduledDrums() {
    this.scheduledDrumSources.forEach(s => s.stop());
    this.scheduledDrumSources = [];
  }

  private scheduleDrums() {
    this.stopScheduledDrums();
    if (!this.drumPattern) return;
    
    this.drumPattern.pattern.forEach((hit: DrumHit) => {
        if (hit.time >= this.pauseTime) {
            const sample = this.drumSamples[hit.instrument];
            if (sample) {
                const source = this.audioContext.createBufferSource();
                source.buffer = sample;
                
                const gainNode = this.audioContext.createGain();
                gainNode.gain.value = hit.velocity;

                source.connect(gainNode);
                gainNode.connect(this.drumVolumeNode);
                
                const playTime = this.startTime + hit.time;
                source.start(playTime);
                this.scheduledDrumSources.push(source);
            }
        }
    });
  }

  private tick() {
    if (!this.isPlaying) return;
    const currentTime = this.audioContext.currentTime - this.startTime;
    if (this.mainAudioBuffer && currentTime > this.mainAudioBuffer.duration) {
      this.stop();
      this.onEnded();
    } else {
      this.onTimeUpdate(currentTime);
      this.animationFrameId = requestAnimationFrame(() => this.tick());
    }
  }

  cleanup() {
    this.stop();
    this.audioContext.close().catch(console.error);
  }
}

export const audioPlayerService = new AudioPlayerService();
