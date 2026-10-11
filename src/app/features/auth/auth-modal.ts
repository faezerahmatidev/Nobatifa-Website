import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { AuthStep } from '../home/booking-facade';
import { LoginForm } from './login-form';
import { Modal } from '../../shared/ui/modal/modal';
import { OtpForm } from './otp-form';
import { ProfileForm, type ProfileData } from './profile-form';

@Component({
  selector: 'app-auth-modal',
  imports: [LoginForm, Modal, OtpForm, ProfileForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (step() !== null) {
      <app-modal
        [open]="true"
        [title]="title()"
        size="sm"
        [align]="step() === 'login' ? 'start' : 'center'"
        (closed)="closed.emit()"
      >
        @switch (step()) {
          @case ('login') {
            <app-login-form
              [busy]="busy()"
              [serverError]="error()"
              (submitted)="loginSubmitted.emit($event)"
            />
          }
          @case ('otp') {
            <app-otp-form
              [mobile]="mobile()"
              [busy]="busy()"
              [serverError]="error()"
              (submitted)="otpSubmitted.emit($event)"
              (editRequested)="editRequested.emit()"
              (resendRequested)="resendRequested.emit()"
            />
          }
          @case ('profile') {
            <app-profile-form
              [busy]="busy()"
              [serverError]="error()"
              (submitted)="profileSubmitted.emit($event)"
            />
          }
        }
      </app-modal>
    }
  `,
})
export class AuthModal {
  readonly step = input<AuthStep | null>(null);
  readonly title = input('');
  readonly busy = input(false);
  readonly error = input<string | null>(null);
  readonly mobile = input('');
  readonly closed = output<void>();
  readonly loginSubmitted = output<string>();
  readonly otpSubmitted = output<string>();
  readonly profileSubmitted = output<ProfileData>();
  readonly editRequested = output<void>();
  readonly resendRequested = output<void>();
}
