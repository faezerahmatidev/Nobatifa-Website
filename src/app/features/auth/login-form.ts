import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Button } from '../../shared/ui/button/button';
import { TextField } from '../../shared/ui/input/text-field';

@Component({
  selector: 'app-login-form',
  imports: [TextField, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="mb-4 text-sm leading-6 text-gray-600">
      شماره موبایل خود را وارد کنید سپس کد تایید پیامک شده را وارد کنید.
    </p>
    <form (submit)="$event.preventDefault(); submit()" class="flex flex-col gap-4">
      <app-text-field
        label="شماره موبایل"
        [control]="mobile"
        placeholder="09123456789"
        type="tel"
        inputmode="tel"
        [error]="mobileError()"
      />
      @if (serverError()) {
        <p role="alert" class="text-xs text-danger-bold">{{ serverError() }}</p>
      }
      <app-button type="submit" [fullWidth]="true" [disabled]="busy()">
        ارسال کد تایید
      </app-button>
    </form>
  `,
})
export class LoginForm {
  readonly busy = input(false);
  readonly serverError = input<string | null>(null);
  readonly submitted = output<string>();

  protected readonly mobile = new FormControl('', {
    validators: [Validators.required, Validators.pattern(/^09\d{9}$/)],
    nonNullable: true,
  });

  protected mobileError(): string | null {
    const control = this.mobile;
    if (control.valid || !control.touched) {
      return null;
    }
    return control.hasError('pattern') ? 'شماره موبایل معتبر نیست' : 'شماره موبایل الزامی است';
  }

  protected submit(): void {
    if (this.mobile.invalid) {
      this.mobile.markAsTouched();
      return;
    }
    this.submitted.emit(this.mobile.value.trim());
  }
}
