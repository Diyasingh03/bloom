import { CyclePhase, FloPredictions, GroceryItem, UserConstraints } from '../../types';
import { PhaseThemes } from '../../constants/theme';
import { getDaysUntil } from '../../features/cycle/utils/cycleCalculations';

const APPLIANCE_LABELS: Record<string, string> = {
  stovetop: 'Stovetop (pots and pans)',
  microwave: 'Microwave',
  oven: 'Oven',
  airFryer: 'Air fryer',
};

function buildCookingBlock(c: UserConstraints['cookingAppliances']): string {
  const active = (Object.keys(c) as (keyof typeof c)[]).filter(k => c[k]).map(k => APPLIANCE_LABELS[k]);
  const inactive = (Object.keys(c) as (keyof typeof c)[]).filter(k => !c[k]).map(k => APPLIANCE_LABELS[k]);
  const line = active.join(' and ') + ' ONLY';
  return inactive.length ? `${line} — absolutely no ${inactive.join(' or ')}` : line;
}

interface PromptParams {
  phase: CyclePhase;
  cycleDay: number;
  cycleLength: number;
  inStockItems: GroceryItem[];
  predictions?: FloPredictions | null;
  constraints: UserConstraints;
}

export function buildDailyPrompt(params: PromptParams): string {
  const { phase, cycleDay, cycleLength, inStockItems, predictions, constraints } = params;
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

  const equipmentList = constraints.equipment.map(e => `- ${e}`).join('\n');

  return `You are a PCOS wellness assistant for a personal iOS app. Generate today's personalised daily content.

USER CONTEXT:
- Condition: PCOS (Polycystic Ovary Syndrome)
- Current cycle day: ${cycleDay} of approximately ${cycleLength} days
- Current phase: ${phaseLabel}
${predictionsBlock}

AVAILABLE WORKOUT EQUIPMENT:
${equipmentList}

COOKING CONSTRAINTS:
- ${buildCookingBlock(constraints.cookingAppliances)}
- Prefer ingredients from the grocery list below
- You may suggest 1–2 additional ingredients to order, prefixed with "💡 Could add:"

CURRENT GROCERY LIST (items in stock):
${groceryList}

DIETARY NOTES:
${constraints.dietaryNotes}

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
