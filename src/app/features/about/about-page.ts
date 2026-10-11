import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../shared/ui/icon/icon';

@Component({
  selector: 'app-about-page',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-7xl px-4 py-10">
      <div class="flex flex-col items-center gap-8 md:flex-row">
        <div class="flex-1">
          <h1 class="text-2xl font-black leading-10 text-gray-900">
            <span class="text-primary-bold">نوبتیفا؛</span>
            تجربه‌ای نوین در مدیریت نوبت اتوسرویس‌ها
          </h1>
          <p class="mt-4 text-sm leading-8 text-gray-600">
            با نوبتیفا دیگر نیازی به انتظار در صف‌های طولانی اتوسرویس‌ها ندارید! این سامانه
            به شما امکان می‌دهد تا نوبت خود را به‌صورت آنلاین رزرو کنید و در زمان مشخص،
            بدون معطلی به تعمیرگاه مراجعه کنید. پس از انجام سرویس، فاکتور خدمات ارائه‌شده
            را به‌راحتی مشاهده و مدیریت کنید. علاوه بر این، نوبتیفا به شما کمک می‌کند که
            زمان نوبت بعدی خود را بدانید تا همیشه خودروی شما در بهترین شرایط باقی بماند. با
            نوبتیفا، مدیریت زمان و خودرویتان را هوشمندانه‌تر انجام دهید!
          </p>
        </div>
        <div
          class="flex aspect-square w-full max-w-md flex-1 items-center justify-center rounded-3xl bg-primary-pale text-primary-bold"
          role="img"
          aria-label="تصویر معرفی نوبتیفا"
        >
          <app-icon name="clock" [size]="96" />
        </div>
      </div>
    </section>
  `,
})
export class AboutPage {}
