import { TestBed } from '@angular/core/testing';
import type { Vehicle } from '../../data-access/models';
import { CarSelect } from './car-select';

const CARS: readonly Vehicle[] = [
  {
    id: 'v1',
    type: 'پراید',
    plate: { part1: '11', part2: '365', letter: 'س', iranCode: '45' },
  },
];

describe('CarSelect', () => {
  it('selects a car on click and confirms', () => {
    const fixture = TestBed.createComponent(CarSelect);
    fixture.componentRef.setInput('cars', CARS);
    fixture.componentRef.setInput('state', 'ready');
    fixture.detectChanges();
    let confirmed = false;
    fixture.componentInstance.confirmed.subscribe(() => (confirmed = true));
    const el = fixture.nativeElement as HTMLElement;
    const carButton = Array.from(el.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('پراید'),
    );
    carButton?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedCarId()).toBe('v1');
    const reserve = Array.from(el.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'رزرو',
    );
    reserve?.click();
    expect(confirmed).toBe(true);
  });

  it('shows the empty warning when there are no cars', () => {
    const fixture = TestBed.createComponent(CarSelect);
    fixture.componentRef.setInput('cars', []);
    fixture.componentRef.setInput('state', 'empty');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'خودرویی جهت نمایش موجود نیست',
    );
  });
});
