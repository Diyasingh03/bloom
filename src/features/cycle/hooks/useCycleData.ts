import { useState, useEffect, useCallback } from 'react';
import { FloData, Cycle, CyclePhase, FloPredictions } from '../../../types';
import { storageGet, storageSet, STORAGE_KEYS } from '../../../lib/storage';
import { floPlaceholderData } from '../data/floPlaceholder';
import {
  getMostRecentCycle,
  getAverageCycleLength,
  getCurrentCycleDay,
  getPhaseForDay,
  getDaysUntil,
} from '../utils/cycleCalculations';
import { format } from 'date-fns';

export interface CycleState {
  cycleDay: number;
  phase: CyclePhase;
  cycleLength: number;
  periodLength: number;
  lastPeriodStart: string;
  cycles: Cycle[];
  predictions: FloPredictions | null;
  isLoading: boolean;
  refreshCycle: () => void;
  savePredictions: (p: FloPredictions) => Promise<void>;
}

export function useCycleData(): CycleState {
  const [floData, setFloData] = useState<FloData>(floPlaceholderData);
  const [predictions, setPredictions] = useState<FloPredictions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const stored = await storageGet<FloData>(STORAGE_KEYS.FLO_DATA);
      if (stored?.cycles?.length) setFloData(stored);
      const storedPreds = await storageGet<FloPredictions>(STORAGE_KEYS.FLO_PREDICTIONS);
      if (storedPreds) setPredictions(storedPreds);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const savePredictions = useCallback(async (p: FloPredictions) => {
    setPredictions(p);
    await storageSet(STORAGE_KEYS.FLO_PREDICTIONS, p);
  }, []);

  const mostRecent = getMostRecentCycle(floData.cycles);
  const cycleLength = getAverageCycleLength(floData.cycles);
  const lastPeriodStart = mostRecent?.start_date ?? format(new Date(), 'yyyy-MM-dd');
  const cycleDay = getCurrentCycleDay(lastPeriodStart);
  const phase = getPhaseForDay(Math.min(cycleDay, cycleLength), cycleLength);

  return {
    cycleDay: Math.min(cycleDay, cycleLength),
    phase,
    cycleLength,
    periodLength: mostRecent?.period_length ?? 5,
    lastPeriodStart,
    cycles: floData.cycles,
    predictions,
    isLoading,
    refreshCycle: loadData,
    savePredictions,
  };
}
