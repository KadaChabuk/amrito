
import { GoogleGenAI } from "@google/genai";

export const getSpiritualInsight = async (chapterContent: string, chapterTitle: string): Promise<string> => {
  if (!process.env.API_KEY) return "AI insights are unavailable at the moment.";

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analyze the following chapter from a spiritual text about Sri Sri Thakur Balak Brahmachari.
    Provide a concise (2-3 sentences) spiritual takeaway or lesson that a seeker might derive from this specific event.
    
    Chapter Title: ${chapterTitle}
    Chapter Content: ${chapterContent}
    
    Response format: Only provide the takeaway text, do not use prefixes like "Insight:" or "Takeaway:".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    return response.text || "No insights found.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The spirit of the text remains beyond words at this moment.";
  }
};
