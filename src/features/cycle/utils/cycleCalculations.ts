import { differenceInDays, parseISO, format, addDays } from 'date-fns';
import { CyclePhase, CycleDay, Cycle } from '../../../types';

export function getPhaseForDay(cycleDay: number, cycleLength: number): CyclePhase {
  const lutealStart = Math.max(17, cycleLength - 14);
  if (cycleDay <= 5) return 'menstrual';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay < lutealStart) return 'ovulatory';
  return 'luteal';
}

export function getCurrentCycleDay(lastPeriodStart: string): number {
  const start = parseISO(lastPeriodStart);
  const today = new Date();
  const diff = differenceInDays(today, start) + 1;
  return Math.max(1, diff);
}

export function buildCycleDayMap(lastPeriodStart: string, cycleLength: number): CycleDay[] {
  const days: CycleDay[] = [];
  const start = parseISO(lastPeriodStart);
  for (let i = 0; i < cycleLength; i++) {
    const date = addDays(start, i);
    const cycleDay = i + 1;
    days.push({
      date: format(date, 'yyyy-MM-dd'),
      cycleDay,
      phase: getPhaseForDay(cycleDay, cycleLength),
    });
  }
  return days;
}

export function getAverageCycleLength(cycles: Cycle[]): number {
  const complete = cycles.filter(c => c.cycle_length >= 15);
  if (!complete.length) return 32;
  const sum = complete.reduce((acc, c) => acc + c.cycle_length, 0);
  return Math.round(sum / complete.length);
}

export function getMostRecentCycle(cycles: Cycle[]): Cycle | null {
  if (!cycles.length) return null;
  return [...cycles].sort(
    (a, b) => parseISO(b.start_date).getTime() - parseISO(a.start_date).getTime()
  )[0];
}

export function getDaysUntil(targetDate: string): number {
  const target = parseISO(targetDate);
  const today = new Date();
  return differenceInDays(target, today);
}
