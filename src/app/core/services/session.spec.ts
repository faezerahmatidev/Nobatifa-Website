import { firstValueFrom } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { AUTH_GATEWAY } from '../../data-access/ports/auth-gateway';
import { provideMockDataAccess } from '../../data-access/mock/provide-mock-data-access';
import { Session } from './session';

describe('Session', () => {
  it('starts empty, refreshes after login and clears on logout', async () => {
    TestBed.configureTestingModule({ providers: [...provideMockDataAccess()] });
    const session = TestBed.inject(Session);
    await session.init();
    expect(session.user()).toBeNull();
    const auth = TestBed.inject(AUTH_GATEWAY);
    await firstValueFrom(auth.requestOtp('09120000000'));
    await firstValueFrom(auth.verifyOtp('09120000000', '1234'));
    await firstValueFrom(auth.completeProfile('تست', 'کاربر'));
    await session.refresh();
    expect(session.user()?.firstName).toBe('تست');
    expect(session.fullName()).toBe('تست کاربر');
    await session.logout();
    expect(session.user()).toBeNull();
  }, 10000);
});
