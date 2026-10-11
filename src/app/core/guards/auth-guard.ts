import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AUTH_GATEWAY } from '../../data-access/ports/auth-gateway';
import { Session } from '../services/session';

export const authGuard: CanMatchFn = async () => {
  const session = inject(Session);
  const router = inject(Router);
  const auth = inject(AUTH_GATEWAY);
  if (session.user()) {
    return true;
  }
  const current = await firstValueFrom(auth.currentSession());
  if (current) {
    session.setUser(current.user);
    return true;
  }
  return router.createUrlTree(['/'], { queryParams: { auth: 'login' } });
};
