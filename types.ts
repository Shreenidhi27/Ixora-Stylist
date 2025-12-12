export enum BodyShape {
  Hourglass = 'Hourglass',
  Pear = 'Pear',
  Apple = 'Apple',
  Rectangle = 'Rectangle',
  InvertedTriangle = 'Inverted Triangle'
}

export enum SkinTone {
  FairCool = 'Fair (Cool Undertone)',
  FairWarm = 'Fair (Warm Undertone)',
  MediumNeutral = 'Medium (Neutral)',
  MediumWarm = 'Medium (Warm)',
  DeepCool = 'Deep (Cool)',
  DeepWarm = 'Deep (Warm)'
}

export enum Gender {
  Female = 'Female',
  Male = 'Male',
  NonBinary = 'Non-Binary',
  PreferNotToSay = 'Prefer not to say'
}

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  bodyShape: BodyShape;
  skinTone: SkinTone;
  heightCm: number;
  location: string; // For weather context
  stylePreferences: string[]; // e.g., "Minimalist", "Boho", "Streetwear"
  budget: 'Low' | 'Medium' | 'High' | 'Luxury';
  favoriteShades: string[]; // Hex codes of favorite colors
}

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  brand: string;
  imageUrl: string;
  url: string;
  tracking: boolean; // Is price tracking enabled?
  rating?: number;
  reviewCount?: number;
  source?: 'Amazon' | 'Myntra' | 'Ajio' | 'Other';
}

export interface Outfit {
  title: string;
  description: string;
  reasoning: string; // "Why it works for you"
  items: ProductItem[];
  tags: string[]; // e.g., "Casual", "Rainy Day"
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  outfit?: Outfit; // The model might return a structured outfit recommendation
}

export interface WeatherData {
  temp: number;
  condition: string;
  location: string;
}

export interface Exercise {
  name: string;
  reps: string;
  description: string;
  benefit: string; // Why this helps the specific body shape
}

export interface WorkoutPlan {
  focusArea: string; // e.g. "Lower Body & Core"
  goal: string; // e.g. "Create balance by adding volume to hips"
  frequency: string;
  warmup: string[];
  mainCircuit: Exercise[];
  cooldown: string[];
}

export interface BeautyAnalysis {
  skinTone: string;
  undertone: string;
  recommendedLipColors: string[]; // hex codes
  recommendedHairStyles: string[];
}

export interface PaletteColor {
  name: string;
  hex: string;
}

export interface ColorPaletteAnalysis {
  season: string; // e.g. "Deep Autumn"
  description: string;
  bestColors: PaletteColor[];
  neutrals: PaletteColor[];
  avoidColors: PaletteColor[];
}

export type ViewState = 'dashboard' | 'chat' | 'wardrobe' | 'profile' | 'commerce' | 'workout' | 'beauty' | 'palette';