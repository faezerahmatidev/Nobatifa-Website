import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Session } from '../services/session';
import { Footer } from './footer';
import { Header } from './header';

@Component({
  selector: 'app-shell',
  imports: [Header, Footer, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-dvh flex-col">
      <app-header
        [userName]="session.user() ? session.fullName() : null"
        (login)="login()"
        (logout)="logout()"
      />
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
})
export class Shell {
  protected readonly session = inject(Session);
  private readonly router = inject(Router);

  constructor() {
    void this.session.init();
  }

  protected async login(): Promise<void> {
    await this.router.navigate(['/'], { queryParams: { auth: 'login' } });
  }

  protected async logout(): Promise<void> {
    await this.session.logout();
    await this.router.navigate(['/']);
  }
}
