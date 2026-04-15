import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("Gemini API key is missing. Set VITE_GEMINI_API_KEY in your environment.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

export interface PoemAnalysis {
  summary: string;
  lineByLine: string;
  themes: string;
  historicalContext: string;
}

export async function analyzePoem(title: string, poet: string, content: string): Promise<PoemAnalysis> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          summary: { type: SchemaType.STRING },
          lineByLine: { type: SchemaType.STRING },
          themes: { type: SchemaType.STRING },
          historicalContext: { type: SchemaType.STRING },
        },
        required: ["summary", "lineByLine", "themes", "historicalContext"],
      },
    },
  });

  const prompt = `Analyze the following poem:
Title: ${title}
Poet: ${poet}
Content:
${content}

Provide a comprehensive analysis including:
1. A concise summary.
2. A line-by-line or stanza-by-stanza explanation.
3. Key themes explored in the poem.
4. Historical context and the poet's life influences related to this work.

Return the response in JSON format.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  if (!text) {
    throw new Error("Failed to get analysis from Gemini");
  }

  return JSON.parse(text);
}

export async function askAboutPoem(title: string, poet: string, content: string, question: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an expert literary critic. A user has a question about the poem "${title}" by ${poet}.
Poem content:
${content}

User Question: ${question}

Provide a insightful, scholarly, yet accessible answer.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text() || "I'm sorry, I couldn't generate an answer at this time.";
}
