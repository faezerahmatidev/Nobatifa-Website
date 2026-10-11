import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Button } from '../../shared/ui/button/button';
import { Icon } from '../../shared/ui/icon/icon';
import { Modal } from '../../shared/ui/modal/modal';
import { formatPlate } from '../../shared/ui/plate/plate-format';
import { ErrorState } from '../../shared/ui/states/error-state';
import { LoadingState } from '../../shared/ui/states/loading-state';
import { CarForm } from './car-form';
import { CarsFacade } from './cars-facade';

@Component({
  selector: 'app-cars-page',
  imports: [Button, CarForm, ErrorState, Icon, LoadingState, Modal],
  providers: [CarsFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-xl font-black text-gray-900">خودروهای من</h1>
        <app-button variant="accent" size="sm" (click)="facade.openCreate()">
          + خودروی جدید
        </app-button>
      </div>

      @switch (facade.state()) {
        @case ('loading') {
          <app-loading-state />
        }
        @case ('error') {
          <app-error-state [message]="facade.error() ?? ''" (retry)="facade.load()" />
        }
        @case ('empty') {
          <div class="rounded-xl bg-warning-pale p-4 text-sm leading-6 text-warning-bold">
            خودرویی جهت نمایش موجود نیست! ابتدا یک خودروی جدید اضافه کنید.
          </div>
        }
        @case ('ready') {
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            @for (car of facade.cars(); track car.id) {
              <div
                class="relative flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
              >
                <span class="text-sm font-bold text-gray-800">
                  {{ car.type }} | {{ formatPlate(car.plate) }}
                </span>
                <button
                  type="button"
                  (click)="facade.toggleMenu(car.id)"
                  [attr.aria-expanded]="facade.openMenuId() === car.id"
                  aria-label="عملیات خودرو"
                  class="rounded-lg p-1 text-gray-500"
                >
                  <app-icon name="more" />
                </button>
                  @if (facade.openMenuId() === car.id) {
                    <div
                      class="absolute left-2 top-full z-10 mt-1 w-32 rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
                    >
                      <button
                        type="button"
                        (click)="facade.openEdit(car)"
                        class="flex w-full items-center gap-2 px-3 py-2 text-right text-xs text-gray-700"
                      >
                        <app-icon name="pencil" [size]="14" />
                        ویرایش
                      </button>
                      <button
                        type="button"
                        (click)="facade.askDelete(car.id)"
                        class="flex w-full items-center gap-2 px-3 py-2 text-right text-xs font-bold text-danger-bold"
                      >
                        <app-icon name="trash" [size]="14" />
                        حذف
                      </button>
                    </div>
                  }
              </div>
            }
          </div>
        }
      }
    </section>

    <app-modal
      [open]="facade.modalOpen()"
      [title]="facade.editing() ? 'ویرایش خودرو' : 'خودروی جدید'"
      (closed)="facade.closeModal()"
    >
      <app-car-form
        [initial]="facade.editing()"
        [saving]="facade.saving()"
        [serverError]="facade.formError()"
        (submitted)="facade.save($event.type, $event.plate)"
      />
    </app-modal>

    <app-modal
      [open]="facade.confirmDeleteId() !== null"
      title="حذف خودرو"
      size="sm"
      (closed)="facade.cancelDelete()"
    >
      <p class="text-sm leading-6 text-gray-700">آیا از حذف خودروی موردنظر مطمئن هستید؟</p>
      <div class="mt-4 grid grid-cols-2 gap-2">
        <app-button
          variant="danger"
          [fullWidth]="true"
          [disabled]="facade.deleting()"
          (click)="facade.confirmDelete()"
        >
          بله
        </app-button>
        <app-button variant="text" [fullWidth]="true" (click)="facade.cancelDelete()">
          انصراف
        </app-button>
      </div>
    </app-modal>
  `,
})
export class CarsPage implements OnInit {
  protected readonly facade = inject(CarsFacade);
  protected readonly formatPlate = formatPlate;

  ngOnInit(): void {
    void this.facade.load();
  }
}
