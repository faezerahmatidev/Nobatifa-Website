import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  Router,
} from '@angular/router';
import { of } from 'rxjs';
import { provideMockDataAccess } from '../../data-access/mock/provide-mock-data-access';
import { HomePage } from './home-page';

@Component({ template: '' })
class Dummy {}

function baseProviders(authParam: string | null): unknown[] {
  const routes = authParam === null ? [{ path: 'center/:code', component: Dummy }] : [];
  const providers: unknown[] = [provideRouter(routes), ...provideMockDataAccess()];
  if (authParam !== null) {
    providers.push({
      provide: ActivatedRoute,
      useValue: {
        snapshot: { queryParamMap: convertToParamMap({ auth: authParam }) },
        queryParamMap: of(convertToParamMap({ auth: authParam })),
      },
    });
  }
  return providers;
}

describe('HomePage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [...baseProviders(null)],
    }).compileComponents();
  });

  it('renders the hero and search', () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('نوبتیفا!');
    expect(el.querySelector('[aria-label="کد اتوسرویس"]')).toBeTruthy();
  });

  it('navigates to the center page on successful search', async () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('[aria-label="کد اتوسرویس"]') as HTMLInputElement;
    input.value = '1001';
    input.dispatchEvent(new Event('input'));
    (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(TestBed.inject(Router).url).toBe('/center/1001');
  }, 10000);

  it('shows an error for unknown codes without navigating', async () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('[aria-label="کد اتوسرویس"]') as HTMLInputElement;
    input.value = '0000';
    input.dispatchEvent(new Event('input'));
    (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 500));
    fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'کد اتوسرویس یافت نشد',
    );
  }, 10000);
});

describe('HomePage with login param', () => {
  it('opens the auth modal', async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [...baseProviders('login')],
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
