import type { PlateNumber } from '../../../data-access/models';
import { toFaDigits } from '../../utils/fa-digits';

export function formatPlate(plate: PlateNumber): string {
  return toFaDigits(`${plate.part1} ${plate.part2} ${plate.letter} ${plate.iranCode}`);
}
