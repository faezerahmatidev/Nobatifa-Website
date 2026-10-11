import { firstValueFrom } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AUTH_GATEWAY } from '../../data-access/ports/auth-gateway';
import { provideMockDataAccess } from '../../data-access/mock/provide-mock-data-access';
import { MOCK_OTP_CODE } from '../../data-access/mock/mock-auth-gateway';
import { Session } from '../services/session';
import { Shell } from './shell';

describe('Shell login flow', () => {
  it('shows the user name in the header after a real login', async () => {
    TestBed.configureTestingModule({
      imports: [Shell],
      providers: [provideRouter([]), ...provideMockDataAccess()],
    });
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    await fixture.whenStable();
    const auth = TestBed.inject(AUTH_GATEWAY);
    const session = TestBed.inject(Session);
    await firstValueFrom(auth.requestOtp('09227521450'));
    await firstValueFrom(auth.verifyOtp('09227521450', MOCK_OTP_CODE));
    await session.refresh();
    fixture.detectChanges();
    const header = (fixture.nativeElement as HTMLElement).querySelector('app-header');
    expect(header?.textContent).toContain('فائزه رحمتی');
    expect(header?.textContent).not.toContain('ورود');
  }, 10000);
});
