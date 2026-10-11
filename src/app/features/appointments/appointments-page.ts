import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Button } from '../../shared/ui/button/button';
import { Icon } from '../../shared/ui/icon/icon';
import { StatusBadge } from '../../shared/ui/badge/status-badge';
import { EmptyState } from '../../shared/ui/states/empty-state';
import { ErrorState } from '../../shared/ui/states/error-state';
import { LoadingState } from '../../shared/ui/states/loading-state';
import { AppointmentsFacade } from './appointments-facade';

@Component({
  selector: 'app-appointments-page',
  imports: [Button, Icon, StatusBadge, EmptyState, ErrorState, LoadingState],
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
                class="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4"
              >
                <div class="flex items-center justify-between">
                  <h2 class="font-black text-gray-900">{{ appointment.serviceCenter.name }}</h2>
                  <app-status-badge [status]="appointment.status" />
                </div>
                <p class="flex items-center gap-2 text-sm text-gray-600">
                  <app-icon name="calendar" [size]="16" />
                  {{ appointment.date }}
                  <app-icon name="clock" [size]="16" />
                  {{ appointment.time }}
                </p>
                <p class="flex items-start gap-2 text-sm text-gray-500">
                  <app-icon name="map-pin" [size]="16" />
                  {{ appointment.serviceCenter.address }}
                </p>
                <div class="mt-auto flex gap-2">
                  <app-button
                    variant="accent"
                    size="sm"
                    (click)="facade.goToCenter(appointment.serviceCenter.code)"
                  >
                    صفحه اتوسرویس
                  </app-button>
                  @if (appointment.status === 'done') {
                    <app-button size="sm" (click)="facade.goToInvoice(appointment.id)">
                      فاکتور
                    </app-button>
                  } @else {
                    <app-button size="sm" [disabled]="true">فاکتور</app-button>
                  }
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

  ngOnInit(): void {
    void this.facade.load();
  }
}
