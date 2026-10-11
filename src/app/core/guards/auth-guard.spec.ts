import type { CanMatchFn, GuardResult, Route, UrlSegment } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMockDataAccess } from '../../data-access/mock/provide-mock-data-access';
import { Session } from '../services/session';
import { authGuard } from './auth-guard';

function runGuard(): Promise<GuardResult> {
  return TestBed.runInInjectionContext(() =>
    authGuard({} as Route, [] as UrlSegment[], {} as Parameters<CanMatchFn>[2]),
  ) as Promise<GuardResult>;
}

describe('authGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), ...provideMockDataAccess()],
    });
  });

  it('allows logged-in users', async () => {
    TestBed.inject(Session).setUser({
      id: 'u1',
      firstName: 'فائزه',
      lastName: 'رحمتی',
      mobile: '09227521450',
    });
    await expect(runGuard()).resolves.toBe(true);
  });

  it('redirects guests to login', async () => {
    const result = await runGuard();
    expect(result).not.toBe(true);
    expect(String(result)).toContain('auth=login');
  });
});
