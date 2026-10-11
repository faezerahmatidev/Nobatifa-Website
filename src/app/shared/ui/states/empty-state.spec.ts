import { TestBed } from '@angular/core/testing';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('renders title and message', () => {
    const fixture = TestBed.createComponent(EmptyState);
    fixture.componentRef.setInput('title', 'خودرویی موجود نیست');
    fixture.componentRef.setInput('message', 'ابتدا یک خودرو اضافه کنید');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('خودرویی موجود نیست');
    expect(el.textContent).toContain('ابتدا یک خودرو اضافه کنید');
  });
});
