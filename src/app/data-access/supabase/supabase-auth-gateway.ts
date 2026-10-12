import { inject, Injectable } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { catchError, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { SUPABASE_CLIENT } from '../../core/backend/supabase-client';
import { environment } from '../../../environments/environment';
import type { AuthSession, User } from '../models';
import { AUTH_GATEWAY, type AuthGateway, type VerifyResult } from '../ports/auth-gateway';

interface ProfileRow {
  id: string;
  mobile: string | null;
  first_name: string | null;
  last_name: string | null;
}

/** Dev-only bypass code. NEVER accepted in production builds. */
export const DEV_BYPASS_CODE = '1111';

/** True in development builds (including `ng serve` and tests). */
export function isDevBypassEnabled(): boolean {
  return !environment.production;
}

/**
 * Iranian mobile to E.164. Supabase phone auth requires E.164 format;
 * the app collects `09…` numbers, so this mechanical mapping is required
 * by the API (not a business rule).
 */
export function toE164IranMobile(mobile: string): string {
  const value = mobile.trim();
  if (/^09\d{9}$/.test(value)) {
    return `+98${value.slice(1)}`;
  }
  if (/^\+98\d{10}$/.test(value)) {
    return value;
  }
  throw new Error('شماره موبایل معتبر نیست');
}

function toUser(row: ProfileRow): User {
  return {
    id: row.id,
    firstName: row.first_name ?? '',
    lastName: row.last_name ?? '',
    mobile: row.mobile ?? '',
  };
}

/**
 * Real `AuthGateway` over Supabase Auth (phone OTP).
 * UI and session flows stay untouched: same port, same `VerifyResult`
 * semantics (`isNewUser` = profile completion still needed).
 * Requires a configured project + SMS provider; until then the mock
 * implementation remains wired and this class is unused at runtime.
 */
@Injectable()
export class SupabaseAuthGateway implements AuthGateway {
  private readonly supabase: SupabaseClient = inject(SUPABASE_CLIENT);

  requestOtp(mobile: string): Observable<void> {
    let phone: string;
    try {
      phone = toE164IranMobile(mobile);
    } catch (error) {
      return throwError(() => error);
    }
    return from(this.supabase.auth.signInWithOtp({ phone })).pipe(
      map(({ error }) => {
        if (error) {
          throw new Error(error.message);
        }
      }),
      // Dev only: when no SMS provider is configured the request fails.
      // Swallow it so the 1111 bypass stays usable; production rethrows.
      catchError((error: unknown) => {
        if (isDevBypassEnabled()) {
          return of(undefined);
        }
        throw error instanceof Error ? error : new Error('خطایی رخ داد');
      }),
    );
  }

  verifyOtp(mobile: string, code: string): Observable<VerifyResult> {
    let phone: string;
    try {
      phone = toE164IranMobile(mobile);
    } catch (error) {
      return throwError(() => error);
    }
    // Dev only: the bypass code signs in anonymously (real Supabase
    // session, so RLS and the reserve RPC keep working). Requires
    // "Allow anonymous sign-ins" in the Supabase dashboard.
    // In production this branch does not exist: 1111 is just a wrong code.
    if (isDevBypassEnabled() && code.trim() === DEV_BYPASS_CODE) {
      return this.devBypassLogin();
    }
    return from(
      this.supabase.auth.verifyOtp({ phone, token: code.trim(), type: 'sms' }),
    ).pipe(
      switchMap(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        const id = data.user?.id;
        if (!id) {
          throw new Error('ورود ناموفق بود');
        }
        return this.readProfile(id);
      }),
      map((user) => ({ isNewUser: !user.firstName.trim() || !user.lastName.trim() })),
    );
  }

  completeProfile(firstName: string, lastName: string): Observable<User> {
    if (!firstName.trim() || !lastName.trim()) {
      return throwError(() => new Error('نام و نام خانوادگی الزامی است'));
    }
    return from(this.supabase.auth.getUser()).pipe(
      switchMap(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        const id = data.user?.id;
        if (!id) {
          throw new Error('ابتدا وارد شوید');
        }
        return from(
          this.supabase
            .from('profiles')
            .update({ first_name: firstName.trim(), last_name: lastName.trim() })
            .eq('id', id)
            .select('id, mobile, first_name, last_name')
            .single(),
        );
      }),
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        return toUser(data as unknown as ProfileRow);
      }),
    );
  }

  currentSession(): Observable<AuthSession | null> {
    return from(this.supabase.auth.getSession()).pipe(
      switchMap(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        const id = data.session?.user.id;
        if (!id) {
          return of(null);
        }
        return this.readProfile(id).pipe(map((user) => ({ user })));
      }),
    );
  }

  logout(): Observable<void> {
    return from(this.supabase.auth.signOut()).pipe(
      map(({ error }) => {
        if (error) {
          throw new Error(error.message);
        }
      }),
    );
  }

  /**
   * Dev-only login behind the 1111 code. Creates a real anonymous Supabase
   * session (requires "Allow anonymous sign-ins" on the project), so RLS,
   * ownership checks, and the reserve RPC keep working exactly like a real
   * login. Never reachable in production builds.
   */
  private devBypassLogin(): Observable<VerifyResult> {
    return from(this.supabase.auth.signInAnonymously()).pipe(
      switchMap(({ data, error }) => {
        if (error) {
          throw new Error(
            'ورود آزمایشی فعال نیست (در داشبورد Supabase گزینه Allow anonymous sign-ins را فعال کنید)',
          );
        }
        const id = data.user?.id;
        if (!id) {
          throw new Error('ورود ناموفق بود');
        }
        return this.readProfile(id);
      }),
      map((user) => ({ isNewUser: !user.firstName.trim() || !user.lastName.trim() })),
    );
  }

  private readProfile(id: string): Observable<User> {
    return from(
      this.supabase
        .from('profiles')
        .select('id, mobile, first_name, last_name')
        .eq('id', id)
        .maybeSingle(),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        if (!data) {
          throw new Error('پروفایل کاربری یافت نشد');
        }
        return toUser(data as unknown as ProfileRow);
      }),
    );
  }
}

export const SUPABASE_AUTH_PROVIDER = { provide: AUTH_GATEWAY, useClass: SupabaseAuthGateway };
