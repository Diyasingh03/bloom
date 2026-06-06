import { differenceInDays, parseISO, addDays, format } from 'date-fns';
import { Cycle, FloPredictions } from '../../../types';

const MIN_CYCLE_LENGTH = 15;
const DECAY = 0.7;
const WINDOW = 6;
const DEFAULT_LUTEAL = 15;

function completeCycles(cycles: Cycle[]): Cycle[] {
  return cycles.filter(c => c.cycle_length >= MIN_CYCLE_LENGTH);
}

function weightedLength(recent: Cycle[]): number {
  // Exponential decay: most recent cycle gets weight 1, each prior gets ×0.7
  const raw = recent.map((_, i) => Math.pow(DECAY, recent.length - 1 - i));
  const total = raw.reduce((a, b) => a + b, 0);
  const predicted = recent.reduce((acc, c, i) => acc + c.cycle_length * (raw[i] / total), 0);
  return Math.round(predicted);
}

function avgLuteal(cycles: Cycle[]): number {
  const withOv = cycles.filter(
    c => c.ovulation && c.ovulation !== 'N/A' && c.cycle_length >= MIN_CYCLE_LENGTH,
  );
  if (!withOv.length) return DEFAULT_LUTEAL;
  const phases = withOv.map(c => {
    const follicular = differenceInDays(parseISO(c.ovulation!), parseISO(c.start_date));
    return c.cycle_length - follicular;
  });
  return Math.round(phases.reduce((a, b) => a + b, 0) / phases.length);
}

function stdDev(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length;
  return Math.round(Math.sqrt(variance));
}

export function computePredictions(cycles: Cycle[]): (FloPredictions & { confidence: number }) | null {
  const complete = completeCycles(cycles);
  if (complete.length < 2) return null;

  // Use all sorted cycles to find most recent period start (may be in-progress)
  const sorted = [...cycles].sort(
    (a, b) => parseISO(b.start_date).getTime() - parseISO(a.start_date).getTime(),
  );
  const currentStart = sorted[0]?.start_date;
  if (!currentStart) return null;

  const recent = complete.slice(-WINDOW);
  const predictedLength = weightedLength(recent);
  const confidence = stdDev(recent.map(c => c.cycle_length));
  const luteal = avgLuteal(complete);

  const nextStart = addDays(parseISO(currentStart), predictedLength);
  const ovulation = addDays(nextStart, -luteal);

  return {
    nextCycleStart: format(nextStart, 'yyyy-MM-dd'),
    ovulationDate: format(ovulation, 'yyyy-MM-dd'),
    lastUpdated: format(new Date(), 'yyyy-MM-dd'),
    confidence,
    isComputed: true,
  };
}
