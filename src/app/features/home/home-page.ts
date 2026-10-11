import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { AuthModal } from '../auth/auth-modal';
import { Icon } from '../../shared/ui/icon/icon';
import { SubmitOnEnter } from '../../shared/ui/form/submit-on-enter';
import { BookingFacade } from './booking-facade';

@Component({
  selector: 'app-home-page',
  imports: [ReactiveFormsModule, AuthModal, Icon, SubmitOnEnter],
  providers: [BookingFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-white">
      <div class="mx-auto max-w-7xl px-4 py-10 lg:py-14">
        <img
          src="/illustrations/hero-desktop.png"
          alt=""
          class="hidden h-auto w-full lg:block"
        />
        <h1 class="text-center text-4xl font-black text-primary-bold lg:sr-only">نوبتیفا!</h1>
        <p class="mt-2 text-center text-xl font-bold text-gray-900 lg:sr-only">
          زمان شما ارزشمند است
        </p>
        <img
          src="/illustrations/hero-car.png"
          alt=""
          class="mx-auto mt-6 h-auto w-full max-w-md lg:hidden"
        />
        <form
          appSubmitOnEnter
          (submit)="$event.preventDefault(); search()"
          class="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2"
        >
          <input
            [formControl]="facade.code"
            placeholder="کد اتوسرویس را وارد کنید"
            inputmode="numeric"
            aria-label="کد اتوسرویس"
            class="h-11 flex-1 bg-transparent px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
          <button
            type="submit"
            aria-label="جستجو"
            [disabled]="facade.searching()"
            class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-base text-white disabled:bg-gray-300"
          >
            <app-icon name="search" />
          </button>
        </form>
        @if (facade.code.touched && facade.code.invalid) {
          <p class="mt-2 text-center text-xs text-danger-bold">کد اتوسرویس الزامی است</p>
        }
        @if (facade.searchError()) {
          <p role="alert" class="mt-2 text-center text-xs text-danger-bold">
            {{ facade.searchError() }}
          </p>
        }
      </div>
    </section>

    <app-auth-modal
      [step]="facade.authStep()"
      [title]="facade.authTitle()"
      [busy]="facade.authBusy()"
      [error]="facade.authError()"
      [mobile]="facade.mobile()"
      (closed)="facade.closeAuth()"
      (loginSubmitted)="facade.sendOtp($event)"
      (otpSubmitted)="facade.verifyOtp($event)"
      (profileSubmitted)="facade.completeProfile($event.firstName, $event.lastName)"
      (editRequested)="facade.authStep.set('login')"
      (resendRequested)="facade.resendOtp()"
    />
  `,
})
export class HomePage implements OnInit {
  protected readonly facade = inject(BookingFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      if (params.get('auth') === 'login') {
        this.facade.openLogin();
        // روی سرور نویگیت نکن: در SSR تبدیل به ریدایرکت 302 می‌شود و
        // کوئری را قبل از هایدریشن می‌اندازد. پاک‌سازی URL فقط در مرورگر.
        if (isPlatformBrowser(this.platformId)) {
          void this.router.navigate([], {
            queryParams: { auth: null },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        }
      }
    });
  }

  protected async search(): Promise<void> {
    if (await this.facade.findCenter(this.facade.code.value)) {
      await this.router.navigate(['/center', this.facade.code.value.trim()]);
    }
  }
}
