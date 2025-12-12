import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, ChatMessage, Outfit, WeatherData, WorkoutPlan, BodyShape, BeautyAnalysis, ColorPaletteAnalysis } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION_BASE = `
You are Ixora, a world-class personal fashion designer and stylist. 
Your goal is to help the user feel seen and styled.

BEHAVIORAL RULES:
1. **Consult First**: Do NOT immediately generate a list of products if the user's request is vague. 
   - Ask clarifying questions about **fabric** (e.g., Cotton, Silk, Linen), **material preference**, **occasion**, or **fit** first.
   - Only once the user has clarified their material/fabric choice or if the request is very specific, generate the product recommendations.
2. **Context**: You understand body types, skin tones, and face shapes deeply. Explain "Why it works for you".
3. **Locale**: The user is likely in India. Use Indian Rupees (₹) for currency. Suggest products from **Amazon India** or **Myntra**.
4. **Output Format**: 
   - If you are just chatting or asking questions, output plain text.
   - If you are recommending specific products, output a short introductory text followed by the JSON block. Do not output the JSON code block markers like \`\`\`json.
   - For images, strictly use this format: "https://loremflickr.com/400/500/fashion,model,dress?random=1" (changing keywords slightly based on item type).

Do NOT give medical advice.
`;

const OUTFIT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy name for the look" },
    description: { type: Type.STRING, description: "A brief, evocative description of the vibe" },
    reasoning: { type: Type.STRING, description: "Specific explanation of why this fits the user's body shape and skin tone" },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING, description: "Name of the garment" },
          price: { type: Type.NUMBER, description: "Price in Indian Rupees" },
          currency: { type: Type.STRING, description: "Should be '₹'" },
          brand: { type: Type.STRING },
          imageUrl: { type: Type.STRING, description: "Use https://loremflickr.com/400/500/fashion,clothing?random=XX" },
          url: { type: Type.STRING, description: "A placeholder purchase URL" },
          tracking: { type: Type.BOOLEAN },
          rating: { type: Type.NUMBER, description: "Rating out of 5, e.g., 4.5" },
          reviewCount: { type: Type.NUMBER },
          source: { type: Type.STRING, enum: ['Amazon', 'Myntra', 'Ajio'] }
        },
        required: ["name", "brand", "price", "source", "rating", "imageUrl"],
      }
    }
  },
  required: ["title", "description", "reasoning", "items"]
};

const WORKOUT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    focusArea: { type: Type.STRING },
    goal: { type: Type.STRING },
    frequency: { type: Type.STRING },
    warmup: { type: Type.ARRAY, items: { type: Type.STRING } },
    mainCircuit: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          reps: { type: Type.STRING },
          description: { type: Type.STRING },
          benefit: { type: Type.STRING },
        },
        required: ["name", "reps", "description", "benefit"]
      }
    },
    cooldown: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["focusArea", "goal", "warmup", "mainCircuit", "cooldown"]
};

const BODY_ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    identifiedShape: { type: Type.STRING, enum: Object.values(BodyShape) },
    reasoning: { type: Type.STRING }
  },
  required: ["identifiedShape", "reasoning"]
};

const BEAUTY_ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    faceShape: { type: Type.STRING, description: "Oval, Round, Square, Heart, Diamond, Long" },
    skinTone: { type: Type.STRING },
    undertone: { type: Type.STRING },
    bestColors: {
      type: Type.OBJECT,
      properties: {
        lipstick: { type: Type.ARRAY, items: { type: Type.STRING } },
        foundation: { type: Type.STRING },
        contour: { type: Type.STRING },
        concealer: { type: Type.STRING }
      },
      required: ["lipstick", "foundation", "contour", "concealer"]
    },
    hairRecommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          style: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["style", "description"]
      }
    },
    placementAdvice: {
      type: Type.OBJECT,
      properties: {
        contour: { type: Type.STRING },
        blush: { type: Type.STRING },
        highlighter: { type: Type.STRING }
      },
      required: ["contour", "blush", "highlighter"]
    }
  },
  required: ["faceShape", "skinTone", "undertone", "bestColors", "hairRecommendations", "placementAdvice"]
};

const COLOR_PALETTE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    season: { type: Type.STRING, description: "e.g. Deep Autumn, Light Spring" },
    description: { type: Type.STRING, description: "Description of the color season and why it fits." },
    bestColors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          hex: { type: Type.STRING }
        },
        required: ["name", "hex"]
      }
    },
    neutrals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          hex: { type: Type.STRING }
        },
        required: ["name", "hex"]
      }
    },
    avoidColors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          hex: { type: Type.STRING }
        },
        required: ["name", "hex"]
      }
    }
  },
  required: ["season", "description", "bestColors", "neutrals", "avoidColors"]
};

