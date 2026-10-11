import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMockDataAccess } from '../../data-access/mock/provide-mock-data-access';
import { Session } from '../services/session';
import { Shell } from './shell';

describe('Shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shell],
      providers: [provideRouter([]), ...provideMockDataAccess()],
    }).compileComponents();
  });

  it('renders header, outlet and footer', async () => {
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-header')).toBeTruthy();
    expect(el.querySelector('router-outlet')).toBeTruthy();
    expect(el.querySelector('app-footer')).toBeTruthy();
  });

  it('confirms logout in a modal', async () => {
    TestBed.inject(Session).setUser({
      id: 'u1',
      firstName: 'فائزه',
      lastName: 'رحمتی',
      mobile: '09227521450',
    });
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(el.querySelectorAll('button')) as HTMLButtonElement[];
    const nameButton = buttons.find((button) => button.textContent?.includes('فائزه'));
    nameButton?.click();
    fixture.detectChanges();
    const logoutButton = Array.from(el.querySelectorAll('button')).find(
      (button) =>
        (button as HTMLButtonElement).textContent?.trim() === 'خروج' &&
        button.closest('[role="menu"]') !== null,
    ) as HTMLButtonElement | undefined;
    logoutButton?.click();
    fixture.detectChanges();
    expect(el.textContent).toContain('آیا مطمئن هستید که می‌خواهید خارج شوید؟');
    const dialog = el.querySelector('[role="dialog"]') as HTMLElement;
    const confirm = Array.from(dialog.querySelectorAll('button')).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'بله',
    ) as HTMLButtonElement | undefined;
    confirm?.click();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    expect(TestBed.inject(Session).user()).toBeNull();
  }, 10000);
});
