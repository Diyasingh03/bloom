import { DailyAIContent, CyclePhase, FloPredictions, GroceryItem, UserConstraints } from '../../types';
import { buildDailyPrompt } from '../prompts/dailyPrompt';
import { config } from '../../lib/config';
import { DEFAULT_CONSTRAINTS } from '../../lib/defaultConstraints';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface GenerateParams {
  phase: CyclePhase;
  cycleDay: number;
  cycleLength: number;
  inStockItems: GroceryItem[];
  predictions?: FloPredictions | null;
  constraints?: UserConstraints;
}

export async function generateDailyContent(params: GenerateParams): Promise<DailyAIContent | null> {
  const apiKey = config.geminiApiKey;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') return null;

  const prompt = buildDailyPrompt({
    ...params,
    constraints: params.constraints ?? DEFAULT_CONSTRAINTS,
  });

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (response.status === 429) throw new Error('rate_limited');
    if (!response.ok) return null;

    const data = await response.json();
    const parts: { text?: string; thought?: boolean }[] = data?.candidates?.[0]?.content?.parts ?? [];
    const rawText: string = parts.filter(p => !p.thought).map(p => p.text ?? '').join('');
    console.log('[Gemini] ok — tokens used:', data?.usageMetadata?.totalTokenCount);

    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned) as DailyAIContent;

    if (!parsed.insight || !parsed.workout || !parsed.meals?.breakfast) return null;

    return {
      ...parsed,
      date: new Date().toISOString().split('T')[0],
    };
  } catch (e) {
    if (e instanceof Error && e.message === 'rate_limited') throw e;
    return null;
  }
}
