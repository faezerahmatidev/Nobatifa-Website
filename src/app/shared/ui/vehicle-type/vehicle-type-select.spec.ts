import { FormControl, Validators } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { VehicleTypeSelect } from './vehicle-type-select';

function setup(): FormControl<string> {
  return new FormControl('', { validators: [Validators.required], nonNullable: true });
}

describe('VehicleTypeSelect', () => {
  it('selects an option from the list', () => {
    const fixture = TestBed.createComponent(VehicleTypeSelect);
    const control = setup();
    fixture.componentRef.setInput('label', 'نوع خودرو');
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const toggle = Array.from(el.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('انتخاب کنید'),
    ) as HTMLButtonElement | undefined;
    toggle?.click();
    fixture.detectChanges();
    const option = Array.from(el.querySelectorAll('[role="option"] button')).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'پراید',
    ) as HTMLButtonElement | undefined;
    option?.click();
    expect(control.value).toBe('پراید');
  });

  it('filters options by search', () => {
    const fixture = TestBed.createComponent(VehicleTypeSelect);
    fixture.componentRef.setInput('label', 'نوع خودرو');
    fixture.componentRef.setInput('control', setup());
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const toggle = el.querySelector('button') as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    const search = el.querySelector('[aria-label="جستجوی نوع خودرو"]') as HTMLInputElement;
    search.value = 'پژو';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const options = Array.from(el.querySelectorAll('[role="option"]'));
    expect(options.length).toBeGreaterThan(0);
    expect(
      options.every((node) => node.textContent?.includes('پژو')),
    ).toBe(true);
  });

  it('shows an error when touched and empty', () => {
    const fixture = TestBed.createComponent(VehicleTypeSelect);
    const control = setup();
    fixture.componentRef.setInput('label', 'نوع خودرو');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('error', 'نوع خودرو الزامی است');
    control.markAsTouched();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'نوع خودرو الزامی است',
    );
  });
});
