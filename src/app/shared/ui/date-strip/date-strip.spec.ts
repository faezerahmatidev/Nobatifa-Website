import { TestBed } from '@angular/core/testing';
import { DateStrip, type DateOption } from './date-strip';

const DAYS: readonly DateOption[] = [
  { id: 'd1', weekday: 'یکشنبه', date: '01/11' },
  { id: 'd2', weekday: 'دوشنبه', date: '01/12' },
];

describe('DateStrip', () => {
  it('selects a day on click', () => {
    const fixture = TestBed.createComponent(DateStrip);
    fixture.componentRef.setInput('days', DAYS);
    fixture.detectChanges();
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '[aria-pressed]',
    );
    (buttons[1] as HTMLButtonElement).click();
    expect(fixture.componentInstance.selectedId()).toBe('d2');
  });

  it('marks the selected day as pressed', () => {
    const fixture = TestBed.createComponent(DateStrip);
    fixture.componentRef.setInput('days', DAYS);
    fixture.componentRef.setInput('selectedId', 'd1');
    fixture.detectChanges();
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('[aria-pressed]');
    expect(buttons[0]?.getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1]?.getAttribute('aria-pressed')).toBe('false');
  });
});
