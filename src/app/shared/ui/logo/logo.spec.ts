import { TestBed } from '@angular/core/testing';
import { Logo } from './logo';

describe('Logo', () => {
  it('renders the brand name', () => {
    const fixture = TestBed.createComponent(Logo);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('نوبتیفا');
    expect((fixture.nativeElement as HTMLElement).querySelector('svg')).toBeTruthy();
  });
});
