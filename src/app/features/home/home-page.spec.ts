import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { provideMockDataAccess } from '../../data-access/mock/provide-mock-data-access';
import { HomePage } from './home-page';

describe('HomePage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([]), ...provideMockDataAccess()],
    }).compileComponents();
  });

  it('renders the hero and search', () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('نوبتیفا!');
    expect(el.querySelector('[aria-label="کد اتوسرویس"]')).toBeTruthy();
  });

  it('shows booking after a successful search', async () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('[aria-label="کد اتوسرویس"]') as HTMLInputElement;
    input.value = '1001';
    input.dispatchEvent(new Event('input'));
    (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 600));
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('اتوسرویس محمد');
  }, 10000);
});

describe('HomePage with login param', () => {
  it('opens the auth modal', async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        ...provideMockDataAccess(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({ auth: 'login' }) },
            queryParamMap: of(convertToParamMap({ auth: 'login' })),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="dialog"]'),
    ).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('ورود / ثبت‌نام');
  });
});
