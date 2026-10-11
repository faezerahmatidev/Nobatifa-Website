import { Inject, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AUTH_GATEWAY, type AuthGateway } from '../../data-access/ports/auth-gateway';
import { BOOKING_GATEWAY, type BookingGateway } from '../../data-access/ports/booking-gateway';
import { CARS_GATEWAY, type CarsGateway } from '../../data-access/ports/cars-gateway';
import { Session } from '../../core/services/session';
import type {
  Appointment,
  BookingDay,
  PlateNumber,
  ServiceCenter,
  TimeSlot,
  Vehicle,
} from '../../data-access/models';

export type SlotsState = 'idle' | 'loading' | 'ready' | 'empty' | 'error';
export type CarsState = 'idle' | 'loading' | 'ready' | 'empty' | 'error';
export type AuthStep = 'login' | 'otp' | 'profile';

const MOBILE_PATTERN = /^09\d{9}$/;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'خطایی رخ داد';
}

/** Orchestrates search, slots, auth-gated reserve and car selection. */
@Injectable()
export class BookingFacade {
  readonly code = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  });
  readonly profileForm = new FormGroup({
    firstName: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    lastName: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });

  readonly center = signal<ServiceCenter | null>(null);
  readonly searching = signal(false);
  readonly searchError = signal<string | null>(null);

  readonly days = signal<BookingDay[]>([]);
  readonly selectedDayId = signal('');
  readonly slots = signal<TimeSlot[]>([]);
  readonly slotsState = signal<SlotsState>('idle');
  readonly slotsError = signal<string | null>(null);

  readonly authStep = signal<AuthStep | null>(null);
  readonly authBusy = signal(false);
  readonly authError = signal<string | null>(null);
  readonly mobile = signal('');

  readonly carModalOpen = signal(false);
  readonly cars = signal<Vehicle[]>([]);
  readonly carsState = signal<CarsState>('idle');
  readonly carsError = signal<string | null>(null);
  readonly selectedCarId = signal('');
  readonly carSaving = signal(false);
  readonly reserving = signal(false);
  readonly reserveError = signal<string | null>(null);
  readonly reservation = signal<Appointment | null>(null);

  private pendingSlot: TimeSlot | null = null;

  constructor(
    @Inject(BOOKING_GATEWAY) private readonly booking: BookingGateway,
    @Inject(AUTH_GATEWAY) private readonly auth: AuthGateway,
    @Inject(CARS_GATEWAY) private readonly carsGateway: CarsGateway,
    private readonly router: Router,
    private readonly session: Session,
  ) {}

  async search(): Promise<void> {
    if (this.code.invalid) {
      this.code.markAsTouched();
      return;
    }
    this.searching.set(true);
    this.searchError.set(null);
    try {
      const center = await firstValueFrom(this.booking.searchCenter(this.code.value.trim()));
      this.center.set(center);
      await this.loadDays(center.id);
    } catch (error) {
      this.center.set(null);
      this.days.set([]);
      this.slots.set([]);
      this.slotsState.set('idle');
      this.searchError.set(errorMessage(error));
    } finally {
      this.searching.set(false);
    }
  }

  async selectDay(id: string): Promise<void> {
    if (!this.center()) {
      return;
    }
    this.selectedDayId.set(id);
    await this.loadSlots();
  }

  async requestReserve(slot: TimeSlot): Promise<void> {
    this.pendingSlot = slot;
    this.reserveError.set(null);
    const session = await firstValueFrom(this.auth.currentSession());
    if (session) {
      await this.openCarModal();
      return;
    }
    this.authError.set(null);
    this.authStep.set('login');
  }

  async sendOtp(mobile: string): Promise<void> {
    const value = mobile.trim();
    if (!MOBILE_PATTERN.test(value)) {
      return;
    }
    this.authBusy.set(true);
    this.authError.set(null);
    try {
      await firstValueFrom(this.auth.requestOtp(value));
      this.mobile.set(value);
      this.authStep.set('otp');
    } catch (error) {
      this.authError.set(errorMessage(error));
    } finally {
      this.authBusy.set(false);
    }
  }

  async resendOtp(): Promise<void> {
    if (this.mobile()) {
      await this.sendOtp(this.mobile());
    }
  }

  async verifyOtp(code: string): Promise<void> {
    this.authBusy.set(true);
    this.authError.set(null);
    try {
      const result = await firstValueFrom(this.auth.verifyOtp(this.mobile(), code));
      if (result.isNewUser) {
        this.authStep.set('profile');
      } else {
        await this.afterAuth();
      }
    } catch (error) {
      this.authError.set(errorMessage(error));
    } finally {
      this.authBusy.set(false);
    }
  }

  async completeProfile(firstName: string, lastName: string): Promise<void> {
    this.authBusy.set(true);
    this.authError.set(null);
    try {
      await firstValueFrom(this.auth.completeProfile(firstName, lastName));
      await this.afterAuth();
    } catch (error) {
      this.authError.set(errorMessage(error));
    } finally {
      this.authBusy.set(false);
    }
  }

  closeAuth(): void {
    this.authStep.set(null);
    this.pendingSlot = null;
  }

  openLogin(): void {
    this.authError.set(null);
    this.authStep.set('login');
  }

  async openCarModal(): Promise<void> {
    this.carModalOpen.set(true);
    await this.loadCars();
  }

  closeCarModal(): void {
    this.carModalOpen.set(false);
  }

  async loadCars(): Promise<void> {
    this.carsState.set('loading');
    this.carsError.set(null);
    try {
      const cars = await firstValueFrom(this.carsGateway.list());
      this.cars.set(cars);
      this.carsState.set(cars.length ? 'ready' : 'empty');
      if (cars.length && !cars.some((car) => car.id === this.selectedCarId())) {
        this.selectedCarId.set(cars[0].id);
      }
    } catch (error) {
      this.carsState.set('error');
      this.carsError.set(errorMessage(error));
    }
  }

  async addCar(type: string, plate: PlateNumber): Promise<void> {
    this.carSaving.set(true);
    try {
      const car = await firstValueFrom(this.carsGateway.create(type, plate));
      this.cars.update((cars) => [...cars, car]);
      this.carsState.set('ready');
      this.selectedCarId.set(car.id);
    } catch (error) {
      this.carsError.set(errorMessage(error));
      this.carsState.set('error');
    } finally {
      this.carSaving.set(false);
    }
  }

  async confirmReserve(): Promise<void> {
    const center = this.center();
    const slot = this.pendingSlot;
    const carId = this.selectedCarId();
    if (!center || !slot || !carId || !this.selectedDayId()) {
      return;
    }
    this.reserving.set(true);
    this.reserveError.set(null);
    try {
      const appointment = await firstValueFrom(
        this.booking.reserve(center.id, this.selectedDayId(), slot.id, carId),
      );
      this.reservation.set(appointment);
      this.carModalOpen.set(false);
      await this.loadSlots();
    } catch (error) {
      this.reserveError.set(errorMessage(error));
    } finally {
      this.reserving.set(false);
    }
  }

  goToAppointments(): void {
    this.closeSuccess();
    void this.router.navigate(['/profile/appointments']);
  }

  closeSuccess(): void {
    this.reservation.set(null);
    this.pendingSlot = null;
  }

  authTitle(): string {
    switch (this.authStep()) {
      case 'otp':
        return 'کد تایید';
      case 'profile':
        return 'تکمیل اطلاعات ثبت‌نام';
      default:
        return 'ورود / ثبت‌نام';
    }
  }

  selectionSummary(): string {
    const day = this.days().find((item) => item.id === this.selectedDayId());
    if (!day || !this.pendingSlot) {
      return '';
    }
    return `${day.weekday} ${day.date} | ساعت ${this.pendingSlot.time}`;
  }

  private async afterAuth(): Promise<void> {
    this.authStep.set(null);
    await this.session.refresh();
    if (this.pendingSlot) {
      await this.openCarModal();
    }
  }

  private async loadDays(centerId: string): Promise<void> {
    const days = await firstValueFrom(this.booking.getDays(centerId));
    this.days.set(days);
    this.selectedDayId.set(days[0]?.id ?? '');
    await this.loadSlots();
  }

  private async loadSlots(): Promise<void> {
    const center = this.center();
    const dayId = this.selectedDayId();
    if (!center || !dayId) {
      return;
    }
    this.slotsState.set('loading');
    this.slotsError.set(null);
    try {
      const slots = await firstValueFrom(this.booking.getSlots(center.id, dayId));
      this.slots.set(slots);
      this.slotsState.set(slots.length ? 'ready' : 'empty');
    } catch (error) {
      this.slots.set([]);
      this.slotsState.set('error');
      this.slotsError.set(errorMessage(error));
    }
  }
}
