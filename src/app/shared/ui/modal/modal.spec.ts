import { TestBed } from '@angular/core/testing';
import { Modal } from './modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const fixture = TestBed.createComponent(Modal);
    fixture.componentRef.setInput('open', false);
    fixture.componentRef.setInput('title', 'ورود');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="dialog"]')).toBeNull();
  });

  it('renders the dialog with title when open', () => {
    const fixture = TestBed.createComponent(Modal);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'ورود');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="dialog"]')).toBeTruthy();
    expect(el.textContent).toContain('ورود');
  });

  it('emits closed on backdrop click', () => {
    const fixture = TestBed.createComponent(Modal);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'ورود');
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.closed.subscribe(() => (emitted = true));
    const backdrop = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="backdrop"]',
    ) as HTMLElement | null;
    backdrop?.click();
    expect(emitted).toBe(true);
  });
});
