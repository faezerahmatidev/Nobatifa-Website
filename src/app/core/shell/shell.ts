import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Session } from '../services/session';
import { Button } from '../../shared/ui/button/button';
import { Modal } from '../../shared/ui/modal/modal';
import { Footer } from './footer';
import { Header } from './header';

@Component({
  selector: 'app-shell',
  imports: [Button, Header, Footer, Modal, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-dvh flex-col">
      <app-header
        [userName]="session.user() ? session.fullName() : null"
        (login)="login()"
        (logout)="confirmLogout.set(true)"
      />
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-footer />
    </div>

    @if (confirmLogout()) {
      <app-modal [open]="true" title="خروج" size="sm" (closed)="confirmLogout.set(false)">
        <p class="text-sm leading-6 text-gray-700">آیا مطمئن هستید که می‌خواهید خارج شوید؟</p>
        <div class="mt-4 grid grid-cols-2 gap-2">
          <app-button variant="danger" [fullWidth]="true" (click)="logout()">
            بله
          </app-button>
          <app-button variant="text" [fullWidth]="true" (click)="confirmLogout.set(false)">
            انصراف
          </app-button>
        </div>
      </app-modal>
    }
  `,
})
export class Shell {
  protected readonly session = inject(Session);
  protected readonly confirmLogout = signal(false);
  private readonly router = inject(Router);

  constructor() {
    void this.session.init();
  }

  protected async login(): Promise<void> {
    await this.router.navigate(['/'], { queryParams: { auth: 'login' } });
  }

  protected async logout(): Promise<void> {
    this.confirmLogout.set(false);
    await this.session.logout();
    await this.router.navigate(['/']);
  }
}
