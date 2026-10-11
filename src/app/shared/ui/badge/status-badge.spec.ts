import { TestBed } from '@angular/core/testing';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it.each([
    ['pending', 'در انتظار'],
    ['done', 'انجام‌شده'],
    ['cancelled', 'لغو شده'],
  ] as const)('renders the %s label', (status, label) => {
    const fixture = TestBed.createComponent(StatusBadge);
    fixture.componentRef.setInput('status', status);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(label);
  });
});
