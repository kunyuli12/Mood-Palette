import { GoogleGenAI, Type } from "@google/genai";
import { GeneratePaletteResponse, Language, Palette } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

const LANGUAGE_INSTRUCTIONS: Record<Language, string> = {
  'zh-TW': 'Traditional Chinese (Taiwan)',
  'en': 'English',
  'ja': 'Japanese',
  'ko': 'Korean'
};

export const generatePaletteFromMood = async (mood: string, language: Language): Promise<GeneratePaletteResponse> => {
  const ai = getClient();
  const langInstruction = LANGUAGE_INSTRUCTIONS[language];
  
  const prompt = `Create a professional color palette based on the user request: "${mood}". 
  The palette should have 5 distinct, harmonious colors.
  
  IMPORTANT: The output MUST be in ${langInstruction}.
  
  Provide:
  1. A creative name for the palette.
  2. A short, evocative description of the vibe.
  3. Practical design advice on where to use these colors (e.g., UI, Branding, Illustration).
  4. 5 colors with Hex codes and creative names.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "A creative name for the palette" },
          description: { type: Type.STRING, description: "A short description of the vibe" },
          designAdvice: { type: Type.STRING, description: "Advice on usage" },
          colors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                hex: { type: Type.STRING, description: "Hex color code, e.g. #FFFFFF" },
                name: { type: Type.STRING, description: "A creative name for the color" }
              },
              required: ["hex", "name"]
            }
          }
        },
        required: ["name", "description", "designAdvice", "colors"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini");
  }

  try {
    return JSON.parse(text) as GeneratePaletteResponse;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to generate palette");
  }
};

export const generateMoodImage = async (palette: Palette, userKeywords?: string): Promise<string> => {
  const ai = getClient();
  
  // Construct a strict color string
  const colorList = palette.colors.map((c, i) => `${i + 1}. ${c.hex} (${c.name})`).join('\n');
  
  // Use user keywords if provided, otherwise default to palette name/description
  const subject = userKeywords 
    ? `Specific Subject: ${userKeywords}` 
    : `Subject: Abstract representation of "${palette.name}"`;

  const prompt = `
    Create a high-quality, artistic image.
    
    ${subject}
    
    STRICT COLOR CONSTRAINT:
    The image MUST use the following 5 colors as the dominant palette. Do not deviate significantly.
    ${colorList}
    
    Style: Minimalist, High-end, Cinematic, Clean.
    
    NEGATIVE PROMPT (FORBIDDEN CONTENT):
    - NO TEXT
    - NO LETTERS
    - NO WATERMARKS
    - NO TYPOGRAPHY
    - NO SIGNATURES
    - NO WORDS
    
    Ensure the atmosphere matches: ${palette.description}.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated");
};