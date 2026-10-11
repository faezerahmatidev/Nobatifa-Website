import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
} from '@angular/core';

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

function normalizeDigits(raw: string): string {
  return raw
    .replace(/[۰-۹]/g, (digit) => String(FA_DIGITS.indexOf(digit)))
    .replace(/\D/g, '');
}

@Component({
  selector: 'app-otp-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex justify-center gap-4" dir="ltr">
      @for (digit of digits(); track $index) {
        <input
          [value]="digit"
          (input)="onInput($index, $event)"
          (keydown)="onKeydown($index, $event)"
          (paste)="onPaste($event)"
          maxlength="1"
          inputmode="numeric"
          autocomplete="one-time-code"
          [attr.autofocus]="$index === 0 ? '' : null"
          [attr.aria-label]="'رقم ' + ($index + 1)"
          class="size-14 rounded-xl border border-gray-300 bg-white text-center text-xl font-bold text-gray-900 outline-none focus:border-primary-base"
        />
      }
    </div>
  `,
})
export class OtpInput {
  readonly length = input(4);
  readonly code = model('');

  private readonly elementRef = inject(ElementRef);

  constructor() {
    afterNextRender(() => {
      if (document.activeElement !== document.body) {
        return;
      }
      this.elementRef.nativeElement.querySelector('input')?.focus();
    });
  }

  protected readonly digits = computed(() => {
    const chars = normalizeDigits(this.code()).slice(0, this.length()).split('');
    return Array.from({ length: this.length() }, (_, index) => chars[index] ?? '');
  });

  protected onInput(index: number, event: Event): void {
    const box = event.target as HTMLInputElement;
    const digit = normalizeDigits(box.value).slice(-1);
    const next = this.digits();
    next[index] = digit;
    this.code.set(next.join(''));
    if (digit && index < this.length() - 1) {
      (box.nextElementSibling as HTMLInputElement | null)?.focus();
    }
  }

  protected onKeydown(index: number, event: KeyboardEvent): void {
    if (event.key !== 'Backspace') {
      return;
    }
    const box = event.target as HTMLInputElement;
    if (box.value || index === 0) {
      return;
    }
    (box.previousElementSibling as HTMLInputElement | null)?.focus();
    const next = this.digits();
    next[index - 1] = '';
    this.code.set(next.join(''));
  }

  protected onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = normalizeDigits(event.clipboardData?.getData('text') ?? '').slice(
      0,
      this.length(),
    );
    this.code.set(pasted);
  }
}
