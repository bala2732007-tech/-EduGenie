import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export function cleanJsonBlock(text: string): string {
  // Cleans Markdown code fences (e.g. ```json ... ```) matching clean_json_block from PDF
  return text.replace(/```(?:json)?\n?([\s\S]*?)```/g, '$1').trim();
}

/**
 * QnA Module: Powered by Google Gemini to answer educational & general knowledge queries
 */
export async function answerQuestionWithGemini(question: string): Promise<string> {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: question,
    });
    return response.text?.trim() || 'No answer generated.';
  } catch (error: any) {
    console.error('Error in QnA:', error);
    return `⚠️ Error in QnA: ${error?.message || error}`;
  }
}

/**
 * Explanation Module: Breaks down complex concepts in a simplified, accessible way
 */
export async function explainTopic(topic: string): Promise<string> {
  try {
    const ai = getGeminiClient();
    const prompt = `Explain the concept of '${topic}' in a simple and clear way for a school student.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    return response.text?.trim() || 'No explanation generated.';
  } catch (error: any) {
    console.error('Error in Explanation:', error);
    return `⚠️ Error in Explanation: ${error?.message || error}`;
  }
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

/**
 * Quiz Module: Generates 3 MCQs with 4 options each and a validated correct answer
 */
export async function generateQuiz(text: string): Promise<QuizQuestion[]> {
  const prompt = `You are a quiz generator.

From the following passage, create 3 multiple-choice questions. Each question should include:
- A "question"
- A list of 4 "options"
- A correct "answer" that must exactly match one of the options.

Format your output as **valid JSON**, like this:
[
  {
    "question": "What is ...?",
    "options": ["A", "B", "C", "D"],
    "answer": "A"
  }
]

Passage:
${text}`;

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '[]';
    const cleaned = cleanJsonBlock(rawText);
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => ({
        question: String(item.question || ''),
        options: Array.isArray(item.options) ? item.options.map(String) : [],
        answer: String(item.answer || ''),
      }));
    }
    return [];
  } catch (error: any) {
    console.error('Error in Quiz Generation:', error);
    throw new Error(`Failed to generate quiz: ${error?.message || error}`);
  }
}

/**
 * Summary Module: Summarizes educational passages into concise, easy-to-understand text
 */
export async function summarizeText(text: string): Promise<string> {
  try {
    const ai = getGeminiClient();
    const prompt = `Summarize the following text in simple language:\n\n${text}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    return response.text?.trim() || 'No summary generated.';
  } catch (error: any) {
    console.error('Error in Summary:', error);
    return `⚠️ Error in Summary: ${error?.message || error}`;
  }
}

/**
 * Learning Path Module: Suggests structured recommendations from beginner to advanced
 */
export async function getLearningRecommendations(topic: string): Promise<string> {
  const prompt = `You are an AI tutor. The student wants to learn about: ${topic}.
Suggest a structured and adaptive learning path including key topics, order of learning, and resources (videos, articles, books). Include beginner, intermediate, and advanced levels if needed.`;

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    if (response.text) {
      return response.text.trim();
    }
    return 'Could not extract content from Gemini response.';
  } catch (error: any) {
    console.error('Error in Learning Path:', error);
    return `⚠️ Error occurred: ${error?.message || error}`;
  }
}
