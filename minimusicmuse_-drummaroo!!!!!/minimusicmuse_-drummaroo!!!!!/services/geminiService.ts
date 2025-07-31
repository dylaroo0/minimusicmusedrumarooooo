
import { GoogleGenAI, Type } from "@google/genai";
import type { MusicAnalysis, DrumControls, DrumPattern, DrumHit } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    bpm: { type: Type.NUMBER, description: "Beats per minute of the song, rounded to the nearest integer." },
    key: { type: Type.STRING, description: "The musical key, e.g., 'C Major' or 'A Minor'." },
    timeSignature: { type: Type.STRING, description: "Time signature, e.g., '4/4' or '3/4'." },
    mood: { type: Type.STRING, description: "The overall mood or feeling of the song, e.g., 'Uplifting', 'Melancholic'." },
    mainInstruments: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of main instruments identified." },
    chordProgression: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The main chord progression as an array of strings, e.g., ['Am', 'G', 'C', 'F']." },
    rhythmicFeel: { type: Type.STRING, description: "Describe the rhythmic feel, e.g. 'Straight eighths', 'Swung sixteenths', 'Driving rock beat'."},
    startTime: { type: Type.NUMBER, description: "The precise time in seconds where the music first becomes audible, ignoring any initial silence. If there is no silence, this should be 0.0." },
  },
  required: ['bpm', 'key', 'timeSignature', 'mood', 'mainInstruments', 'chordProgression', 'rhythmicFeel', 'startTime']
};

const drumPatternSchema = {
    type: Type.OBJECT,
    properties: {
        pattern: {
            type: Type.ARRAY,
            description: "An array of drum hit objects.",
            items: {
                type: Type.OBJECT,
                properties: {
                    instrument: {
                        type: Type.STRING,
                        description: "The drum instrument to play.",
                        enum: ['kick', 'snare', 'hihatClosed', 'hihatOpen', 'tomLow', 'tomMid', 'tomHigh', 'cymbalCrash', 'cymbalRide']
                    },
                    time: { type: Type.NUMBER, description: "The time of the hit in seconds from the start of the pattern." },
                    velocity: { type: Type.NUMBER, description: "The velocity of the hit, from 0.0 (soft) to 1.0 (hard)." },
                },
                required: ['instrument', 'time', 'velocity'],
            },
        },
    },
    required: ['pattern'],
};


export async function analyzeMusic(audioBase64: string, mimeType: string): Promise<MusicAnalysis> {
  const model = "gemini-2.5-flash";

  const audioPart = {
    inlineData: {
      mimeType: mimeType || 'audio/mp3',
      data: audioBase64,
    },
  };

  const textPart = {
    text: "Analyze this audio file and provide its musical characteristics. Focus on BPM, key, time signature, chord progression, main instruments, mood, rhythmic feel, and the precise start time of the music. The start time should be the point where the music begins, ignoring any initial silence. Provide a very accurate BPM, rounded to the nearest integer. Double-check your analysis for accuracy."
  };

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: [audioPart, textPart] },
    config: {
        systemInstruction: "You are a world-class musicologist and audio engineer with perfect pitch. Your analysis must be precise and accurate. Respond only with the requested JSON object.",
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.1,
    }
  });

  const jsonText = response.text;
  try {
    return JSON.parse(jsonText) as MusicAnalysis;
  } catch (e) {
    console.error("Failed to parse analysis JSON:", jsonText);
    throw new Error("Received invalid analysis from API.");
  }
}

