import { FloData, Cycle } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isValidDate(str: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(Date.parse(str));
}

function toDateStr(raw: string): string {
  return raw.trim().split(' ')[0];
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b + 'T00:00:00Z').getTime() - new Date(a + 'T00:00:00Z').getTime()) / 86_400_000,
  );
}

// ─── Format 1: app's own simplified JSON ─────────────────────────────────────
// { "cycles": [{ start_date, end_date, cycle_length, period_length, ovulation? }] }

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

// ─── Format 2: raw Flo JSON export (flo.json) ────────────────────────────────
// root.operationalData.cycles[] + root.operationalData.point_events_manual_v2[]

export function parseFloJsonExport(raw: string): FloData | null {
  let root: Record<string, unknown>;
  try {
    root = JSON.parse(raw);
  } catch {
    return null;
  }

  const opData = root?.operationalData as Record<string, unknown> | undefined;
  if (!opData) return null;

  const rawCycles = opData.cycles as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(rawCycles) || rawCycles.length === 0) return null;

  const events = (opData.point_events_manual_v2 as Array<Record<string, unknown>>) ?? [];
  const eggwhiteDates: string[] = events
    .filter((e) => e.category === 'Fluid' && e.subcategory === 'Eggwhite' && e.date)
    .map((e) => toDateStr(e.date as string))
    .sort();

  const sorted = rawCycles
    .filter((c) => !c.pregnant && c.period_start_date && c.period_end_date)
    .map((c) => ({
      start: toDateStr(c.period_start_date as string),
      end: toDateStr(c.period_end_date as string),
    }))
    .filter((c) => isValidDate(c.start) && isValidDate(c.end))
    .sort((a, b) => a.start.localeCompare(b.start));

  if (sorted.length === 0) return null;

  const cycles: Cycle[] = sorted.map((c, i) => {
    const next = sorted[i + 1];
    const cycle_length = next ? daysBetween(c.start, next.start) : 0;
    const period_length = Math.max(1, daysBetween(c.start, c.end) + 1);

    const windowEnd = next?.start ?? '9999-12-31';
    const ov = eggwhiteDates.filter((d) => d >= c.start && d < windowEnd);
    const ovulation = ov.length > 0 ? ov[ov.length - 1] : undefined;

    const cycle: Cycle = { start_date: c.start, end_date: c.end, cycle_length, period_length };
    if (ovulation) cycle.ovulation = ovulation;
    return cycle;
  });

  return { cycles };
}

// ─── Format 3: Flo text export (res.txt) ─────────────────────────────────────
// "cycle N\nPeriod start date: ...\nPeriod end date: ...\n---\nmanual events\n..."

export function parseFloTxtExport(raw: string): FloData | null {
  const manualIdx = raw.indexOf('\nmanual events');
  const cycleSection = manualIdx !== -1 ? raw.slice(0, manualIdx) : raw;
  const manualSection = manualIdx !== -1 ? raw.slice(manualIdx) : '';

  const eggwhiteDates: string[] = [];
  for (const line of manualSection.split('\n')) {
    if (!line.includes('Fluid') || !line.includes('Eggwhite')) continue;
    const parts = line.split(' - ');
    if (parts.length < 5) continue;
    const d = parts[1].trim().split(' ')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) eggwhiteDates.push(d);
  }
  eggwhiteDates.sort();

  const blocks = cycleSection.split('---------------').map((b) => b.trim()).filter(Boolean);

  const sorted: Array<{ start: string; end: string }> = [];
  for (const block of blocks) {
    const startM = block.match(/Period start date:\s*(\d{4}-\d{2}-\d{2})/);
    const endM = block.match(/Period end date:\s*(\d{4}-\d{2}-\d{2})/);
    const pregM = block.match(/Pregnant:\s*(True|False)/i);
    if (!startM || !endM) continue;
    if (pregM?.[1]?.toLowerCase() === 'true') continue;
    sorted.push({ start: startM[1], end: endM[1] });
  }

  sorted.sort((a, b) => a.start.localeCompare(b.start));
  if (sorted.length === 0) return null;

  const cycles: Cycle[] = sorted.map((c, i) => {
    const next = sorted[i + 1];
    const cycle_length = next ? daysBetween(c.start, next.start) : 0;
    const period_length = Math.max(1, daysBetween(c.start, c.end) + 1);

    const windowEnd = next?.start ?? '9999-12-31';
    const ov = eggwhiteDates.filter((d) => d >= c.start && d < windowEnd);
    const ovulation = ov.length > 0 ? ov[ov.length - 1] : undefined;

    const cycle: Cycle = { start_date: c.start, end_date: c.end, cycle_length, period_length };
    if (ovulation) cycle.ovulation = ovulation;
    return cycle;
  });

  return { cycles };
}

// ─── Unified entry point ──────────────────────────────────────────────────────
// Tries all three formats in priority order. Returns data + detected format name.

export type FloImportFormat = 'flo-json-export' | 'flo-txt-export' | 'simplified-json';

export function parseAnyFloData(
  raw: string,
): { data: FloData; format: FloImportFormat } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('{')) {
    const asExport = parseFloJsonExport(trimmed);
    if (asExport) return { data: asExport, format: 'flo-json-export' };

    const asSimple = parseFloJson(trimmed);
    if (asSimple) return { data: asSimple, format: 'simplified-json' };
  }

  if (trimmed.startsWith('cycle ') || trimmed.includes('Period start date:')) {
    const asTxt = parseFloTxtExport(trimmed);
    if (asTxt) return { data: asTxt, format: 'flo-txt-export' };
  }

  return null;
}
