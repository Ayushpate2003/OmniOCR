
import { GoogleGenAI } from "@google/genai";

// Using the provided environment key or a placeholder
const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const performGeminiOCR = async (file: File): Promise<string> => {
  const model = "gemini-3-flash-preview";
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Convert file to base64
  const base64Data = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });

  const response = await ai.models.generateContent({
    model: model,
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data,
            },
          },
          {
            text: "You are a professional OCR engine. Extract all text from this document exactly as it appears. Support multiple languages including Marathi/Hindi if present. Maintain the structure as much as possible. Return only the extracted text.",
          },
        ],
      },
    ],
  });

  return response.text || "No text could be extracted.";
};
