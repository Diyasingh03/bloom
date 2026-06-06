import { useState, useEffect, useCallback } from 'react';
import { UserConstraints } from '../types';
import { storageGet, storageSet, STORAGE_KEYS } from '../lib/storage';
import { DEFAULT_CONSTRAINTS } from '../lib/defaultConstraints';

export function useConstraints() {
  const [constraints, setConstraints] = useState<UserConstraints>(DEFAULT_CONSTRAINTS);

  useEffect(() => {
    storageGet<UserConstraints>(STORAGE_KEYS.USER_CONSTRAINTS).then(stored => {
      if (stored) setConstraints(stored);
    });
  }, []);

  const saveConstraints = useCallback(async (c: UserConstraints) => {
    setConstraints(c);
    await storageSet(STORAGE_KEYS.USER_CONSTRAINTS, c);
  }, []);

  const resetConstraints = useCallback(async () => {
    setConstraints(DEFAULT_CONSTRAINTS);
    await storageSet(STORAGE_KEYS.USER_CONSTRAINTS, DEFAULT_CONSTRAINTS);
  }, []);

  return { constraints, saveConstraints, resetConstraints };
}
