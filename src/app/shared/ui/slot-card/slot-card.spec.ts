import { TestBed } from '@angular/core/testing';
import { SlotCard } from './slot-card';

describe('SlotCard', () => {
  it('emits reserve for available slots', () => {
    const fixture = TestBed.createComponent(SlotCard);
    fixture.componentRef.setInput('time', '13:20');
    fixture.componentRef.setInput('status', 'available');
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.reserve.subscribe(() => (emitted = true));
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    ) as HTMLButtonElement;
    expect(button.querySelector('img')).toBeTruthy();
    button.click();
    expect(emitted).toBe(true);
  });

  it('shows تعطیل for closed slots', () => {
    const fixture = TestBed.createComponent(SlotCard);
    fixture.componentRef.setInput('time', '09:10');
    fixture.componentRef.setInput('status', 'closed');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('تعطیل');
  });

  it('shows رزرو شده for reserved slots', () => {
    const fixture = TestBed.createComponent(SlotCard);
    fixture.componentRef.setInput('time', '10:00');
    fixture.componentRef.setInput('status', 'reserved');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('رزرو شده');
  });
});
