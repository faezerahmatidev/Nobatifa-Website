import { TestBed } from '@angular/core/testing';
import { AboutPage } from './about-page';

describe('AboutPage', () => {
  it('renders the title and intro text', async () => {
    const fixture = TestBed.createComponent(AboutPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('تجربه‌ای نوین در مدیریت نوبت اتوسرویس‌ها');
    expect(el.textContent).toContain('صف‌های طولانی');
  });
});
