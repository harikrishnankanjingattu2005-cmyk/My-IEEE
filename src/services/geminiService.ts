import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PlagiarismResult {
  score: number;
  matches: {
    text: string;
    source: string;
    similarity: number;
    url?: string;
  }[];
  citationAnalysis: {
    isCompliant: boolean;
    issues: string[];
  };
  summary: string;
}

export async function analyzePlagiarism(text: string): Promise<PlagiarismResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Analyze the following academic text for potential plagiarism and IEEE citation compliance. 
    Use Google Search to cross-reference against existing publications.
    
    Text to analyze:
    ${text}`,
    config: {
      systemInstruction: `You are a professional IEEE academic integrity auditor. 
      Your task is to analyze research papers for plagiarism and citation compliance.
      
      IEEE Citation Standards:
      - Citations must be numbered in square brackets, e.g., [1].
      - References must be listed at the end in numerical order.
      - Each citation in text must match a reference in the list.
      
      Plagiarism Analysis:
      - Scan for verbatim matches with existing literature.
      - Identify paraphrasing without proper attribution.
      - Calculate a similarity score (0-100).
      
      Return a JSON object with:
      - score: number (0-100)
      - matches: array of { text, source, similarity, url }
      - citationAnalysis: { isCompliant: boolean, issues: string[] }
      - summary: A 2-3 sentence overview of the findings.`,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
    },
  });

  try {
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Analysis failed. Please try again.");
  }
}
