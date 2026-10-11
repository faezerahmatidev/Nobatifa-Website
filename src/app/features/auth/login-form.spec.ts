import { TestBed } from '@angular/core/testing';
import { LoginForm } from './login-form';

function setMobile(fixture: { nativeElement: unknown }, value: string): void {
  const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

describe('LoginForm', () => {
  it('does not submit invalid numbers', () => {
    const fixture = TestBed.createComponent(LoginForm);
    fixture.detectChanges();
    let emitted: string | null = null;
    fixture.componentInstance.submitted.subscribe((mobile) => (emitted = mobile));
    setMobile(fixture, '123');
    const form = (fixture.nativeElement as HTMLElement).querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(emitted).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('شماره موبایل معتبر نیست');
  });

  it('submits valid numbers', () => {
    const fixture = TestBed.createComponent(LoginForm);
    fixture.detectChanges();
    let emitted: string | null = null;
    fixture.componentInstance.submitted.subscribe((mobile) => (emitted = mobile));
    setMobile(fixture, '09123456789');
    const form = (fixture.nativeElement as HTMLElement).querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    expect(emitted).toBe('09123456789');
  });
});
