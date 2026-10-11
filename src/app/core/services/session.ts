import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { User } from '../../data-access/models';
import { AUTH_GATEWAY } from '../../data-access/ports/auth-gateway';

/** Frontend-only session. NOT a security boundary. */
@Injectable({ providedIn: 'root' })
export class Session {
  private readonly auth = inject(AUTH_GATEWAY);
  readonly user = signal<User | null>(null);

  async init(): Promise<void> {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    const session = await firstValueFrom(this.auth.currentSession());
    this.user.set(session?.user ?? null);
  }

  setUser(user: User): void {
    this.user.set({ ...user });
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.auth.logout());
    this.user.set(null);
  }

  fullName(): string {
    const user = this.user();
    return user ? `${user.firstName} ${user.lastName}`.trim() : '';
  }
}
