import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { SlotStatus } from '../../../data-access/models';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-slot-card',
  imports: [Button, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
    >
      <span class="flex items-center gap-2 text-sm font-bold text-gray-800">
        <app-icon name="clock" [size]="18" />
        {{ time() }}
      </span>
      @switch (status()) {
        @case ('available') {
          <app-button size="sm" (click)="reserve.emit()">رزرو</app-button>
        }
        @case ('closed') {
          <span class="inline-flex items-center gap-1 text-sm font-bold text-danger-bold">
            <app-icon name="lock" [size]="16" />
            تعطیل
          </span>
        }
        @case ('reserved') {
          <span class="text-sm text-gray-400">رزرو شده</span>
        }
      }
    </div>
  `,
})
export class SlotCard {
  readonly time = input.required<string>();
  readonly status = input.required<SlotStatus>();
  readonly reserve = output<void>();
}
