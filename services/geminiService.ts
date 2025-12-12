import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, ChatMessage, Outfit, WeatherData, WorkoutPlan, BodyShape, BeautyAnalysis } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION_BASE = `
You are Ixora, a world-class personal fashion designer and stylist. 
Your goal is to help the user feel seen and styled.
You understand body types, skin tones (color analysis), and face shapes deepy.
You are empathetic, direct, and confident. Avoid fluff.
When suggesting outfits, explain "Why it works for you" based on their specific profile.
Respect budget and constraints.
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
          price: { type: Type.NUMBER },
          currency: { type: Type.STRING },
          brand: { type: Type.STRING },
          imageUrl: { type: Type.STRING, description: "A placeholder URL" },
          url: { type: Type.STRING, description: "A placeholder purchase URL" },
          tracking: { type: Type.BOOLEAN },
        },
        required: ["name", "brand", "price"],
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
    skinTone: { type: Type.STRING },
    undertone: { type: Type.STRING },
    recommendedLipColors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of 4 hex color codes" },
    recommendedHairStyles: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["skinTone", "undertone", "recommendedLipColors", "recommendedHairStyles"]
};

export const generateDailyOutfit = async (user: UserProfile, weather: WeatherData): Promise<Outfit | null> => {
  try {
    const prompt = `
      Create a daily outfit for ${user.name}.
      Profile: Age ${user.age}, ${user.gender}, Body: ${user.bodyShape}, Skin: ${user.skinTone}.
      Style: ${user.stylePreferences.join(", ")}.
      Context: Weather is ${weather.condition}, ${weather.temp}°C in ${weather.location}.
      
      Provide a complete look including accessories.
      For image URLs, use "https://picsum.photos/300/400?random=1" (increment random number).
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
        
        If the user specifically asks for an outfit recommendation, specific clothing items, or a "look", 
        you MUST include a JSON block at the END of your response strictly following this schema:
        ${JSON.stringify(OUTFIT_SCHEMA)}
        
        Otherwise, just reply with helpful text advice.
        `,
      },
      history: recentHistory
    });

    const result = await chat.sendMessage({ message: newMessage });
    const responseText = result.text;
    
    let finalOutfit: Outfit | undefined;
    let finalText = responseText;

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const potentialJson = JSON.parse(jsonMatch[0]);
        if (potentialJson.title && potentialJson.items) {
           finalOutfit = potentialJson as Outfit;
           finalText = responseText.replace(jsonMatch[0], '').trim();
        }
      } catch (e) {
        // Failed to parse JSON, treat as text
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
    // Remove data URL prefix if present for the API call
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
            text: "Analyze this face for personal color analysis. Determine skin tone and undertone. Suggest 4 specific lipstick hex color codes that would suit them best. Suggest 2 hairstyle keywords."
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