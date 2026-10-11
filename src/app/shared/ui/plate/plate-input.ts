import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import type { PlateNumber } from '../../../data-access/models';

const LETTERS = [
  'الف', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'ژ', 'س', 'ش',
  'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'و', 'ه', 'ی',
];

const BOX =
  'h-12 rounded-lg border border-gray-300 bg-white text-center text-sm font-bold text-gray-900 outline-none focus:border-primary-base';

@Component({
  selector: 'app-plate-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-stretch gap-2" dir="rtl" role="group" aria-label="پلاک خودرو">
      <input
        [value]="plate().part1"
        (input)="update('part1', $event, 2)"
        class="w-16 {{ BOX }}"
        maxlength="2"
        inputmode="numeric"
        aria-label="دو رقم اول پلاک"
      />
      <input
        [value]="plate().part2"
        (input)="update('part2', $event, 3)"
        class="w-20 {{ BOX }}"
        maxlength="3"
        inputmode="numeric"
        aria-label="سه رقم پلاک"
      />
      <select
        [value]="plate().letter"
        (change)="update('letter', $event, 0)"
        class="w-20 {{ BOX }}"
        aria-label="حرف پلاک"
      >
        <option value="">الف</option>
        @for (letter of letters; track letter) {
          <option [value]="letter">{{ letter }}</option>
        }
      </select>
      <input
        [value]="plate().iranCode"
        (input)="update('iranCode', $event, 2)"
        class="w-16 {{ BOX }}"
        maxlength="2"
        inputmode="numeric"
        aria-label="کد ایران"
      />
    </div>
  `,
})
export class PlateInput {
  readonly plate = model<PlateNumber>({ part1: '', part2: '', letter: '', iranCode: '' });

  protected readonly BOX = BOX;
  protected readonly letters = LETTERS;

  protected update(part: keyof PlateNumber, event: Event, maxLength: number): void {
    const field = event.target as HTMLInputElement | HTMLSelectElement;
    const value =
      part === 'letter'
        ? field.value
        : field.value.replace(/\D/g, '').slice(0, maxLength);
    this.plate.update((plate) => ({ ...plate, [part]: value }));
  }
}
