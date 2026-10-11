import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../shared/ui/icon/icon';
import { Logo } from '../../shared/ui/logo/logo';

@Component({
  selector: 'app-footer',
  imports: [Icon, Logo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-white">
      <div
        class="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center md:flex-row md:justify-between md:text-right"
      >
        <app-logo />
        <p class="max-w-xl text-sm leading-7 text-gray-600">
          با نوبتیفا، بدون معطلی نوبت خود را آنلاین رزرو کنید و سر زمان مشخص به اتوسرویس
          مراجعه کنید. پس از انجام سرویس، فاکتور خود را مشاهده کنید و از نوبت بعدی خود مطلع
          شوید. سریع، دقیق و بدون دردسر!
        </p>
        <div class="flex items-center gap-2">
          <a
            href="#"
            aria-label="اینستاگرام"
            class="flex size-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700"
          >
            <app-icon name="instagram" />
          </a>
          <a
            href="#"
            aria-label="تلگرام"
            class="flex size-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700"
          >
            <app-icon name="send" />
          </a>
        </div>
      </div>
      <div class="bg-accent-bold py-3 text-center text-xs text-white" dir="ltr">
        © 2025 Nobatifa. All rights reserved.
      </div>
    </footer>
  `,
})
export class Footer {}
