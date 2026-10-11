import { Directive, ElementRef, inject } from '@angular/core';

/**
 * فرم‌های داخل مودال را با کلید Enter سابمیت می‌کند.
 *
 * مشکل: سابمیت ضمنی مرورگر فقط وقتی با Enter کار می‌کند که دکمه‌ی
 * `submit` داخل فرم باشد؛ فرم کد تایید دکمه‌اش بیرون فرم است.
 * این دایرکتیو یک‌بار نوشته شده و روی همه‌ی فرم‌ها (`form[appSubmitOnEnter]`)
 * Enter را به `requestSubmit` تبدیل می‌کند.
 */
@Directive({
  selector: 'form[appSubmitOnEnter]',
  host: {
    '(keydown.enter)': 'onEnter($event)',
  },
})
export class SubmitOnEnter {
  private readonly elementRef = inject(ElementRef);

  protected onEnter(event: Event): void {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }
    const tag = target.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') {
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    event.preventDefault();
    const form = this.elementRef.nativeElement as HTMLFormElement;
    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit();
    } else {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  }
}
