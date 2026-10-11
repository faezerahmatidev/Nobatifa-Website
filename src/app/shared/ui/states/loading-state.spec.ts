import { TestBed } from '@angular/core/testing';
import { LoadingState } from './loading-state';

describe('LoadingState', () => {
  it('renders the loading message', () => {
    const fixture = TestBed.createComponent(LoadingState);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="status"]')).toBeTruthy();
    expect(el.textContent).toContain('در حال بارگذاری...');
  });
});
