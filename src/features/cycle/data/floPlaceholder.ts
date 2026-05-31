import { addDays, format } from 'date-fns';
import { FloData } from '../../../types';

const CYCLE_LENGTHS = [32, 35, 33, 38, 34, 36, 32, 40, 35, 33, 37, 34, 36, 32, 35, 38, 34, 36, 33, 35, 37, 34, 36, 32];
const PERIOD_LENGTHS = [5, 6, 5, 7, 5, 6, 5, 5, 6, 5, 7, 5, 6, 5, 5, 6, 5, 7, 5, 6, 5, 5, 6, 5];

function generateFloData(): FloData {
  const cycles = [];
  let cursor = new Date(2024, 0, 3);

  for (let i = 0; i < CYCLE_LENGTHS.length; i++) {
    const cycleLength = CYCLE_LENGTHS[i];
    const periodLength = PERIOD_LENGTHS[i];
    const endDate = addDays(cursor, cycleLength - 1);

    cycles.push({
      start_date: format(cursor, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      cycle_length: cycleLength,
      period_length: periodLength,
    });

    cursor = addDays(cursor, cycleLength);
  }

  return { cycles };
}

export const floPlaceholderData: FloData = generateFloData();
