import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ErrorState } from '../../shared/ui/states/error-state';
import { LoadingState } from '../../shared/ui/states/loading-state';
import { formatPlate } from '../../shared/ui/plate/plate-format';
import { toFaDigits } from '../../shared/utils/fa-digits';
import { InvoiceFacade } from './invoice-facade';

@Component({
  selector: 'app-invoice-page',
  imports: [ErrorState, LoadingState],
  providers: [InvoiceFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8">
      <h1 class="mb-4 text-xl font-black text-gray-900">فاکتور</h1>

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
              <section class="rounded-2xl border border-gray-200 bg-white p-5">
                <h2 class="mb-3 font-black text-gray-900">مشخصات فردی</h2>
                <dl class="flex flex-col gap-2 text-sm">
                  <div class="flex justify-between gap-4">
                    <dt class="text-gray-500">نام و نام خانوادگی</dt>
                    <dd class="font-bold text-gray-800">
                      {{ invoice.customer.firstName }} {{ invoice.customer.lastName }}
                    </dd>
                  </div>
                  <div class="flex justify-between gap-4">
                    <dt class="text-gray-500">شماره موبایل</dt>
                    <dd class="font-bold text-gray-800">{{ toFaDigits(invoice.customer.mobile) }}</dd>
                  </div>
                  <div class="flex justify-between gap-4">
                    <dt class="text-gray-500">خودرو</dt>
                    <dd class="font-bold text-gray-800">
                      {{ invoice.vehicle.type }} | {{ formatPlate(invoice.vehicle.plate) }}
                    </dd>
                  </div>
                </dl>
              </section>

              <section class="rounded-2xl border border-gray-200 bg-white p-5">
                <h2 class="mb-3 font-black text-gray-900">مشخصات پرداخت</h2>
                <dl class="flex flex-col gap-2 text-sm">
                  <div class="flex justify-between gap-4">
                    <dt class="text-gray-500">کد پیگیری</dt>
                    <dd class="font-bold text-gray-800">{{ toFaDigits(invoice.trackingCode) }}</dd>
                  </div>
                  <div class="flex justify-between gap-4">
                    <dt class="text-gray-500">تاریخ و زمان</dt>
                    <dd class="font-bold text-gray-800">{{ toFaDigits(invoice.dateTime) }}</dd>
                  </div>
                  <div class="flex justify-between gap-4">
                    <dt class="text-gray-500">اتوسرویس</dt>
                    <dd class="font-bold text-gray-800">{{ invoice.serviceCenterName }}</dd>
                  </div>
                  @for (item of invoice.items; track item.title) {
                    <div class="flex justify-between gap-4">
                      <dt class="text-gray-500">{{ item.title }}</dt>
                      <dd class="text-gray-700">{{ facade.formatRial(item.amountRial) }}</dd>
                    </div>
                  }
                  <div class="flex justify-between gap-4 border-t border-gray-200 pt-2">
                    <dt class="font-bold text-gray-800">جمع</dt>
                    <dd class="font-black text-primary-bold">
                      {{ facade.formatRial(invoice.totalRial) }}
                    </dd>
                  </div>
                </dl>
              </section>

              <section class="rounded-2xl border border-gray-200 bg-white p-5">
                <h2 class="mb-3 font-black text-gray-900">خدمات</h2>
                <dl class="flex flex-col gap-2 text-sm">
                  <div class="flex justify-between gap-4">
                    <dt class="text-gray-500">کیلومتر</dt>
                    <dd class="font-bold text-gray-800">{{ toFaDigits(invoice.mileageKm) }}</dd>
                  </div>
                  <div class="flex justify-between gap-4">
                    <dt class="text-gray-500">کیلومتر بعدی</dt>
                    <dd class="font-bold text-gray-800">{{ toFaDigits(invoice.nextMileageKm) }}</dd>
                  </div>
                  <div class="flex justify-between gap-4">
                    <dt class="text-gray-500">نوع روغن</dt>
                    <dd class="font-bold text-gray-800">{{ toFaDigits(invoice.oilType) }}</dd>
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
