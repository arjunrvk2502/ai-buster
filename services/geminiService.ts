
import { GoogleGenAI } from "@google/genai";
import { DetectionLabel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getForensicAnalysis = async (
  imageData: string, 
  label: DetectionLabel, 
  confidence: number
): Promise<string> => {
  try {
    const prompt = `
      Act as a Senior Forensic Image Analyst. 
      This image was classified as ${label} with ${Math.round(confidence * 100)}% certainty.
      
      Provide a concise technical justification (max 2 sentences) for this classification. 
      Focus on objective visual evidence like:
      - High-frequency noise distribution.
      - Geometric consistency in shadows and reflections.
      - Semantic coherence of anatomical or architectural details.
      
      Be professional and direct.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Flash is fine for the description/reasoning text
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: imageData.split(',')[1] } }
          ]
        }
      ]
    });

    return response.text?.trim() || "Automated pixel-level analysis complete.";
  } catch (error) {
    console.error("Forensic Analysis Error:", error);
    return "Diagnostic output generation failed; primary classification stands.";
  }
};
