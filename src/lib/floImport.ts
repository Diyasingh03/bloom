import { FloData, Cycle } from '../types';

function isValidDate(str: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(Date.parse(str));
}

function isValidCycle(c: unknown): c is Cycle {
  if (!c || typeof c !== 'object') return false;
  const obj = c as Record<string, unknown>;
  const ovulationOk =
    obj.ovulation === undefined ||
    obj.ovulation === 'N/A' ||
    (typeof obj.ovulation === 'string' && isValidDate(obj.ovulation));
  return (
    typeof obj.start_date === 'string' &&
    typeof obj.end_date === 'string' &&
    typeof obj.cycle_length === 'number' &&
    typeof obj.period_length === 'number' &&
    isValidDate(obj.start_date as string) &&
    isValidDate(obj.end_date as string) &&
    obj.cycle_length > 0 &&
    ovulationOk
  );
}

export function parseFloJson(raw: string): FloData | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const cycles = Array.isArray(parsed.cycles) ? parsed.cycles.filter(isValidCycle) : [];
    if (cycles.length === 0) return null;
    return { cycles };
  } catch {
    return null;
  }
}
