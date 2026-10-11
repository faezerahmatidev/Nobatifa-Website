import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Button } from '../../shared/ui/button/button';
import { TextField } from '../../shared/ui/input/text-field';
import { SubmitOnEnter } from '../../shared/ui/form/submit-on-enter';

export interface ProfileData {
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-profile-form',
  imports: [TextField, Button, SubmitOnEnter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form appSubmitOnEnter (submit)="$event.preventDefault(); submit()" class="flex flex-col gap-4">
      <app-text-field label="نام" [control]="firstName" error="نام الزامی است" />
      <app-text-field label="نام خانوادگی" [control]="lastName" error="نام خانوادگی الزامی است" />
      @if (serverError()) {
        <p role="alert" class="text-xs text-danger-bold">{{ serverError() }}</p>
      }
      <app-button type="submit" [fullWidth]="true" [disabled]="busy()">تایید</app-button>
    </form>
  `,
})
export class ProfileForm {
  readonly busy = input(false);
  readonly serverError = input<string | null>(null);
  readonly submitted = output<ProfileData>();

  protected readonly firstName = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  });
  protected readonly lastName = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  });

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
