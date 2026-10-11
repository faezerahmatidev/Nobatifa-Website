import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { AuthSession, User } from '../models';
import { AUTH_GATEWAY, type AuthGateway, type VerifyResult } from '../ports/auth-gateway';
import { fail, MockDatabase, respond } from './mock-database';

/** Fixed code used by the mock. Any other code is rejected. */
export const MOCK_OTP_CODE = '1234';

const MOBILE_PATTERN = /^09\d{9}$/;

@Injectable()
export class MockAuthGateway implements AuthGateway {
  constructor(private readonly db: MockDatabase) {}

  requestOtp(mobile: string): Observable<void> {
    if (!MOBILE_PATTERN.test(mobile.trim())) {
      return fail('شماره موبایل معتبر نیست');
    }
    this.db.pendingMobile = mobile.trim();
    this.db.lastOtp = MOCK_OTP_CODE;
    return respond(undefined);
  }

  verifyOtp(mobile: string, code: string): Observable<VerifyResult> {
    if (mobile.trim() !== this.db.pendingMobile || code.trim() !== this.db.lastOtp) {
      return fail('کد تایید نادرست است');
    }
    const isNewUser = !this.db.users.some((user) => user.mobile === mobile.trim());
    return respond({ isNewUser });
  }

  completeProfile(firstName: string, lastName: string): Observable<User> {
    const mobile = this.db.pendingMobile;
    if (!mobile) {
      return fail('ابتدا وارد شوید');
    }
    if (!firstName.trim() || !lastName.trim()) {
      return fail('نام و نام خانوادگی الزامی است');
    }
    let user = this.db.users.find((item) => item.mobile === mobile);
    if (!user) {
      user = { id: `u-mock-${Date.now()}`, firstName: '', lastName: '', mobile };
      this.db.users.push(user);
    }
    user.firstName = firstName.trim();
    user.lastName = lastName.trim();
    this.db.session = { user: { ...user } };
    return respond({ ...user });
  }

  currentSession(): Observable<AuthSession | null> {
    return respond(this.db.session ? { user: { ...this.db.session.user } } : null);
  }

  logout(): Observable<void> {
    this.db.session = null;
    this.db.pendingMobile = null;
    this.db.lastOtp = null;
    return respond(undefined);
  }
}

export const MOCK_AUTH_PROVIDER = { provide: AUTH_GATEWAY, useClass: MockAuthGateway };
