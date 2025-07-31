import type { DrumPattern, DrumHit } from '../types';
import { MIDI_NOTE_MAP } from '../constants';

const TICKS_PER_QUARTER_NOTE = 480;

/**
 * Encodes a number into a variable-length quantity (VLQ) array of bytes.
 * MIDI uses VLQ to store delta-times between events.
 */
function numberToVlq(value: number): number[] {
  const bytes = [];
  let v = value;
  
  // Start with the LSB
  bytes.push(v & 0x7F);
  v = v >> 7;

  while(v > 0) {
    // Prepend the next 7 bits, setting the MSB to 1 to indicate more bytes are coming.
    bytes.unshift((v & 0x7F) | 0x80);
    v = v >> 7;
  }
  
  return bytes;
}

/**
 * Creates a MIDI event with a delta-time.
 */
function createMidiEvent(deltaTime: number, status: number, data1: number, data2: number): number[] {
  return [...numberToVlq(deltaTime), status, data1, data2];
}

/**
 * Converts the application's drum pattern into a binary MIDI file format.
 */
export function exportToMidi(drumPattern: DrumPattern, bpm: number): Uint8Array {
  const ticksPerSecond = (TICKS_PER_QUARTER_NOTE * bpm) / 60;
  
  // --- Create Note Events from Drum Pattern ---
  const noteEvents: { tick: number, event: number[] }[] = [];
  const noteDurationTicks = Math.round(ticksPerSecond * 0.1); // Fixed 100ms duration for all notes

  for (const hit of drumPattern.pattern) {
    const noteNumber = MIDI_NOTE_MAP[hit.instrument];
    if (noteNumber === undefined) continue;

    const velocity = Math.min(127, Math.round(hit.velocity * 127));
    const startTick = Math.round(hit.time * ticksPerSecond);

    // Note On event (channel 10 for drums is status 0x99)
    noteEvents.push({ tick: startTick, event: [0x99, noteNumber, velocity] });
    // Note Off event (channel 10 is status 0x89)
    noteEvents.push({ tick: startTick + noteDurationTicks, event: [0x89, noteNumber, 0] });
  }

  // Sort all events by their tick time
  noteEvents.sort((a, b) => a.tick - b.tick);


  // --- Build Track Chunk from Events ---
  const trackData: number[] = [];
  let lastTick = 0;

  // Meta Event: Time Signature (4/4)
  trackData.push(...numberToVlq(0), 0xFF, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08);

  // Meta Event: Tempo
  const usPerQuarter = Math.round(60000000 / bpm);
  trackData.push(...numberToVlq(0), 0xFF, 0x51, 0x03, 
    (usPerQuarter >> 16) & 0xFF, 
    (usPerQuarter >> 8) & 0xFF, 
    usPerQuarter & 0xFF
  );

  // Add note events with calculated delta-times
  for (const { tick, event } of noteEvents) {
    const deltaTime = tick - lastTick;
    trackData.push(...numberToVlq(deltaTime), ...event);
    lastTick = tick;
  }

  // Meta Event: End of Track
  trackData.push(...numberToVlq(0), 0xFF, 0x2F, 0x00);


  // --- Assemble the MIDI File ---
  
  // Header Chunk ("MThd")
  const header = [
    0x4D, 0x54, 0x68, 0x64, // Chunk ID
    0x00, 0x00, 0x00, 0x06, // Chunk length (6 bytes)
    0x00, 0x00,             // Format 0 (single track)
    0x00, 0x01,             // Number of tracks (1)
    (TICKS_PER_QUARTER_NOTE >> 8) & 0xFF, // Ticks per quarter note (MSB)
    TICKS_PER_QUARTER_NOTE & 0xFF,        // Ticks per quarter note (LSB)
  ];

  // Track Chunk ("MTrk")
  const trackLength = trackData.length;
  const track = [
    0x4D, 0x54, 0x72, 0x6B, // Chunk ID
    (trackLength >> 24) & 0xFF, // Chunk length (MSB)
    (trackLength >> 16) & 0xFF,
    (trackLength >> 8) & 0xFF,
    trackLength & 0xFF,         // Chunk length (LSB)
    ...trackData
  ];

  return new Uint8Array([...header, ...track]);
}