export const generateDailyOutfit = async (user: UserProfile, weather: WeatherData): Promise<Outfit | null> => {
  try {
    const prompt = `
      Create a daily outfit for ${user.name}.
      Profile: Age ${user.age}, ${user.gender}, Body: ${user.bodyShape}, Skin: ${user.skinTone}.
      Style: ${user.stylePreferences.join(", ")}.
      Context: Weather is ${weather.condition}, ${weather.temp}°C in ${weather.location}.
      
      Provide a complete look including accessories.
      IMPORTANT: For image URLs, use "https://loremflickr.com/400/500/fashion,model?random=1" (increment random number for each item).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
        responseMimeType: "application/json",
        responseSchema: OUTFIT_SCHEMA,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Outfit;
    }
    return null;
  } catch (error) {
    console.error("Error generating daily outfit:", error);
    return null;
  }
};

export const chatWithIxora = async (
  history: ChatMessage[], 
  user: UserProfile, 
  newMessage: string
): Promise<{ text: string; outfit?: Outfit }> => {
  try {
    const recentHistory = history.slice(-10).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION_BASE}
        User Profile: ${JSON.stringify(user)}
        
        INSTRUCTIONS FOR RESPONSE:
        1. If the user's request is vague (e.g., "I need a dress"), ask about FABRIC (Cotton, Silk, etc.) and OCCASION first. Do not provide a JSON outfit yet.
        2. If the user has specified material/fabric/occasion, OR if you are confident in the recommendation:
           - Provide a brief helpful text response.
           - Follow it immediately with the JSON object strictly matching this schema:
           ${JSON.stringify(OUTFIT_SCHEMA)}
           - Ensure the JSON is at the very end of the response.
        `,
      },
      history: recentHistory
    });

    const result = await chat.sendMessage({ message: newMessage });
    const responseText = result.text;
    
    let finalOutfit: Outfit | undefined;
    let finalText = responseText;

    // Improved regex to catch json block at the end, specifically looking for the object structure
    // We look for the last occurrence of { "title": ... } pattern to start the JSON
    const jsonStartIndex = responseText.indexOf('{');
    
    if (jsonStartIndex !== -1) {
      try {
        const potentialJsonString = responseText.substring(jsonStartIndex);
        // Clean up any potential markdown code blocks if they exist in the substring
        const cleanJsonString = potentialJsonString.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const potentialJson = JSON.parse(cleanJsonString);
        if (potentialJson.title && potentialJson.items) {
           finalOutfit = potentialJson as Outfit;
           // Keep only the text BEFORE the JSON
           finalText = responseText.substring(0, jsonStartIndex).trim();
        }
      } catch (e) {
        console.warn("Found potential JSON but failed to parse:", e);
      }
    }

    return {
      text: finalText,
      outfit: finalOutfit
    };

  } catch (error) {
    console.error("Error in chat:", error);
    return { text: "I'm having a little trouble connecting to my fashion sense right now. Please try again." };
  }
};

export const analyzeBodyShape = async (imageBase64: string): Promise<{ shape: BodyShape; reasoning: string } | null> => {
  try {
    const base64Data = imageBase64.split(',')[1] || imageBase64;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          },
          {
            text: "Analyze the body shape of the person in this photo. Determine if they are Hourglass, Pear, Apple, Rectangle, or Inverted Triangle. Be objective and kind."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: BODY_ANALYSIS_SCHEMA,
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text);
      return {
        shape: result.identifiedShape as BodyShape,
        reasoning: result.reasoning
      };
    }
    return null;
  } catch (error) {
    console.error("Error analyzing body shape:", error);
    return null;
  }
};

export const generateWorkoutPlan = async (user: UserProfile): Promise<WorkoutPlan | null> => {
  try {
    const prompt = `
      Create a body-type specific workout plan for a ${user.age} year old ${user.gender} with a ${user.bodyShape} body shape.
      The goal is aesthetic symmetry and general fitness, not bodybuilding.
      Focus on balancing proportions suitable for a ${user.bodyShape} (e.g., if Pear, focus on upper body width; if Apple, focus on core definition and leg toning).
      Keep it accessible for a home workout.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: WORKOUT_SCHEMA,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as WorkoutPlan;
    }
    return null;
  } catch (error) {
    console.error("Error generating workout plan:", error);
    return null;
  }
};

export const analyzeBeautyProfile = async (imageBase64: string): Promise<BeautyAnalysis | null> => {
  try {
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          },
          {
            text: "Analyze this face for comprehensive beauty styling. Determine Face Shape (Oval, Round, etc), Skin Tone, Undertone. Suggest specific colors for Lipstick, Foundation, Contour, and Concealer (in Hex). Recommend Hairstyle keywords. Provide placement advice for contour/blush."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: BEAUTY_ANALYSIS_SCHEMA,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as BeautyAnalysis;
    }
    return null;
  } catch (error) {
    console.error("Error analyzing beauty profile:", error);
    return null;
  }
};

export const analyzeColorPalette = async (imageBase64: string): Promise<ColorPaletteAnalysis | null> => {
  try {
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          },
          {
            text: "Perform a seasonal color analysis on this person (e.g., Autumn, Winter, Spring, Summer and their sub-types like Deep Autumn, Light Spring, etc.). Suggest a color palette for their clothing including best colors, neutrals, and colors to avoid."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: COLOR_PALETTE_SCHEMA,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ColorPaletteAnalysis;
    }
    return null;
  } catch (error) {
    console.error("Error analyzing color palette:", error);
    return null;
  }
};