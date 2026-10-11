import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ErrorState } from '../../shared/ui/states/error-state';
import { LoadingState } from '../../shared/ui/states/loading-state';
import { Icon } from '../../shared/ui/icon/icon';
import { formatPlate } from '../../shared/ui/plate/plate-format';
import { toFaDigits } from '../../shared/utils/fa-digits';
import { InvoiceFacade } from './invoice-facade';

@Component({
  selector: 'app-invoice-page',
  imports: [ErrorState, LoadingState, Icon],
  providers: [InvoiceFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8">
      <h1 class="mb-4 text-right text-xl font-black text-primary-bold">فاکتور</h1>

      @switch (facade.state()) {
        @case ('loading') {
          <app-loading-state />
        }
        @case ('error') {
          <app-error-state [message]="facade.error() ?? ''" (retry)="reload()" />
        }
        @case ('ready') {
          @if (facade.invoice(); as invoice) {
            <div class="flex flex-col gap-4">
              <section class="rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
                <div
                  class="mb-4 flex items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-black text-gray-900"
                >
                  <app-icon name="user" [size]="20" />
                  <span>مشخصات فردی</span>
                </div>
                <dl class="flex flex-col gap-3 px-2 text-sm">
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-gray-500">نام و نام خانوادگی</dt>
                    <dd class="font-bold text-gray-900">
                      {{ invoice.customer.firstName }} {{ invoice.customer.lastName }}
                    </dd>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-gray-500">شماره موبایل</dt>
                    <dd class="font-bold text-gray-900">{{ toFaDigits(invoice.customer.mobile) }}</dd>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-gray-500">خودرو</dt>
                    <dd class="font-bold text-gray-900">{{ invoice.vehicle.type }}</dd>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-gray-500">پلاک</dt>
                    <dd class="font-bold text-gray-900">{{ formatPlate(invoice.vehicle.plate) }}</dd>
                  </div>
                </dl>
              </section>

              <section class="rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
                <div
                  class="mb-4 flex items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-black text-gray-900"
                >
                  <app-icon name="receipt" [size]="20" />
                  <span>مشخصات پرداخت</span>
                </div>
                <dl class="flex flex-col gap-3 px-2 text-sm">
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-gray-500">کد پیگیری</dt>
                    <dd class="font-bold text-gray-900">{{ toFaDigits(invoice.trackingCode) }}</dd>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-gray-500">تاریخ و زمان</dt>
                    <dd class="font-bold text-gray-900">{{ toFaDigits(invoice.dateTime) }}</dd>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-gray-500">اتوسرویس</dt>
                    <dd class="font-bold text-gray-900">{{ invoice.serviceCenterName }}</dd>
                  </div>
                  <div class="my-1 border-t border-dashed border-gray-300"></div>
                  @for (item of invoice.items; track item.title) {
                    <div class="flex items-center justify-between gap-4">
                      <dt class="text-gray-500">{{ item.title }}</dt>
                      <dd class="font-bold text-gray-900">{{ facade.formatRial(item.amountRial) }}</dd>
                    </div>
                  }
                  <div class="flex items-center justify-between gap-4">
                    <dt class="font-black text-gray-900">جمع</dt>
                    <dd class="font-black text-primary-bold">
                      {{ facade.formatRial(invoice.totalRial) }}
                    </dd>
                  </div>
                </dl>
              </section>

              <section class="rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
                <div
                  class="mb-4 flex items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-black text-gray-900"
                >
                  <app-icon name="settings" [size]="20" />
                  <span>خدمات</span>
                </div>
                <dl class="flex flex-col gap-3 px-2 text-sm">
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-gray-500">کیلومتر</dt>
                    <dd class="font-bold text-gray-900">{{ facade.formatNumber(invoice.mileageKm) }}</dd>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-gray-500">کیلومتر بعدی</dt>
                    <dd class="font-bold text-gray-900">
                      {{ facade.formatNumber(invoice.nextMileageKm) }}
                    </dd>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-gray-500">نوع روغن</dt>
                    <dd class="font-bold text-gray-900">{{ toFaDigits(invoice.oilType) }}</dd>
                  </div>
                </dl>
              </section>
            </div>
          }
        }
      }
    </section>
  `,
})
export class InvoicePage implements OnInit {
  protected readonly facade = inject(InvoiceFacade);
  protected readonly formatPlate = formatPlate;
  protected readonly toFaDigits = toFaDigits;
  private readonly route = inject(ActivatedRoute);
  private invoiceId = '';

  ngOnInit(): void {
    this.invoiceId = this.route.snapshot.paramMap.get('id') ?? '';
    void this.facade.load(this.invoiceId);
  }

  protected reload(): void {
    void this.facade.load(this.invoiceId);
  }
}
