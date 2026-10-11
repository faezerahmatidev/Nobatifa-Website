import { TestBed } from '@angular/core/testing';
import { OtpForm } from './otp-form';

function fillCode(el: HTMLElement, code: string): void {
  const boxes = el.querySelectorAll('app-otp-input input');
  code.split('').forEach((digit, index) => {
    const box = boxes[index] as HTMLInputElement;
    box.value = digit;
    box.dispatchEvent(new Event('input'));
  });
}

describe('OtpForm', () => {
  it('shows the mobile number and submits a complete code', () => {
    const fixture = TestBed.createComponent(OtpForm);
    fixture.componentRef.setInput('mobile', '09123456789');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('09123456789');
    let emitted: string | null = null;
    fixture.componentInstance.submitted.subscribe((code) => (emitted = code));
    fillCode(el, '1234');
    fixture.detectChanges();
    const buttons = Array.from(el.querySelectorAll('button'));
    buttons.find((button) => button.textContent?.trim() === 'تایید')?.click();
    expect(emitted).toBe('1234');
  });

  it('emits editRequested', () => {
    const fixture = TestBed.createComponent(OtpForm);
    fixture.componentRef.setInput('mobile', '09123456789');
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.editRequested.subscribe(() => (emitted = true));
    const el = fixture.nativeElement as HTMLElement;
    Array.from(el.querySelectorAll('button'))
      .find((button) => button.textContent?.includes('ویرایش'))
      ?.click();
    expect(emitted).toBe(true);
  });
});
