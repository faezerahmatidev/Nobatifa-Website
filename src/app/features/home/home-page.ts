import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginForm } from '../auth/login-form';
import { OtpForm } from '../auth/otp-form';
import { ProfileForm } from '../auth/profile-form';
import { Button } from '../../shared/ui/button/button';
import { DateStrip } from '../../shared/ui/date-strip/date-strip';
import { EmptyState } from '../../shared/ui/states/empty-state';
import { ErrorState } from '../../shared/ui/states/error-state';
import { Icon } from '../../shared/ui/icon/icon';
import { LoadingState } from '../../shared/ui/states/loading-state';
import { Modal } from '../../shared/ui/modal/modal';
import { SlotCard } from '../../shared/ui/slot-card/slot-card';
import { BookingFacade } from './booking-facade';
import { CarSelect } from './car-select';

@Component({
  selector: 'app-home-page',
  imports: [
    ReactiveFormsModule,
    Button,
    CarSelect,
    DateStrip,
    EmptyState,
    ErrorState,
    Icon,
    LoadingState,
    LoginForm,
    Modal,
    OtpForm,
    ProfileForm,
    SlotCard,
  ],
  providers: [BookingFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-white">
      <div class="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div class="flex flex-col items-center gap-8 md:flex-row">
          <div class="flex-1 text-center md:text-right">
            <h1 class="text-4xl font-black text-primary-bold md:text-5xl">نوبتیفا!</h1>
            <p class="mt-2 text-xl font-bold text-gray-900">زمان شما ارزشمند است</p>
            <form
              (submit)="$event.preventDefault(); facade.search()"
              class="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2 md:mx-0"
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
              <p class="mt-2 text-xs text-danger-bold">کد اتوسرویس الزامی است</p>
            }
            @if (facade.searchError()) {
              <p role="alert" class="mt-2 text-xs text-danger-bold">{{ facade.searchError() }}</p>
            }
          </div>
          <div
            class="hidden w-full max-w-md flex-1 items-center justify-center rounded-3xl bg-primary-pale py-16 text-primary-bold md:flex"
            role="img"
            aria-label="تصویر معرفی نوبتیفا"
          >
            <app-icon name="map-pin" [size]="96" />
          </div>
        </div>
      </div>
    </section>

    @if (facade.center()) {
      <section class="mx-auto max-w-7xl px-4 py-8">
        <h2 class="mb-4 text-lg font-black text-gray-900">{{ facade.center()?.name }}</h2>
        <app-date-strip
          [days]="facade.days()"
          [selectedId]="facade.selectedDayId()"
          (selectedIdChange)="facade.selectDay($event)"
        />
        @switch (facade.slotsState()) {
          @case ('loading') {
            <app-loading-state />
          }
          @case ('empty') {
            <app-empty-state
              title="ساعتی برای نمایش وجود ندارد"
              message="در این روز نوبت خالی ثبت نشده است. روز دیگری را انتخاب کنید."
            />
          }
          @case ('error') {
            <app-error-state
              [message]="facade.slotsError() ?? ''"
              (retry)="facade.selectDay(facade.selectedDayId())"
            />
          }
          @case ('ready') {
            <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              @for (slot of facade.slots(); track slot.id) {
                <app-slot-card
                  [time]="slot.time"
                  [status]="slot.status"
                  (reserve)="facade.requestReserve(slot)"
                />
              }
            </div>
          }
        }
      </section>
    }

    <app-modal
      [open]="facade.authStep() !== null"
      [title]="facade.authTitle()"
      (closed)="facade.closeAuth()"
    >
      @switch (facade.authStep()) {
        @case ('login') {
          <app-login-form
            [busy]="facade.authBusy()"
            [serverError]="facade.authError()"
            (submitted)="facade.sendOtp($event)"
          />
        }
        @case ('otp') {
          <app-otp-form
            [mobile]="facade.mobile()"
            [busy]="facade.authBusy()"
            [serverError]="facade.authError()"
            (submitted)="facade.verifyOtp($event)"
            (editRequested)="facade.authStep.set('login')"
            (resendRequested)="facade.resendOtp()"
          />
        }
        @case ('profile') {
          <app-profile-form
            [busy]="facade.authBusy()"
            [serverError]="facade.authError()"
            (submitted)="facade.completeProfile($event.firstName, $event.lastName)"
          />
        }
      }
    </app-modal>

    <app-modal
      [open]="facade.carModalOpen()"
      title="انتخاب خودرو"
      size="lg"
      (closed)="facade.closeCarModal()"
    >
      <app-car-select
        [summary]="facade.selectionSummary()"
        [cars]="facade.cars()"
        [state]="facade.carsState()"
        [error]="facade.carsError()"
        [saving]="facade.carSaving() || facade.reserving()"
        [reserveError]="facade.reserveError()"
        [selectedCarId]="facade.selectedCarId()"
        (selectedCarIdChange)="facade.selectedCarId.set($event)"
        (confirmed)="facade.confirmReserve()"
        (retried)="facade.loadCars()"
        (carCreated)="facade.addCar($event.type, $event.plate)"
      />
    </app-modal>

    <app-modal [open]="facade.reservation() !== null" title="" (closed)="facade.closeSuccess()">
      <div class="flex flex-col items-center gap-3 py-4 text-center">
        <span
          class="flex size-16 items-center justify-center rounded-full bg-success-pale text-success-deep"
        >
          <app-icon name="check" [size]="32" />
        </span>
        <p class="font-black text-gray-900">فرآیند رزرو با موفقیت انجام شد.</p>
        <p class="text-sm text-gray-600">
          شما برای روز {{ facade.selectionSummary() }} نوبت خود را رزرو کردید.
        </p>
        <div class="mt-2 flex flex-wrap justify-center gap-2">
          <app-button (click)="facade.goToAppointments()">نمایش نوبت‌های من</app-button>
          <app-button variant="text" (click)="facade.closeSuccess()">بستن</app-button>
        </div>
      </div>
    </app-modal>
  `,
})
export class HomePage implements OnInit {
  protected readonly facade = inject(BookingFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      if (params.get('auth') === 'login') {
        this.facade.openLogin();
        void this.router.navigate([], {
          queryParams: { auth: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });
  }
}
