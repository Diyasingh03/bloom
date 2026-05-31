import { useState, useEffect } from 'react';
import { SymptomLog } from '../../../types';
import { storageGet, storageSet, STORAGE_KEYS } from '../../../lib/storage';

export function useSymptomLog() {
  const [logs, setLogs] = useState<SymptomLog[]>([]);

  useEffect(() => {
    storageGet<SymptomLog[]>(STORAGE_KEYS.SYMPTOMS).then((stored) => {
      if (stored) setLogs(stored);
    });
  }, []);

  const saveLog = async (entry: SymptomLog) => {
    const updated = [...logs.filter((l) => l.date !== entry.date), entry];
    setLogs(updated);
    await storageSet(STORAGE_KEYS.SYMPTOMS, updated);
  };

  const getLogForDate = (date: string): SymptomLog | null =>
    logs.find((l) => l.date === date) ?? null;

  return { logs, saveLog, getLogForDate };
}
