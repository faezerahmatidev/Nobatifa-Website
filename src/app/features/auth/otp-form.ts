import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { Button } from '../../shared/ui/button/button';
import { Icon } from '../../shared/ui/icon/icon';
import { OtpInput } from '../../shared/ui/otp/otp-input';
import { SubmitOnEnter } from '../../shared/ui/form/submit-on-enter';

@Component({
  selector: 'app-otp-form',
  imports: [OtpInput, Button, Icon, SubmitOnEnter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="mb-10 text-center text-[13px] leading-6 text-gray-500">
      ما یک کد تایید برای شماره {{ mobile() }}
      <button
        type="button"
        (click)="editRequested.emit()"
        aria-label="ویرایش شماره"
        class="mx-1 inline-flex size-5 items-center justify-center rounded-md border border-primary-base text-primary-base"
      >
        <app-icon name="pencil" [size]="12" />
      </button>
      ارسال کردیم.
    </p>
    <form appSubmitOnEnter (submit)="$event.preventDefault(); submit()" class="mb-10">
      <app-otp-input [(code)]="code" />
    </form>
    <p class="mb-10 text-center text-xs text-gray-500">
      کد تایید ارسال نشده است؟
      <button
        type="button"
        (click)="resendRequested.emit()"
        class="font-bold text-primary-bold"
      >
        برای ارسال مجدد کلیک کنید.
      </button>
    </p>
    @if (serverError()) {
      <p role="alert" class="mb-4 text-center text-xs text-danger-bold">{{ serverError() }}</p>
    }
    <app-button
      type="submit"
      size="lg"
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