export async function generateDrums(analysis: MusicAnalysis, controls: DrumControls, duration: number): Promise<DrumPattern> {
    const model = "gemini-2.5-flash";

    const prompt = `
        You are an expert AI Drummer. Your task is to create a compelling and musically appropriate drum pattern for the full duration of a song based on its analysis.

        The provided audio track is ${duration.toFixed(1)} seconds long.

        IMPORTANT TIMING INFORMATION:
        - The actual music in the track starts at ${analysis.startTime.toFixed(2)} seconds. Your drum pattern should respect this initial silence and begin in sync with the music, not at 0.0. All 'time' values in your output must be absolute from the start of the file.

        Music Analysis:
        - Tempo: ${analysis.bpm} BPM
        - Key: ${analysis.key}
        - Time Signature: ${analysis.timeSignature}
        - Mood: ${analysis.mood}
        - Main Instruments: ${analysis.mainInstruments.join(', ')}
        - Chord Progression: ${analysis.chordProgression.join(' - ')}
        - Rhythmic Feel: ${analysis.rhythmicFeel}

        Drum Parameter Controls:
        - Style: ${controls.style}
        - Complexity: ${controls.complexity}/100 (Higher means more intricate rhythms and ghost notes.)
        - Intensity: ${controls.intensity}/100 (Higher means more powerful, energetic drumming with higher velocities.)
        - Swing: ${controls.swing}/100 (Higher adds more shuffle feel. 0 is straight time.)
        - Syncopation: ${controls.syncopation}/100 (Higher means more off-beat rhythms.)
        - Intro Drum Fill: ${controls.introFill ? 'Yes' : 'No'}
        - Fill Frequency: ${controls.fillFrequency}/100 (Controls how often fills occur.)

        Instructions for Full-Length Drum Pattern Generation:
        1. Generate a COMPLETE drum pattern for the entire duration of the song (${duration.toFixed(1)} seconds). This should NOT be a short repeating loop. It should be a full performance with natural evolution, variation, and fills appropriate for a full song structure (e.g., intro, verse, chorus, bridge, outro).
        2. The first drum hit should NOT occur before the music start time of ${analysis.startTime.toFixed(2)} seconds.
        3. If 'Intro Drum Fill' is 'Yes', create a tasteful and exciting drum fill that leads into the main beat precisely at the song's start time. The fill should build anticipation.
        4. The 'Fill Frequency' parameter governs how often drum fills appear. A higher value means more frequent and complex fills at the end of musical phrases (e.g., every 4 or 8 bars). Use toms and cymbals for these fills.
        5. The pattern must be stylistically coherent with the provided analysis and control parameters. For example, a 'Funk' style with high complexity should have syncopated ghost notes on the snare and intricate hi-hat work. A 'Rock' style should be powerful and driving. A 'Reggae' style should emphasize the off-beats or have a one-drop feel.
        6. Create dynamic changes throughout the song. The intensity might be lower in verses and higher in choruses. Use cymbal crashes to mark transitions between sections.
        7. Velocity is CRITICAL for a human feel. Vary velocities for every single hit. Accented notes should have higher velocity. Ghost notes should be very low velocity. The overall dynamic range should be guided by the 'Intensity' parameter.
        8. Ensure the pattern is realistic and playable by a human drummer. Avoid physically impossible combinations.
        9. The 'time' for each hit must be precise and calculated based on the BPM. Ensure all hit times fall between ${analysis.startTime.toFixed(2)} and the total duration of ${duration.toFixed(1)} seconds.
        10. Respond ONLY with a valid JSON object matching the provided schema. Do not include any other text, explanation, or markdown formatting.
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: drumPatternSchema,
            maxOutputTokens: 8192,
            thinkingConfig: { thinkingBudget: 2048 },
        }
    });

    const jsonText = response.text.trim();
    try {
        const parsed = JSON.parse(jsonText);
        // Validate the structure
        if (parsed.pattern && Array.isArray(parsed.pattern)) {
             // Sort by time just in case
            (parsed.pattern as DrumHit[]).sort((a, b) => a.time - b.time);
            return parsed as DrumPattern;
        }
        throw new Error("Parsed JSON does not match DrumPattern structure.");
    } catch (e) {
        console.error("Failed to parse drum pattern JSON:", jsonText);
        throw new Error("Received invalid drum pattern from API.");
    }
}
