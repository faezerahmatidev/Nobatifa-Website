import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../shared/ui/icon/icon';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="border-b border-gray-200 bg-white">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-lg p-2 text-gray-700 md:hidden"
            (click)="menuOpen.update((open) => !open)"
            [attr.aria-expanded]="menuOpen()"
            aria-label="منو"
          >
            <app-icon [name]="menuOpen() ? 'x' : 'menu'" />
          </button>
          <a routerLink="/" class="flex items-center gap-2" aria-label="نوبتیفا">
            <span
              class="flex size-9 items-center justify-center rounded-full bg-primary-bold text-white"
            >
              <app-icon name="clock" />
            </span>
            <span class="text-lg font-black text-accent-bold">نوبتیفا</span>
          </a>
        </div>

        <nav class="hidden items-center gap-6 md:flex" aria-label="ناوبری اصلی">
          <a
            routerLink="/"
            routerLinkActive="font-bold text-primary-bold"
            [routerLinkActiveOptions]="{ exact: true }"
            class="text-sm text-gray-700"
          >
            صفحه اصلی
          </a>
          <a
            routerLink="/about"
            routerLinkActive="font-bold text-primary-bold"
            class="text-sm text-gray-700"
          >
            درباره ما
          </a>
        </nav>

        <div class="relative">
          @if (userName()) {
            <button
              type="button"
              class="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-gray-800"
              (click)="profileOpen.update((open) => !open)"
              [attr.aria-expanded]="profileOpen()"
              aria-haspopup="menu"
            >
              {{ userName() }}
              <app-icon name="chevron-down" [size]="16" />
            </button>
            @if (profileOpen()) {
              <div
                role="menu"
                class="absolute left-0 top-full z-10 mt-2 w-44 rounded-xl border border-gray-200 bg-white py-2 shadow-lg"
              >
                <a
                  role="menuitem"
                  routerLink="/profile/appointments"
                  routerLinkActive="font-bold text-primary-bold"
                  (click)="profileOpen.set(false)"
                  class="block px-4 py-2 text-sm text-gray-700"
                >
                  نوبت‌های من
                </a>
                <a
                  role="menuitem"
                  routerLink="/profile/cars"
                  routerLinkActive="font-bold text-primary-bold"
                  (click)="profileOpen.set(false)"
                  class="block px-4 py-2 text-sm text-gray-700"
                >
                  خودروهای من
                </a>
                <button
                  role="menuitem"
                  type="button"
                  (click)="logout.emit()"
                  class="block w-full px-4 py-2 text-right text-sm font-bold text-danger-bold"
                >
                  خروج
                </button>
              </div>
            }
          } @else {
            <button
              type="button"
              (click)="login.emit()"
              class="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-primary-bold"
            >
              <app-icon name="log-in" [size]="18" />
              ورود
            </button>
          }
        </div>
      </div>

      @if (menuOpen()) {
        <nav class="border-t border-gray-200 px-4 py-2 md:hidden" aria-label="منوی موبایل">
          <a
            routerLink="/"
            routerLinkActive="font-bold text-primary-bold"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="menuOpen.set(false)"
            class="block py-2 text-sm text-gray-700"
          >
            صفحه اصلی
          </a>
          <a
            routerLink="/about"
            routerLinkActive="font-bold text-primary-bold"
            (click)="menuOpen.set(false)"
            class="block py-2 text-sm text-gray-700"
          >
            درباره ما
          </a>
        </nav>
      }
    </header>
  `,
})
export class Header {
  readonly userName = input<string | null>(null);
  readonly login = output<void>();
  readonly logout = output<void>();

  protected readonly menuOpen = signal(false);
  protected readonly profileOpen = signal(false);
}
