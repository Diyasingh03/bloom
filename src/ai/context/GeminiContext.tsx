import React, { createContext, useContext, ReactNode } from 'react';
import { useCycleData } from '../../features/cycle/hooks/useCycleData';
import { useGroceryList } from '../../features/groceries/hooks/useGroceryList';
import { useGeminiDaily, GeminiDailyState } from '../hooks/useGeminiDaily';

const GeminiContext = createContext<GeminiDailyState | null>(null);

export function GeminiProvider({ children }: { children: ReactNode }) {
  const cycle = useCycleData();
  const { inStockItems } = useGroceryList();

  const gemini = useGeminiDaily({
    phase: cycle.phase,
    cycleDay: cycle.cycleDay,
    cycleLength: cycle.cycleLength,
    inStockItems,
    predictions: cycle.predictions,
    ready: !cycle.isLoading,
  });

  return <GeminiContext.Provider value={gemini}>{children}</GeminiContext.Provider>;
}

export function useGemini(): GeminiDailyState {
  const ctx = useContext(GeminiContext);
  if (!ctx) throw new Error('useGemini must be used within GeminiProvider');
  return ctx;
}
