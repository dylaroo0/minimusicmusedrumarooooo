
import type { DrumControls } from './types';

export const DRUM_STYLE_PRESETS: { [key: string]: DrumControls } = {
  acoustic: { complexity: 40, intensity: 60, style: 'Acoustic Folk', swing: 20, syncopation: 15, introFill: false, fillFrequency: 20 },
  rock: { complexity: 75, intensity: 85, style: 'Rock', swing: 5, syncopation: 25, introFill: true, fillFrequency: 50 },
  jazz: { complexity: 85, intensity: 50, style: 'Jazz', swing: 60, syncopation: 70, introFill: true, fillFrequency: 70 },
  electronic: { complexity: 80, intensity: 90, style: 'Electronic', swing: 0, syncopation: 50, introFill: false, fillFrequency: 30 },
  funk: { complexity: 90, intensity: 75, style: 'Funk', swing: 30, syncopation: 80, introFill: true, fillFrequency: 80 },
  reggae: { complexity: 50, intensity: 70, style: 'Reggae', swing: 40, syncopation: 60, introFill: false, fillFrequency: 15 },
  westCoastCongas: { complexity: 80, intensity: 65, style: 'West Coast Congas', swing: 15, syncopation: 75, introFill: true, fillFrequency: 60 },
  can: { complexity: 70, intensity: 75, style: 'Can (Motorik)', swing: 5, syncopation: 40, introFill: false, fillFrequency: 15 },
  spoon: { complexity: 60, intensity: 65, style: 'Spoon (Indie Rock)', swing: 10, syncopation: 75, introFill: true, fillFrequency: 40 },
};

export const DRUM_INSTRUMENTS = [
    'cymbalCrash',
    'cymbalRide',
    'hihatOpen',
    'hihatClosed',
    'snare',
    'tomHigh',
    'tomMid',
    'tomLow',
    'kick'
] as const;


export const DEFAULT_INSTRUMENT_COLORS: { [key: string]: string } = {
    kick: '#ff4d4d',
    snare: '#4da6ff',
    hihatClosed: '#ffff66',
    hihatOpen: '#c2c2f0',
    tomLow: '#cc66ff',
    tomMid: '#e699ff',
    tomHigh: '#ffccff',
    cymbalCrash: '#66ff66',
    cymbalRide: '#99ff99',
};

export const INSTRUMENT_LABELS: { [key:string]: string } = {
    kick: 'Kick',
    snare: 'Snare',
    hihatClosed: 'Hi-Hat (C)',
    hihatOpen: 'Hi-Hat (O)',
    tomLow: 'Tom (L)',
    tomMid: 'Tom (M)',
    tomHigh: 'Tom (H)',
    cymbalCrash: 'Crash',
    cymbalRide: 'Ride',
};

// General MIDI Drum Map (Channel 10)
export const MIDI_NOTE_MAP: { [key in typeof DRUM_INSTRUMENTS[number]]: number } = {
    kick: 36,          // Acoustic Bass Drum
    snare: 38,         // Acoustic Snare
    hihatClosed: 42,   // Closed Hi-Hat
    hihatOpen: 46,     // Open Hi-Hat
    tomLow: 45,        // Low Tom
    tomMid: 47,        // Low-Mid Tom
    tomHigh: 48,       // Hi-Mid Tom
    cymbalCrash: 49,   // Crash Cymbal 1
    cymbalRide: 51,    // Ride Cymbal 1
};