import type { Vehicle } from '../models';

export const MOCK_VEHICLES: readonly Vehicle[] = [
  {
    id: 'v1',
    type: 'پراید',
    plate: { part1: '11', part2: '365', letter: 'س', iranCode: '45' },
  },
  {
    id: 'v2',
    type: 'کوییک',
    plate: { part1: '55', part2: '123', letter: 'ج', iranCode: '12' },
  },
];
