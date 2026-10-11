import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon, type IconName } from '../icon/icon';

@Component({
  selector: 'app-empty-state',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-2 py-8 text-center">
      <span class="flex size-12 items-center justify-center rounded-full bg-warning-pale text-warning-bold">
        <app-icon [name]="icon()" [size]="22" />
      </span>
      <p class="text-sm font-bold text-gray-800">{{ title() }}</p>
      <p class="max-w-sm text-sm text-gray-500">{{ message() }}</p>
      <ng-content />
    </div>
  `,
})
export class EmptyState {
  readonly icon = input<IconName>('search');
  readonly title = input('');
  readonly message = input('');
}
