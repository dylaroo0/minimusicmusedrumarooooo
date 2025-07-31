
import { DRUM_INSTRUMENTS } from "./constants";

export interface MusicAnalysis {
  bpm: number;
  key: string;
  timeSignature: string;
  mood: string;
  mainInstruments: string[];
  chordProgression: string[];
  rhythmicFeel: string;
  startTime: number; // The time in seconds where the music first becomes audible.
}

export interface DrumControls {
  complexity: number;
  intensity: number;
  style: string;
  swing: number;
  syncopation: number;
  introFill: boolean;
  fillFrequency: number;
}

export type DrumInstrument = typeof DRUM_INSTRUMENTS[number];

export interface DrumHit {
  instrument: DrumInstrument;
  time: number; // in seconds from the start
  velocity: number; // 0-1
}

export interface DrumPattern {
  pattern: DrumHit[];
}

export interface Status {
  message: string;
  type: 'info' | 'success' | 'error' | 'loading';
}

export type DrumSamples = {
    [key in DrumInstrument]: string;
};
