import { TestBed } from '@angular/core/testing';
import { PlateInput } from './plate-input';

describe('PlateInput', () => {
  it('updates the plate parts on input', () => {
    const fixture = TestBed.createComponent(PlateInput);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const part1 = el.querySelector('input') as HTMLInputElement;
    part1.value = '11';
    part1.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.plate().part1).toBe('11');
  });

  it('keeps only digits in numeric parts', () => {
    const fixture = TestBed.createComponent(PlateInput);
    fixture.detectChanges();
    const part2 = (fixture.nativeElement as HTMLElement).querySelectorAll('input')[1];
    (part2 as HTMLInputElement).value = '3a6b5';
    part2.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.plate().part2).toBe('365');
  });
});
