import { DailyAIContent, CyclePhase, FloPredictions, GroceryItem } from '../../types';
import { buildDailyPrompt } from '../prompts/dailyPrompt';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GenerateParams {
  phase: CyclePhase;
  cycleDay: number;
  cycleLength: number;
  inStockItems: GroceryItem[];
  predictions?: FloPredictions | null;
}

export async function generateDailyContent(params: GenerateParams): Promise<DailyAIContent | null> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') return null;

  const prompt = buildDailyPrompt(params);

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned) as DailyAIContent;

    // Basic validation
    if (!parsed.insight || !parsed.workout || !parsed.meals?.breakfast) return null;

    return {
      ...parsed,
      date: new Date().toISOString().split('T')[0],
    };
  } catch {
    return null;
  }
}
