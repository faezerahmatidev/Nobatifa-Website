import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { Button } from '../../shared/ui/button/button';
import { OtpInput } from '../../shared/ui/otp/otp-input';

@Component({
  selector: 'app-otp-form',
  imports: [OtpInput, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="text-sm leading-6 text-gray-600">
      ما یک کد تایید برای شماره {{ mobile() }} ارسال کردیم.
      <button type="button" (click)="editRequested.emit()" class="font-bold text-primary-bold">
        ویرایش
      </button>
    </p>
    <div class="my-4">
      <app-otp-input [(code)]="code" />
    </div>
    <button
      type="button"
      (click)="resendRequested.emit()"
      class="mb-4 text-xs text-gray-500"
    >
      کد تایید ارسال نشده است؟ برای ارسال مجدد کلیک کنید.
    </button>
    @if (serverError()) {
      <p role="alert" class="mb-4 text-xs text-danger-bold">{{ serverError() }}</p>
    }
    <app-button
      [fullWidth]="true"
      [disabled]="code().length !== 4 || busy()"
      (click)="submit()"
    >
      تایید
    </app-button>
  `,
})
export class OtpForm {
  readonly mobile = input.required<string>();
  readonly busy = input(false);
  readonly serverError = input<string | null>(null);
  readonly submitted = output<string>();
  readonly editRequested = output<void>();
  readonly resendRequested = output<void>();

  protected readonly code = model('');

  protected submit(): void {
    if (this.code().length === 4 && !this.busy()) {
      this.submitted.emit(this.code());
    }
  }
}
