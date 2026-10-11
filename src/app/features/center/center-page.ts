import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthModal } from '../auth/auth-modal';
import { Button } from '../../shared/ui/button/button';
import { DateStrip } from '../../shared/ui/date-strip/date-strip';
import { EmptyState } from '../../shared/ui/states/empty-state';
import { ErrorState } from '../../shared/ui/states/error-state';
import { Icon } from '../../shared/ui/icon/icon';
import { LoadingState } from '../../shared/ui/states/loading-state';
import { Modal } from '../../shared/ui/modal/modal';
import { SlotCard } from '../../shared/ui/slot-card/slot-card';
import { BookingFacade } from '../home/booking-facade';
import { CarSelect } from '../home/car-select';

@Component({
  selector: 'app-center-page',
  imports: [
    AuthModal,
    Button,
    CarSelect,
    DateStrip,
    EmptyState,
    ErrorState,
    Icon,
    LoadingState,
    Modal,
    RouterLink,
    SlotCard,
  ],
  providers: [BookingFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8">
      @if (facade.center(); as center) {
        <h1 class="mb-4 text-lg font-black text-gray-900">{{ center.name }}</h1>
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
      } @else if (!facade.searching()) {
        <app-error-state
          [message]="facade.searchError() ?? 'اتوسرویس یافت نشد'"
          (retry)="reload()"
        />
        <div class="flex justify-center">
          <a
            routerLink="/"
            class="inline-flex h-10 items-center rounded-lg bg-primary-base px-5 text-sm font-bold text-white"
          >
            بازگشت به خانه
          </a>
        </div>
      } @else {
        <app-loading-state />
      }
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

    <app-modal [open]="facade.reservation() !== null" title="" size="lg" (closed)="facade.closeSuccess()">
      <div class="flex flex-col items-center gap-3 py-4 text-center">
        <span
          class="flex size-[72px] items-center justify-center rounded-full bg-success-bold text-white"
        >
          <app-icon name="check" [size]="36" />
        </span>
        <p class="font-black text-gray-900">فرآیند رزرو با موفقیت انجام شد.</p>
        <p class="text-sm text-gray-600">
          شما برای روز {{ facade.selectionSummary().day }}، ساعت
          {{ facade.selectionSummary().time }} نوبت خود را رزرو کردید.
        </p>
        <div class="mt-2 flex flex-wrap justify-center gap-2">
          <app-button (click)="facade.goToAppointments()">نمایش نوبت‌های من</app-button>
        </div>
      </div>
    </app-modal>
  `,
})
export class CenterPage implements OnInit {
  protected readonly facade = inject(BookingFacade);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code') ?? '';
    this.facade.code.setValue(code);
    void this.facade.search();
  }

  protected reload(): void {
    void this.facade.search();
  }
}
