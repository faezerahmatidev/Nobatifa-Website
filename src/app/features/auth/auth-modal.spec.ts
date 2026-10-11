import { TestBed } from '@angular/core/testing';
import { AuthModal } from './auth-modal';

describe('AuthModal', () => {
  it('renders nothing without a step', () => {
    const fixture = TestBed.createComponent(AuthModal);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="dialog"]'),
    ).toBeNull();
  });

  it('renders the login form for the login step', () => {
    const fixture = TestBed.createComponent(AuthModal);
    fixture.componentRef.setInput('step', 'login');
    fixture.componentRef.setInput('title', 'ورود / ثبت‌نام');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="dialog"]')).toBeTruthy();
    expect(el.textContent).toContain('ارسال کد تایید');
  });

  it('forwards the login submission', () => {
    const fixture = TestBed.createComponent(AuthModal);
    fixture.componentRef.setInput('step', 'login');
    fixture.detectChanges();
    let emitted: string | null = null;
    fixture.componentInstance.loginSubmitted.subscribe((mobile) => (emitted = mobile));
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input') as HTMLInputElement;
    input.value = '09123456789';
    input.dispatchEvent(new Event('input'));
    (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    expect(emitted).toBe('09123456789');
  });
});
