import { firstValueFrom } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AUTH_GATEWAY } from '../../data-access/ports/auth-gateway';
import { provideMockDataAccess } from '../../data-access/mock/provide-mock-data-access';
import { MOCK_OTP_CODE } from '../../data-access/mock/mock-auth-gateway';
import { Session } from '../services/session';
import { Shell } from './shell';

describe('Shell edit profile', () => {
  it('edits the user name from the profile menu', async () => {
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
    const el = fixture.nativeElement as HTMLElement;
    const nameButton = Array.from(el.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('فائزه'),
    );
    nameButton?.click();
    fixture.detectChanges();
    const editButton = Array.from(el.querySelectorAll('button')).find(
      (button) =>
        (button as HTMLButtonElement).textContent?.trim() === 'ویرایش اطلاعات' &&
        button.closest('[role="menu"]') !== null,
    ) as HTMLButtonElement | undefined;
    editButton?.click();
    fixture.detectChanges();
    const dialog = el.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog?.textContent).toContain('ویرایش اطلاعات');
    const inputs = dialog.querySelectorAll('input');
    expect((inputs[0] as HTMLInputElement).value).toBe('فائزه');
    expect((inputs[1] as HTMLInputElement).value).toBe('رحمتی');
    (inputs[0] as HTMLInputElement).value = 'نگار';
    inputs[0].dispatchEvent(new Event('input'));
    (dialog.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await new Promise((resolve) => setTimeout(resolve, 700));
    fixture.detectChanges();
    expect(session.user()?.firstName).toBe('نگار');
    expect(el.querySelector('[role="dialog"]')).toBeNull();
  }, 10000);
});
