import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-appointments-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-5xl px-4 py-10">
      <h1 class="text-2xl font-bold">نوبت‌های من</h1>
    </section>
  `,
})
export class AppointmentsPage {}
