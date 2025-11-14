
import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult, Language } from '../types';

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

export const analyzeImage = async (base64Image: string, mimeType: string, language: Language): Promise<ScanResult> => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    throw new Error("API key is not configured. Please ensure it is set up correctly.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const imageParts = [fileToGenerativePart(base64Image, mimeType)];
  
  let languageInstruction = "You MUST respond in English.";
  if (language === 'he') {
    languageInstruction = "You MUST respond in Hebrew.";
  } else if (language === 'ar') {
    languageInstruction = "You MUST respond in Arabic.";
  } else if (language === 'es') {
    languageInstruction = "You MUST respond in Spanish.";
  } else if (language === 'fr') {
    languageInstruction = "You MUST respond in French.";
  } else if (language === 'de') {
    languageInstruction = "You MUST respond in German.";
  }

  const systemInstruction = `You are an expert dermatological AI assistant. Your goal is to provide a preliminary assessment, NOT a definitive diagnosis. Adhere strictly to the JSON schema provided.`;

  // The prompt is streamlined. Instructions for JSON output are removed as they are enforced by responseSchema.
  const prompt = `
    Analyze the provided image of a skin symptom.
    ${languageInstruction}
    
    Based on the image, provide the following details:
    1. A list of up to 3 possible conditions.
    2. An overall urgency level.
    3. A general recommendation.
    4. A list of potential over-the-counter product recommendations (or an empty array).
    5. A confidence score for the analysis.
    6. A mandatory disclaimer about this not being a medical diagnosis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts: [...imageParts, { text: prompt }] },
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  condition: { type: Type.STRING, description: "The name of the possible skin condition." },
                  probability: { type: Type.NUMBER, description: "The likelihood of this condition, from 0 to 1." },
                  urgency: { type: Type.STRING, enum: ['green', 'yellow', 'red'], description: "The urgency level associated with this specific condition." },
                  description: { type: Type.STRING, description: "A brief, simple description of the condition." },
                },
                required: ['condition', 'probability', 'urgency', 'description']
              }
            },
            overall_urgency: { type: Type.STRING, enum: ['green', 'yellow', 'red'], description: "The single most appropriate urgency level for the overall assessment." },
            recommendation: { type: Type.STRING, description: "Safe, general at-home care suggestions and clear advice on when to see a doctor." },
            disclaimer: { type: Type.STRING, description: "A mandatory disclaimer stating this is not a substitute for professional medical advice." },
            confidence: { type: Type.NUMBER, description: "A score from 0 to 1 representing the AI's confidence in the overall analysis." },
            product_recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "The name of a suggested over-the-counter product." },
                  purpose: { type: Type.STRING, description: "The reason for recommending the product." },
                },
                required: ['name', 'purpose']
              }
            }
          },
          required: ['predictions', 'overall_urgency', 'recommendation', 'disclaimer', 'confidence']
        }
      }
    });

    const text = response.text.trim();
    const result = JSON.parse(text);
    return result as ScanResult;

  } catch (error)
 {
    console.error("Error analyzing image with Gemini:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       throw new Error("The configured API key is invalid. Please check your configuration.");
    }
    throw new Error("Failed to analyze the image. The AI model may be temporarily unavailable. Please try again later.");
  }
};
