import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import type { AppointmentStatus } from '../../data-access/models';
import { Button } from '../../shared/ui/button/button';
import { Icon, type IconName } from '../../shared/ui/icon/icon';
import { EmptyState } from '../../shared/ui/states/empty-state';
import { ErrorState } from '../../shared/ui/states/error-state';
import { toFaDigits } from '../../shared/utils/fa-digits';
import { LoadingState } from '../../shared/ui/states/loading-state';
import { AppointmentsFacade } from './appointments-facade';

const STATUS_BOX: Record<AppointmentStatus, string> = {
  pending: 'border-warning-soft bg-warning-pale text-warning-bold',
  done: 'border-success-soft bg-success-pale text-success-deep',
  cancelled: 'border-danger-soft bg-danger-pale text-danger-deep',
};

const STATUS_ICON: Record<AppointmentStatus, IconName> = {
  pending: 'bell',
  done: 'check',
  cancelled: 'x',
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: 'در انتظار',
  done: 'انجام‌شده',
  cancelled: 'لغو شده',
};

@Component({
  selector: 'app-appointments-page',
  imports: [Button, Icon, EmptyState, ErrorState, LoadingState],
  providers: [AppointmentsFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8">
      <h1 class="mb-4 text-xl font-black text-gray-900">نوبت‌های من</h1>

      @switch (facade.state()) {
        @case ('loading') {
          <app-loading-state />
        }
        @case ('error') {
          <app-error-state [message]="facade.error() ?? ''" (retry)="facade.load()" />
        }
        @case ('empty') {
          <app-empty-state
            title="نوبتی ثبت نشده است"
            message="هنوز نوبتی رزرو نکرده‌اید. از صفحه اصلی شروع کنید."
          />
        }
        @case ('ready') {
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            @for (appointment of facade.appointments(); track appointment.id) {
              <article
                data-testid="appointment-card"
                class="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div class="flex items-center justify-between gap-2">
                  <h2 class="font-black text-gray-900">{{ appointment.serviceCenter.name }}</h2>
                  <span
                    role="img"
                    [attr.aria-label]="statusLabel(appointment.status)"
                    [class]="
                      'flex size-9 shrink-0 items-center justify-center rounded-lg border ' +
                      statusBox(appointment.status)
                    "
                  >
                    <app-icon [name]="statusIcon(appointment.status)" [size]="18" />
                  </span>
                </div>
                <p class="flex items-center gap-2 text-sm font-bold text-gray-800">
                  <app-icon name="calendar" [size]="22" />
                  {{ toFaDigits(appointment.date) }}
                </p>
                <p class="flex items-center gap-2 text-sm font-bold text-gray-800">
                  <app-icon name="clock" [size]="22" />
                  {{ toFaDigits(appointment.time) }}
                </p>
                <p class="flex items-start gap-2 text-sm font-bold text-gray-800">
                  <app-icon name="map-pin" [size]="22" />
                  <span>{{ appointment.serviceCenter.address }}</span>
                </p>
                <div class="mt-auto flex gap-2">
                  @if (appointment.status === 'done') {
                    <app-button size="sm" (click)="facade.goToInvoice(appointment.id)">
                      <img src="icons/document.svg" alt="" width="13" height="14" />
                      فاکتور
                    </app-button>
                  } @else {
                    <app-button size="sm" [disabled]="true">
                      <img src="icons/document.svg" alt="" width="13" height="14" />
                      فاکتور
                    </app-button>
                  }
                  <app-button
                    variant="accent"
                    size="sm"
                    (click)="facade.goToCenter(appointment.serviceCenter.code)"
                  >
                    صفحه اتوسرویس
                    <svg
                      width="12"
                      height="10"
                      viewBox="0 0 12 10"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M0.75 4.76638H10.75"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M4.7832 8.78267L0.74987 4.76667L4.7832 0.75"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </app-button>
                </div>
              </article>
            }
          </div>
        }
      }
    </section>
  `,
})
export class AppointmentsPage implements OnInit {
  protected readonly facade = inject(AppointmentsFacade);
  protected readonly toFaDigits = toFaDigits;

  ngOnInit(): void {
    void this.facade.load();
  }

  protected statusBox(status: AppointmentStatus): string {
    return STATUS_BOX[status];
  }

  protected statusIcon(status: AppointmentStatus): IconName {
    return STATUS_ICON[status];
  }

  protected statusLabel(status: AppointmentStatus): string {
    return STATUS_LABEL[status];
  }
}
