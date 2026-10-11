import { FormControl, Validators } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { TextField } from './text-field';

describe('TextField', () => {
  it('renders the label and placeholder', () => {
    const fixture = TestBed.createComponent(TextField);
    fixture.componentRef.setInput('label', 'شماره موبایل');
    fixture.componentRef.setInput('control', new FormControl<string | null>(''));
    fixture.componentRef.setInput('placeholder', '09123456789');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('شماره موبایل');
    expect(el.querySelector('input')?.getAttribute('placeholder')).toBe('09123456789');
  });

  it('shows the error only when invalid and touched', () => {
    const fixture = TestBed.createComponent(TextField);
    const control = new FormControl<string | null>('', Validators.required);
    fixture.componentRef.setInput('label', 'نام');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('error', 'این فیلد الزامی است');
    fixture.detectChanges();
    let el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="alert"]')).toBeNull();
    control.markAsTouched();
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="alert"]')?.textContent ?? '').toContain('این فیلد الزامی است');
    expect(el.querySelector('input')?.className).toContain('border-danger-base');
  });
});
