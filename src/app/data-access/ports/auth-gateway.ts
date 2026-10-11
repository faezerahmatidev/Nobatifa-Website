import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { AuthSession, User } from '../models';

export interface VerifyResult {
  isNewUser: boolean;
}

export interface AuthGateway {
  requestOtp(mobile: string): Observable<void>;
  verifyOtp(mobile: string, code: string): Observable<VerifyResult>;
  completeProfile(firstName: string, lastName: string): Observable<User>;
  currentSession(): Observable<AuthSession | null>;
  logout(): Observable<void>;
}

export const AUTH_GATEWAY = new InjectionToken<AuthGateway>('AuthGateway');
