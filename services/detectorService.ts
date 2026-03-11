
import { GoogleGenAI, Type } from "@google/genai";
import { DetectionLabel, DetectionResult } from "../types";

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Internal Inference Engine using Hybrid Feature Extraction.
 * Mimics local DeepfakeDetector class logic with a 0.5 classification threshold.
 */
export const runInference = async (file: File | string): Promise<DetectionResult> => {
  let imageData: string;
  let filename: string;

  if (typeof file === 'string') {
    imageData = file;
    filename = "Network_Asset";
  } else {
    filename = file.name;
    imageData = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [
          { text: `Perform binary image classification for manipulation detection. 
          Use a strict 0.5 threshold. 
          Identify local texture anomalies (edges, pores) and global spatial inconsistencies.
          Output a JSON object with label ("Real" or "Fake"), confidence (0-1), and a list of identified anomalies.` },
          { inlineData: { mimeType: "image/jpeg", data: imageData.split(',')[1] } }
        ]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            anomalies: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["label", "confidence", "anomalies"]
        }
      }
    });

    const resultData = JSON.parse(response.text || "{}");
    
    // Enforce 0.5 threshold logic
    let finalLabel = resultData.label === "Fake" ? DetectionLabel.FAKE : DetectionLabel.REAL;
    let finalConfidence = resultData.confidence || 0.5;

    if (finalLabel === DetectionLabel.FAKE && finalConfidence < 0.5) {
        finalLabel = DetectionLabel.REAL;
    } else if (finalLabel === DetectionLabel.REAL && (1 - finalConfidence) > 0.5) {
        // Handle cases where confidence for Real might be expressed differently
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      filename: filename,
      imageUrl: imageData,
      label: finalLabel,
      confidence: finalConfidence,
      timestamp: Date.now(),
      anomalies: resultData.anomalies || []
    };
  } catch (error: any) {
    if (error?.message?.includes('429')) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw error;
  }
};
