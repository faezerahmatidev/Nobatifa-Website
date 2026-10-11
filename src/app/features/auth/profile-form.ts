import { ChangeDetectionStrategy, Component, input, OnInit, output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '../../shared/ui/button/button';
import { SubmitOnEnter } from '../../shared/ui/form/submit-on-enter';

export interface ProfileData {
  firstName: string;
  lastName: string;
}

const INPUT_CLASSES =
  'h-12 w-full rounded-xl border bg-white px-4 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-primary-base ';

@Component({
  selector: 'app-profile-form',
  imports: [ReactiveFormsModule, Button, SubmitOnEnter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form appSubmitOnEnter (submit)="$event.preventDefault(); submit()" class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <input
          [formControl]="firstName"
          type="text"
          placeholder="نام"
          aria-label="نام"
          [class]="INPUT_CLASSES + (nameError(firstName) ? 'border-danger-base' : 'border-gray-300')"
        />
        @if (nameError(firstName)) {
          <p class="text-xs text-danger-bold" role="alert">نام الزامی است</p>
        }
      </div>
      <div class="flex flex-col gap-1">
        <input
          [formControl]="lastName"
          type="text"
          placeholder="نام خانوادگی"
          aria-label="نام خانوادگی"
          [class]="INPUT_CLASSES + (nameError(lastName) ? 'border-danger-base' : 'border-gray-300')"
        />
        @if (nameError(lastName)) {
          <p class="text-xs text-danger-bold" role="alert">نام خانوادگی الزامی است</p>
        }
      </div>
      @if (serverError()) {
        <p role="alert" class="text-xs text-danger-bold">{{ serverError() }}</p>
      }
      <div class="mt-4">
        <app-button type="submit" size="lg" [fullWidth]="true" [disabled]="busy()">
          تایید
        </app-button>
      </div>
    </form>
  `,
})
export class ProfileForm implements OnInit {
  readonly initial = input<ProfileData | null>(null);
  readonly busy = input(false);
  readonly serverError = input<string | null>(null);
  readonly submitted = output<ProfileData>();

  protected readonly INPUT_CLASSES = INPUT_CLASSES;
  protected readonly firstName = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  });
  protected readonly lastName = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  });

  ngOnInit(): void {
    const initial = this.initial();
    if (initial) {
      this.firstName.setValue(initial.firstName);
      this.lastName.setValue(initial.lastName);
    }
  }

  protected nameError(control: FormControl<string>): boolean {
    return control.invalid && control.touched;
  }

  protected submit(): void {
    if (this.firstName.invalid || this.lastName.invalid) {
      this.firstName.markAsTouched();
      this.lastName.markAsTouched();
      return;
    }
    this.submitted.emit({
      firstName: this.firstName.value.trim(),
      lastName: this.lastName.value.trim(),
    });
  }
}
