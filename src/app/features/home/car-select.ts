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
    <p class="text-sm font-bold text-gray-800">{{ summary() }}</p>
    <p class="mt-1 text-xs text-gray-500">
      از میان خودروهای زیر انتخاب کنید و سپس روی دکمه رزرو کلیک کنید.
    </p>
    <app-button variant="accent" size="sm" (click)="showForm.update((open) => !open)">
      + خودروی جدید
    </app-button>

    @if (showForm()) {
      <div class="flex flex-col gap-3 rounded-xl border border-gray-200 p-4">
        <app-text-field label="نوع خودرو" [control]="typeControl" placeholder="پراید" error="نوع خودرو الزامی است" />
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
        <div class="rounded-xl bg-warning-pale p-4 text-sm leading-6 text-warning-bold">
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
              <span class="text-sm">{{ car.type }} | {{ formatPlate(car.plate) }}</span>
              @if (selectedCarId() === car.id) {
                <app-icon name="check" [size]="18" />
              }
            </button>
          }
        </div>
      }
    }

    @if (reserveError()) {
      <p role="alert" class="text-xs text-danger-bold">{{ reserveError() }}</p>
    }
    <app-button
      [fullWidth]="true"
      [disabled]="!selectedCarId() || saving()"
      (click)="confirmed.emit()"
    >
      رزرو
    </app-button>
  `,
})
export class CarSelect {
  readonly summary = input('');
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

  protected readonly formatPlate = formatPlate;

  protected carClasses(id: string): string {
    const selected = this.selectedCarId() === id;
    return (
      'flex w-full items-center justify-between rounded-xl border px-4 py-3 ' +
      (selected ? 'border-primary-base bg-primary-pale text-primary-bold' : 'border-gray-200')
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
