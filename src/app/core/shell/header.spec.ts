import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Header } from './header';

function buttonByText(el: HTMLElement, text: string): HTMLButtonElement | null {
  const found = Array.from(el.querySelectorAll('button')).find((button) =>
    button.textContent?.includes(text),
  );
  return (found ?? null) as HTMLButtonElement | null;
}

describe('Header', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders nav links and a login button for guests', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('صفحه اصلی');
    expect(el.textContent).toContain('درباره ما');
    expect(buttonByText(el, 'ورود')).toBeTruthy();
  });

  it('emits login when the login button is clicked', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.login.subscribe(() => (emitted = true));
    buttonByText(fixture.nativeElement as HTMLElement, 'ورود')?.click();
    expect(emitted).toBe(true);
  });

  it('shows the user name and profile menu when logged in', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.componentRef.setInput('userName', 'فائزه رحمتی');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('فائزه رحمتی');
    expect(el.textContent).not.toContain('ورود');
    expect(el.querySelector('[role="menu"]')).toBeNull();
    buttonByText(el, 'فائزه رحمتی')?.click();
    fixture.detectChanges();
    const menu = el.querySelector('[role="menu"]');
    expect(menu?.textContent ?? '').toContain('نوبت‌های من');
    expect(menu?.textContent ?? '').toContain('خودروهای من');
    expect(menu?.textContent ?? '').toContain('ویرایش اطلاعات');
    expect(menu?.textContent ?? '').toContain('خروج');
  });

  it('emits logout when خروج is clicked', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.componentRef.setInput('userName', 'فائزه رحمتی');
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.logout.subscribe(() => (emitted = true));
    const el = fixture.nativeElement as HTMLElement;
    buttonByText(el, 'فائزه رحمتی')?.click();
    fixture.detectChanges();
    buttonByText(el, 'خروج')?.click();
    expect(emitted).toBe(true);
  });

  it('toggles the mobile menu', () => {    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[aria-label="منوی موبایل"]')).toBeNull();
    (el.querySelector('[aria-label="منو"]') as HTMLButtonElement | null)?.click();
    fixture.detectChanges();
    expect(el.querySelector('[aria-label="منوی موبایل"]')).toBeTruthy();
  });
});
