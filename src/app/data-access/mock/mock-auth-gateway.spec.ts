import { firstValueFrom } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { AUTH_GATEWAY, type AuthGateway } from '../ports/auth-gateway';
import { MOCK_OTP_CODE } from './mock-auth-gateway';
import { provideMockDataAccess } from './provide-mock-data-access';

function setup(): AuthGateway {
  TestBed.configureTestingModule({ providers: [...provideMockDataAccess()] });
  return TestBed.inject(AUTH_GATEWAY);
}

describe('MockAuthGateway', () => {
  it('rejects invalid mobile numbers', async () => {
    const gateway = setup();
    await expect(firstValueFrom(gateway.requestOtp('123'))).rejects.toThrow(
      'شماره موبایل معتبر نیست',
    );
  });

  it('rejects wrong otp codes', async () => {
    const gateway = setup();
    await firstValueFrom(gateway.requestOtp('09120000000'));
    await expect(firstValueFrom(gateway.verifyOtp('09120000000', '0000'))).rejects.toThrow(
      'کد تایید نادرست است',
    );
  });

  it('completes the login flow and stores the session', async () => {
    const gateway = setup();
    await firstValueFrom(gateway.requestOtp('09120000000'));
    const result = await firstValueFrom(gateway.verifyOtp('09120000000', MOCK_OTP_CODE));
    expect(result.isNewUser).toBe(true);
    const user = await firstValueFrom(gateway.completeProfile('تست', 'کاربر'));
    expect(user.firstName).toBe('تست');
    const session = await firstValueFrom(gateway.currentSession());
    expect(session?.user.mobile).toBe('09120000000');
    await firstValueFrom(gateway.logout());
    await expect(firstValueFrom(gateway.currentSession())).resolves.toBeNull();
  });
});
