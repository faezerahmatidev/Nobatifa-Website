import { TestBed } from '@angular/core/testing';
import { ProfileForm } from './profile-form';

describe('ProfileForm', () => {
  it('submits trimmed names when valid', () => {
    const fixture = TestBed.createComponent(ProfileForm);
    fixture.detectChanges();
    let emitted: { firstName: string; lastName: string } | null = null;
    fixture.componentInstance.submitted.subscribe((data) => (emitted = data));
    const inputs = (fixture.nativeElement as HTMLElement).querySelectorAll('input');
    (inputs[0] as HTMLInputElement).value = 'علیرضا';
    inputs[0].dispatchEvent(new Event('input'));
    (inputs[1] as HTMLInputElement).value = 'رمضانی';
    inputs[1].dispatchEvent(new Event('input'));
    const form = (fixture.nativeElement as HTMLElement).querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    expect(emitted).toEqual({ firstName: 'علیرضا', lastName: 'رمضانی' });
  });

  it('does not submit empty names', () => {
    const fixture = TestBed.createComponent(ProfileForm);
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.submitted.subscribe(() => (emitted = true));
    ((fixture.nativeElement as HTMLElement).querySelector('form') as HTMLFormElement).dispatchEvent(
      new Event('submit'),
    );
    expect(emitted).toBe(false);
  });
});
