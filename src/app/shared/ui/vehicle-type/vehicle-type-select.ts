import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Icon } from '../icon/icon';

export const VEHICLE_TYPES: readonly string[] = [
  'پراید',
  'تیبا',
  'تیبا ۲',
  'ساینا',
  'کوییک',
  'کوییک R',
  'شاهین',
  'سمند',
  'سورن',
  'پژو 206',
  'پژو 207',
  'پژو 405',
  'پژو پارس',
  'دنا',
  'دناپلاس',
  'تارا',
  'رانا',
  'هایما S5',
  'هایما S7',
  'جک J7',
  'ام‌وی‌ام X22',
  'چری تیگو',
  'لیفان X60',
  'برلیانس H330',
];

@Component({
  selector: 'app-vehicle-type-select',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'open.set(false)',
  },
  template: `
    <div class="flex flex-col gap-1">
      <span class="text-sm font-bold text-gray-800">{{ label() }}</span>
      <div class="relative">
        <button
          type="button"
          (click)="toggle()"
          [attr.aria-expanded]="open()"
          aria-haspopup="listbox"
          [class]="buttonClasses()"
        >
          <span [class]="control().value ? '' : 'text-gray-400'">
            {{ control().value || placeholder() }}
          </span>
          <app-icon name="chevron-down" [size]="16" />
        </button>
        @if (open()) {
          <div
            role="listbox"
            class="absolute z-10 mt-1 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
          >
            <input
              [value]="search()"
              (input)="onSearch($event)"
              placeholder="جستجو..."
              aria-label="جستجوی نوع خودرو"
              class="mb-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary-base"
            />
            <ul class="max-h-56 overflow-y-auto">
              @for (option of filtered(); track option) {
                <li role="option" [attr.aria-selected]="control().value === option">
                  <button
                    type="button"
                    (click)="select(option)"
                    class="block w-full rounded-lg px-3 py-2 text-right text-sm text-gray-800 hover:bg-primary-pale"
                  >
                    {{ option }}
                  </button>
                </li>
              } @empty {
                <li class="px-3 py-2 text-sm text-gray-500">موردی یافت نشد</li>
              }
            </ul>
          </div>
        }
      </div>
      @if (showError() && error()) {
        <p class="text-xs text-danger-bold" role="alert">{{ error() }}</p>
      }
    </div>
  `,
})
export class VehicleTypeSelect {
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<string>>();
  readonly placeholder = input('انتخاب کنید');
  readonly error = input<string | null>(null);
  readonly options = input<readonly string[]>(VEHICLE_TYPES);

  protected readonly open = signal(false);
  protected readonly search = signal('');
  private readonly elementRef = inject(ElementRef);

  protected readonly filtered = computed(() => {
    const query = this.search().trim();
    if (!query) {
      return [...this.options()];
    }
    return this.options().filter((option) => option.includes(query));
  });

  protected toggle(): void {
    const willOpen = !this.open();
    this.open.set(willOpen);
    if (!willOpen) {
      this.control().markAsTouched();
    }
  }

  protected select(option: string): void {
    this.control().setValue(option);
    this.control().markAsTouched();
    this.search.set('');
    this.open.set(false);
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.open.set(false);
    }
  }

  protected showError(): boolean {
    const control = this.control();
    return control.invalid && control.touched;
  }

  protected buttonClasses(): string {
    return (
      'flex h-12 w-full items-center justify-between rounded-lg border bg-white px-4 text-sm text-gray-900 outline-none transition-colors focus:border-primary-base ' +
      (this.showError() ? 'border-danger-base' : 'border-gray-300')
    );
  }
}
