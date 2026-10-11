import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import type { PlateNumber } from '../../data-access/models';
import { Button } from '../../shared/ui/button/button';
import { TextField } from '../../shared/ui/input/text-field';
import { PlateInput } from '../../shared/ui/plate/plate-input';

export interface CarFormData {
  type: string;
  plate: PlateNumber;
}

const EMPTY_PLATE: PlateNumber = { part1: '', part2: '', letter: 'الف', iranCode: '' };

@Component({
  selector: 'app-car-form',
  imports: [TextField, PlateInput, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form (submit)="$event.preventDefault(); submit()" class="flex flex-col gap-4">
      <app-text-field
        label="نوع خودرو"
        [control]="typeControl"
        placeholder="پراید"
        error="نوع خودرو الزامی است"
      />
      <app-plate-input [plate]="plate()" (plateChange)="plate.set($event)" />
      @if (showPlateError()) {
        <p role="alert" class="text-xs text-danger-bold">پلاک خودرو کامل نیست</p>
      }
      @if (serverError()) {
        <p role="alert" class="text-xs text-danger-bold">{{ serverError() }}</p>
      }
      <app-button type="submit" [fullWidth]="true" [disabled]="saving()">تایید</app-button>
    </form>
  `,
})
export class CarForm implements OnInit {
  readonly initial = input<CarFormData | null>(null);
  readonly saving = input(false);
  readonly serverError = input<string | null>(null);
  readonly submitted = output<CarFormData>();

  protected readonly typeControl = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  });
  protected readonly plate = signal<PlateNumber>({ ...EMPTY_PLATE });
  protected readonly submitAttempted = signal(false);
  protected readonly showPlateError = computed(() => {
    if (!this.submitAttempted()) {
      return false;
    }
    const plate = this.plate();
    return !(plate.part1 && plate.part2 && plate.letter && plate.iranCode);
  });

  ngOnInit(): void {
    const initial = this.initial();
    if (initial) {
      this.typeControl.setValue(initial.type);
      this.plate.set({ ...initial.plate });
    }
  }

  protected submit(): void {
    const plate = this.plate();
    const complete = Boolean(plate.part1 && plate.part2 && plate.letter && plate.iranCode);
    if (this.typeControl.invalid || !complete) {
      this.typeControl.markAsTouched();
      this.submitAttempted.set(true);
      return;
    }
    this.submitted.emit({ type: this.typeControl.value.trim(), plate: { ...plate } });
  }
}
