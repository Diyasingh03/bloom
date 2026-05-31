import { CyclePhase, FloPredictions, GroceryItem } from '../../types';
import { PhaseThemes } from '../../constants/theme';
import { getDaysUntil } from '../../features/cycle/utils/cycleCalculations';

interface PromptParams {
  phase: CyclePhase;
  cycleDay: number;
  cycleLength: number;
  inStockItems: GroceryItem[];
  predictions?: FloPredictions | null;
}

export function buildDailyPrompt(params: PromptParams): string {
  const { phase, cycleDay, cycleLength, inStockItems, predictions } = params;
  const phaseLabel = PhaseThemes[phase].label;

  const groceryList = inStockItems.length > 0
    ? inStockItems.map((i) => `- ${i.name}${i.quantity ? ` (${i.quantity})` : ''}`).join('\n')
    : '- No items listed (suggest common PCOS-friendly staples)';

  const predictionsBlock = predictions
    ? `
Flo app predictions:
- Predicted ovulation: ${predictions.ovulationDate} (${getDaysUntil(predictions.ovulationDate)} days away)
- Predicted next period: ${predictions.nextCycleStart} (${getDaysUntil(predictions.nextCycleStart)} days away)
Factor these into your recommendations (e.g. if ovulation is tomorrow, suggest peak-energy workout; if period is in 2 days, focus on anti-cramp foods and gentler movement).`
    : '';

  return `You are a PCOS wellness assistant for a personal iOS app. Generate today's personalised daily content.

USER CONTEXT:
- Condition: PCOS (Polycystic Ovary Syndrome)
- Current cycle day: ${cycleDay} of approximately ${cycleLength} days
- Current phase: ${phaseLabel}
${predictionsBlock}

AVAILABLE WORKOUT EQUIPMENT (home only, no gym):
- Pilates mat
- Small water bottles (light hand weights)
- Two gallon milk containers (~8 lbs each) as dumbbells
- Treadmill
- Stationary cycle machine

COOKING CONSTRAINTS:
- Stovetop (pots and pans) and microwave ONLY — absolutely no oven
- Prefer ingredients from the grocery list below
- You may suggest 1–2 additional ingredients to order, prefixed with "💡 Could add:"

CURRENT GROCERY LIST (items in stock):
${groceryList}

DIETARY NOTES:
- User loves dairy (yogurt, cheese, milk)
- Eats eggs, ham (pre-cooked/sliced), frozen patties, avocado
- Willing to cook raw chicken on the stovetop
- Does not eat whole fruit but drinks fruit juices
- Focus on low GI, anti-inflammatory, PCOS-appropriate nutrition

Generate a response with EXACTLY this JSON structure. Return ONLY valid JSON — no markdown, no explanation, no code fences:

{
  "insight": "2-3 sentences of warm, personalised phase insight for PCOS management today",
  "motivationalMessage": "one short encouraging message (max 15 words)",
  "phaseTip": "one specific actionable PCOS tip for the ${phaseLabel} phase",
  "workout": {
    "name": "workout name",
    "type": "Pilates|Treadmill|Cycle|Strength|Yoga|Barre|Recovery",
    "durationMinutes": 30,
    "intensity": "gentle|moderate|high|peak",
    "equipment": ["list only from available equipment"],
    "steps": [
      {"order": 1, "instruction": "clear step instruction", "duration": "time or rep count"}
    ],
    "benefits": "one sentence PCOS-specific benefit",
    "emoji": "single relevant emoji"
  },
  "meals": {
    "breakfast": {
      "name": "meal name",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "pcosNote": "PCOS benefit in one sentence",
      "prepTime": 10,
      "emoji": "single food emoji"
    },
    "lunch": {
      "name": "meal name",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "pcosNote": "PCOS benefit in one sentence",
      "prepTime": 15,
      "emoji": "single food emoji"
    },
    "dinner": {
      "name": "meal name",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "pcosNote": "PCOS benefit in one sentence",
      "prepTime": 20,
      "emoji": "single food emoji"
    },
    "snack": {
      "name": "snack name",
      "ingredients": ["ingredient 1"],
      "pcosNote": "PCOS benefit in one sentence",
      "prepTime": 3,
      "emoji": "single food emoji"
    }
  }
}`;
}
