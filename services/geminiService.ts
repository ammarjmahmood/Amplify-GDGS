import { GoogleGenAI, Modality } from "@google/genai";
import { VOCABULARY } from "../constants";
import { AACSymbol } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Flatten vocabulary for searching and context
 */
const flattenVocabulary = (items: AACSymbol[]): any[] => {
  let flat: any[] = [];
  items.forEach(item => {
    flat.push({ id: item.id, label: item.label, keywords: item.keywords });
    if (item.children) {
      flat = [...flat, ...flattenVocabulary(item.children)];
    }
  });
  return flat;
};

const flatVocab = flattenVocabulary(VOCABULARY);

/**
 * Helper to convert Blob to Base64 string
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:audio/webm;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Takes a sequence of symbols AND optional audio context to make a natural sentence.
 * Uses Gemini 2.5's multimodal capabilities to "hear" the user's intent.
 */
export const naturalizeSentence = async (symbols: string[], audioBlob?: Blob | null, emotion: string = 'Neutral'): Promise<string> => {
  if (symbols.length === 0 && !audioBlob) return "";

  const model = 'gemini-2.5-flash';

  const promptText = `
    You are an AAC communication assistant. The user has selected these symbols in order: ${symbols.join(', ')}
    
    IMPORTANT: The user wants to speak with a ${emotion} tone/emotion.
    
    Your task:
    1. Reorder and combine these words into a grammatically correct, natural sentence
    2. The user may have selected words in ANY order - you must rearrange them to make sense
    3. Express the sentence with a ${emotion} tone
    4. If audio is provided, use it to detect additional emotion cues
    5. Speak as a child would naturally speak
    6. Add necessary words (I, want, need, please, help, etc.) to make it sound natural
    
    Examples:
    - Input: "help, poop, dad" → Output: "Dad, I need help going to the bathroom!"
    - Input: "pizza, want, now" → Output: "I want pizza right now!"
    - Input: "play, outside, want" → Output: "I want to play outside!"
    - Input: "bathroom, need" → Output: "I need to use the bathroom."
    
    Return ONLY the natural sentence, nothing else.
  `;

  const parts: any[] = [{ text: promptText }];

  if (audioBlob) {
    try {
      const base64Audio = await blobToBase64(audioBlob);
      parts.push({
        inlineData: {
          mimeType: audioBlob.type || 'audio/webm',
          data: base64Audio
        }
      });
    } catch (e) {
      console.error("Error encoding audio:", e);
    }
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts }]
    });

    const text = response.text.trim();
    return text;
  } catch (error) {
    console.error("Gemini naturalizeSentence error:", error);
    return symbols.join(' ');
  }
};

/**
 * Predict next symbols based on current sentence
 */
export const predictNextSymbols = async (currentSentence: string[]): Promise<string[]> => {
  if (currentSentence.length === 0) return [];

  const model = 'gemini-2.5-flash';

  const promptText = `
    The user has selected: ${currentSentence.join(' ')}
    Suggest 3-5 next words from: ${flatVocab.map(v => v.label).join(', ')}
    Return ONLY a comma-separated list.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: promptText }] }]
    });

    const text = response.text.trim();
    const suggestions = text.split(',').map(s => s.trim()).filter(Boolean);
    return suggestions.slice(0, 5);
  } catch (error) {
    console.error("Gemini predictNextSymbols error:", error);
    return [];
  }
};

/**
 * Generate speech using ElevenLabs (primary) or Gemini TTS (fallback)
 */
export const generateSpeech = async (text: string): Promise<ArrayBuffer | null> => {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

  // Try ElevenLabs first
  if (ELEVENLABS_API_KEY) {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        return await audioBlob.arrayBuffer();
      }
    } catch (error) {
      console.warn("ElevenLabs TTS failed, falling back to Gemini:", error);
    }
  }

  // Fallback to Gemini TTS
  try {
    const model = 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model,
      contents: [{
        parts: [{
          text: `Generate speech audio for: "${text}"`
        }]
      }],
      config: {
        responseModalities: [Modality.AUDIO]
      }
    });

    if (response.audioData) {
      const base64Audio = response.audioData;
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }
    return null;
  } catch (error) {
    console.error("Both ElevenLabs and Gemini TTS failed:", error);
    return null;
  }
};

// Global AudioContext for Safari/iPad compatibility
let globalAudioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!globalAudioContext) {
    globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return globalAudioContext;
};

/**
 * Helper to decode audio for playback - Safari/iPad compatible
 */
export const playAudioBuffer = async (buffer: ArrayBuffer) => {
  try {
    const audioContext = getAudioContext();

    // Resume AudioContext if suspended (required for Safari/iPad)
    if (audioContext.state === 'suspended') {
      console.log('AudioContext suspended, resuming...');
      await audioContext.resume();
    }

    console.log('AudioContext state:', audioContext.state);
    const audioBuffer = await audioContext.decodeAudioData(buffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
    console.log('✅ Audio playback started');
  } catch (error) {
    console.error('❌ Audio playback error:', error);
    throw error;
  }
};