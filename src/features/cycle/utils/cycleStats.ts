import { differenceInDays, parseISO } from 'date-fns';
import { Cycle } from '../../../types';

export interface CycleStats {
  total: number;
  complete: number;
  firstDate: string;
  lastDate: string;
  avgLength: number;
  medianLength: number;
  shortestLength: number;
  longestLength: number;
  stdDev: number;
  avgPeriodLength: number;
  shortestPeriod: number;
  longestPeriod: number;
  withOvulation: number;
  avgOvulationDay: number | null;
  trendDirection: 'shortening' | 'lengthening' | 'stable';
  regularityChange: 'improving' | 'worsening' | 'stable';
  pctRegular: number; // % of complete cycles in 21–35 day range
  chartCycles: ChartCycle[];
  ovulationPoints: OvulationPoint[];
}

export interface ChartCycle {
  index: number;
  label: string;
  cycleLength: number;
  periodLength: number;
  inProgress: boolean;
}

export interface OvulationPoint {
  index: number;
  label: string;
  ovulationDay: number;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: number[]): number {
  const m = mean(values);
  return Math.round(Math.sqrt(values.reduce((a, v) => a + (v - m) ** 2, 0) / values.length));
}

export function computeCycleStats(cycles: Cycle[]): CycleStats | null {
  if (cycles.length < 2) return null;

  const sorted = [...cycles].sort(
    (a, b) => parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime(),
  );

  const complete = sorted.filter((c) => c.cycle_length >= 15);
  if (complete.length === 0) return null;

  const lengths = complete.map((c) => c.cycle_length);
  const periodLengths = sorted.map((c) => c.period_length).filter((l) => l > 0);

  // Trend: compare last 4 complete vs prior 4 complete
  const half = Math.min(4, Math.floor(complete.length / 2));
  const recent = complete.slice(-half).map((c) => c.cycle_length);
  const prior = complete.slice(-(half * 2), -half).map((c) => c.cycle_length);
  const diff = mean(recent) - mean(prior);
  const trendDirection =
    diff > 2.5 ? 'lengthening' : diff < -2.5 ? 'shortening' : 'stable';

  // Regularity: compare std dev of recent vs prior
  const recentStd = stdDev(recent);
  const priorStd = stdDev(prior);
  const regularityChange =
    recentStd < priorStd - 1 ? 'improving'
    : recentStd > priorStd + 1 ? 'worsening'
    : 'stable';

  // Ovulation stats
  const withOv = sorted.filter((c) => c.ovulation && c.ovulation !== 'N/A');
  const ovDays = withOv.map((c) => differenceInDays(parseISO(c.ovulation!), parseISO(c.start_date)) + 1);
  const avgOvulationDay = ovDays.length > 0 ? Math.round(mean(ovDays)) : null;

  const pctRegular = Math.round(
    (lengths.filter((l) => l >= 21 && l <= 35).length / lengths.length) * 100,
  );

  // Chart data — show all cycles (mark last one as in-progress if incomplete)
  const lastCycle = sorted[sorted.length - 1];
  const isLastInProgress = lastCycle.cycle_length < 15;

  const chartCycles: ChartCycle[] = sorted.map((c, i) => {
    const date = parseISO(c.start_date);
    const label = `${date.toLocaleString('default', { month: 'short' })} '${String(date.getFullYear()).slice(2)}`;
    return {
      index: i,
      label,
      cycleLength: c.cycle_length,
      periodLength: c.period_length,
      inProgress: i === sorted.length - 1 && isLastInProgress,
    };
  });

  const ovulationPoints: OvulationPoint[] = sorted
    .map((c, i) => {
      if (!c.ovulation || c.ovulation === 'N/A') return null;
      const day = differenceInDays(parseISO(c.ovulation!), parseISO(c.start_date)) + 1;
      const date = parseISO(c.start_date);
      const label = `${date.toLocaleString('default', { month: 'short' })}`;
      return { index: i, label, ovulationDay: day };
    })
    .filter((x): x is OvulationPoint => x !== null);

  return {
    total: sorted.length,
    complete: complete.length,
    firstDate: sorted[0].start_date,
    lastDate: sorted[sorted.length - 1].start_date,
    avgLength: Math.round(mean(lengths)),
    medianLength: median(lengths),
    shortestLength: Math.min(...lengths),
    longestLength: Math.max(...lengths),
    stdDev: stdDev(lengths),
    avgPeriodLength: Math.round(mean(periodLengths)),
    shortestPeriod: Math.min(...periodLengths),
    longestPeriod: Math.max(...periodLengths),
    withOvulation: withOv.length,
    avgOvulationDay,
    trendDirection,
    regularityChange,
    pctRegular,
    chartCycles,
    ovulationPoints,
  };
}
