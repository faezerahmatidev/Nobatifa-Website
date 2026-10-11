import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '../../shared/ui/button/button';
import { SubmitOnEnter } from '../../shared/ui/form/submit-on-enter';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, Button, SubmitOnEnter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="mb-6 text-center text-sm leading-7 text-gray-500">
      شماره موبایل خود را وارد کنید سپس کد تایید پیامک شده را وارد کنید.
    </p>
    <form appSubmitOnEnter (submit)="$event.preventDefault(); submit()" class="flex flex-col gap-8">
      <div class="flex flex-col gap-1">
        <input
          [formControl]="mobile"
          type="tel"
          inputmode="tel"
          placeholder="شماره موبایل"
          aria-label="شماره موبایل"
          [class]="inputClasses()"
        />
        @if (mobileError()) {
          <p class="text-xs text-danger-bold" role="alert">{{ mobileError() }}</p>
        }
      </div>
      @if (serverError()) {
        <p role="alert" class="text-xs text-danger-bold">{{ serverError() }}</p>
      }
      <app-button type="submit" size="lg" [fullWidth]="true" [disabled]="busy() || mobile.invalid">
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

  protected inputClasses(): string {
    return (
      'h-12 w-full rounded-xl border bg-white px-4 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-primary-base ' +
      (this.mobileError() ? 'border-danger-base' : 'border-gray-300')
    );
  }

  protected submit(): void {
    if (this.mobile.invalid) {
      this.mobile.markAsTouched();
      return;
    }
    this.submitted.emit(this.mobile.value.trim());
  }
}
