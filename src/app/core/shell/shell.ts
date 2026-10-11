import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Session } from '../services/session';
import { AUTH_GATEWAY } from '../../data-access/ports/auth-gateway';
import { Button } from '../../shared/ui/button/button';
import { Modal } from '../../shared/ui/modal/modal';
import { ProfileForm, type ProfileData } from '../../features/auth/profile-form';
import { Footer } from './footer';
import { Header } from './header';

@Component({
  selector: 'app-shell',
  imports: [Button, Header, Footer, Modal, ProfileForm, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-dvh flex-col">
      <app-header
        [userName]="session.user() ? session.fullName() : null"
        (login)="login()"
        (logout)="confirmLogout.set(true)"
        (editProfile)="openEditProfile()"
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

    @if (editProfileOpen()) {
      <app-modal
        [open]="true"
        title="ویرایش اطلاعات"
        size="sm"
        (closed)="editProfileOpen.set(false)"
      >
        <app-profile-form
          [initial]="initialProfile()"
          [busy]="editBusy()"
          [serverError]="editError()"
          (submitted)="saveProfile($event)"
        />
      </app-modal>
    }
  `,
})
export class Shell {
  protected readonly session = inject(Session);
  protected readonly confirmLogout = signal(false);
  protected readonly editProfileOpen = signal(false);
  protected readonly editBusy = signal(false);
  protected readonly editError = signal<string | null>(null);
  protected readonly initialProfile = computed<ProfileData | null>(() => {
    const user = this.session.user();
    return user ? { firstName: user.firstName, lastName: user.lastName } : null;
  });

  private readonly router = inject(Router);
  private readonly auth = inject(AUTH_GATEWAY);

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

  protected openEditProfile(): void {
    this.editError.set(null);
    this.editProfileOpen.set(true);
  }

  protected async saveProfile(data: ProfileData): Promise<void> {
    this.editBusy.set(true);
    this.editError.set(null);
    try {
      await firstValueFrom(this.auth.completeProfile(data.firstName, data.lastName));
      await this.session.refresh();
      this.editProfileOpen.set(false);
    } catch (error) {
      this.editError.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    } finally {
      this.editBusy.set(false);
    }
  }
}
