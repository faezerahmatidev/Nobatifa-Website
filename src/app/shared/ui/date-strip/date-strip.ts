import { ChangeDetectionStrategy, Component, ElementRef, input, model, viewChild } from '@angular/core';
import { Icon } from '../icon/icon';

export interface DateOption {
  id: string;
  weekday: string;
  date: string;
}

@Component({
  selector: 'app-date-strip',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-2">
      <button
        type="button"
        (click)="scrollBy(-1)"
        aria-label="روزهای قبل"
        class="shrink-0 rounded-lg p-2 text-gray-600"
      >
        <app-icon name="chevron-right" [size]="18" />
      </button>
      <div
        #scroller
        class="flex flex-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        @for (day of days(); track day.id) {
          <button
            type="button"
            (click)="selectedId.set(day.id)"
            [attr.aria-pressed]="selectedId() === day.id"
            [class]="dayClasses(day.id)"
          >
            <span
              [class]="
                selectedId() === day.id ? 'text-xs text-primary-bold' : 'text-xs text-gray-400'
              "
            >
              {{ day.weekday }}
            </span>
            <span class="text-sm font-bold">{{ day.date }}</span>
          </button>
        }
      </div>
      <button
        type="button"
        (click)="scrollBy(1)"
        aria-label="روزهای بعد"
        class="shrink-0 rounded-lg p-2 text-gray-600"
      >
        <app-icon name="chevron-left" [size]="18" />
      </button>
    </div>
  `,
})
export class DateStrip {
  readonly days = input.required<readonly DateOption[]>();
  readonly selectedId = model<string>('');

  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');

  protected dayClasses(id: string): string {
    const active = this.selectedId() === id;
    return (
      'flex min-w-[76px] flex-col items-center gap-0.5 border-b-2 px-3 py-1.5 ' +
      (active ? 'border-primary-base text-primary-bold' : 'border-transparent text-gray-500')
    );
  }

  protected scrollBy(direction: 1 | -1): void {
    this.scroller()?.nativeElement.scrollBy({ left: direction * 240, behavior: 'smooth' });
  }
}
