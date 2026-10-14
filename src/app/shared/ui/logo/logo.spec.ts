import { TestBed } from '@angular/core/testing';
import { Logo } from './logo';

describe('Logo', () => {
  it('renders the brand image', () => {
    const fixture = TestBed.createComponent(Logo);
    fixture.detectChanges();
    const img = (fixture.nativeElement as HTMLElement).querySelector('img');
    expect(img?.getAttribute('src')).toBe('logo.svg');
    expect(img?.getAttribute('alt')).toBe('نوبتیفا');
  });
});
