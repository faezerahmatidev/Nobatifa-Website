import { TestBed } from '@angular/core/testing';
import { CarForm, type CarFormData } from './car-form';

describe('CarForm', () => {
  it('does not submit an empty form', () => {
    const fixture = TestBed.createComponent(CarForm);
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.submitted.subscribe(() => (emitted = true));
    const form = (fixture.nativeElement as HTMLElement).querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    expect(emitted).toBe(false);
  });

  it('submits a complete car', () => {
    const fixture = TestBed.createComponent(CarForm);
    fixture.detectChanges();
    let emitted: CarFormData | null = null;
    fixture.componentInstance.submitted.subscribe((data) => (emitted = data));
    const el = fixture.nativeElement as HTMLElement;
    const typeInput = el.querySelector('input') as HTMLInputElement;
    typeInput.value = 'پراید';
    typeInput.dispatchEvent(new Event('input'));
    const inputs = el.querySelectorAll('[aria-label]');
    const setPart = (label: string, value: string): void => {
      const field = Array.from(inputs).find((node) =>
        node.getAttribute('aria-label')?.includes(label),
      ) as HTMLInputElement;
      field.value = value;
      field.dispatchEvent(new Event('input'));
    };
    setPart('دو رقم اول', '11');
    setPart('سه رقم', '365');
    setPart('کد ایران', '45');
    const letter = Array.from(el.querySelectorAll('select'))[0] as HTMLSelectElement;
    letter.value = 'س';
    letter.dispatchEvent(new Event('change'));
    (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    expect(emitted).toEqual({
      type: 'پراید',
      plate: { part1: '11', part2: '365', letter: 'س', iranCode: '45' },
    });
  });

  it('prefills initial values in edit mode', () => {
    const fixture = TestBed.createComponent(CarForm);
    fixture.componentRef.setInput('initial', {
      type: 'کوییک',
      plate: { part1: '55', part2: '123', letter: 'ج', iranCode: '12' },
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect((el.querySelector('input') as HTMLInputElement).value).toBe('کوییک');
  });
});
