import { TestBed } from '@angular/core/testing';
import { Footer } from './footer';

describe('Footer', () => {
  it('renders the description and copyright bar', async () => {
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('بدون معطلی');
    expect(el.textContent).toContain('© 2025 Nobatifa. All rights reserved.');
  });
});
