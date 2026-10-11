import { ChangeDetectionStrategy, Component, input, model, output, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import type { PlateNumber, Vehicle } from '../../data-access/models';
import { Button } from '../../shared/ui/button/button';
import { Icon } from '../../shared/ui/icon/icon';
import { TextField } from '../../shared/ui/input/text-field';
import { PlateInput } from '../../shared/ui/plate/plate-input';
import { formatPlate } from '../../shared/ui/plate/plate-format';
import { ErrorState } from '../../shared/ui/states/error-state';
import { LoadingState } from '../../shared/ui/states/loading-state';
import type { CarsState } from './booking-facade';

export interface NewCarData {
  type: string;
  plate: PlateNumber;
}

@Component({
  selector: 'app-car-select',
  imports: [Button, Icon, TextField, PlateInput, ErrorState, LoadingState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-3">
      <p class="flex items-center justify-center gap-1 text-sm font-black text-gray-900">
        <span>{{ summary().day }}</span>
        <app-icon name="calendar" [size]="14" />
        <span class="text-gray-400">|</span>
        <span>ساعت {{ summary().time }}</span>
        <app-icon name="clock" [size]="14" />
      </p>
      <p class="text-center text-xs leading-5 text-gray-500">
        از میان خودروهای زیر انتخاب کنید و سپس روی دکمه رزرو کلیک کنید.
      </p>
      <app-button
        variant="accent"
        [fullWidth]="true"
        (click)="showForm.update((open) => !open)"
      >
        خودروی جدید
        <span
          class="flex size-5 items-center justify-center rounded-md border border-current"
        >
          <app-icon name="plus" [size]="12" />
        </span>
      </app-button>

      @if (showForm()) {
        <div class="flex flex-col gap-3 rounded-xl border border-gray-200 p-4">
          <app-text-field
            label="نوع خودرو"
            [control]="typeControl"
            placeholder="پراید"
            error="نوع خودرو الزامی است"
          />
          <app-plate-input [plate]="plate()" (plateChange)="plate.set($event)" />
          <app-button size="sm" [disabled]="saving()" (click)="submitNewCar()">تایید</app-button>
        </div>
      }

      @switch (state()) {
        @case ('loading') {
          <app-loading-state />
        }
        @case ('error') {
          <app-error-state [message]="error() ?? ''" (retry)="retried.emit()" />
        }
        @case ('empty') {
          <div class="rounded-xl bg-warning-pale p-4 text-center text-sm leading-6 text-warning-bold">
            خودرویی جهت نمایش موجود نیست! ابتدا یک خودروی جدید اضافه کنید.
          </div>
        }
        @case ('ready') {
          <div class="flex flex-col gap-2">
            @for (car of cars(); track car.id) {
              <button
                type="button"
                (click)="selectedCarId.set(car.id)"
                [attr.aria-pressed]="selectedCarId() === car.id"
                [class]="carClasses(car.id)"
              >
                @if (selectedCarId() === car.id) {
                  <span
                    class="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary-base text-white"
                  >
                    <app-icon name="check" [size]="14" />
                  </span>
                } @else {
                  <span class="shrink-0 text-gray-700">
                    <app-icon name="scan" [size]="20" />
                  </span>
                }
                <span class="text-sm">{{ car.type }} | {{ formatPlate(car.plate) }}</span>
              </button>
            }
          </div>
        }
      }

      @if (reserveError()) {
        <p role="alert" class="text-center text-xs text-danger-bold">{{ reserveError() }}</p>
      }
      <app-button
        [fullWidth]="true"
        [disabled]="!selectedCarId() || saving()"
        (click)="confirmed.emit()"
      >
        رزرو
      </app-button>
    </div>
  `,
})
export class CarSelect {
  readonly summary = input({ day: '', time: '' });
  readonly cars = input.required<readonly Vehicle[]>();
  readonly state = input<CarsState>('idle');
  readonly error = input<string | null>(null);
  readonly saving = input(false);
  readonly reserveError = input<string | null>(null);
  readonly selectedCarId = model('');
  readonly confirmed = output<void>();
  readonly retried = output<void>();
  readonly carCreated = output<NewCarData>();

  protected readonly showForm = signal(false);
  protected readonly formatPlate = formatPlate;
  protected readonly typeControl = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  });
  protected readonly plate = signal<PlateNumber>({
    part1: '',
    part2: '',
    letter: '',
    iranCode: '',
  });

  protected carClasses(id: string): string {
    const selected = this.selectedCarId() === id;
    return (
      'flex w-full items-center gap-3 rounded-xl border px-4 py-3 ' +
      (selected
        ? 'border-primary-base bg-primary-pale font-bold text-primary-bold'
        : 'border-gray-200 text-gray-800')
    );
  }

  protected submitNewCar(): void {
    const plate = this.plate();
    const complete = Boolean(plate.part1 && plate.part2 && plate.letter && plate.iranCode);
    if (this.typeControl.invalid || !complete) {
      this.typeControl.markAsTouched();
      return;
    }
    this.carCreated.emit({ type: this.typeControl.value.trim(), plate: { ...plate } });
    this.showForm.set(false);
  }
}
