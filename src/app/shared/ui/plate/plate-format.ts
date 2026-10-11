import type { PlateNumber } from '../../../data-access/models';

export function formatPlate(plate: PlateNumber): string {
  return `${plate.part1} ${plate.part2} ${plate.letter} ${plate.iranCode}`;
}
