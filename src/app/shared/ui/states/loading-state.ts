import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div role="status" class="flex flex-col items-center gap-3 py-8">
      <span
        aria-hidden="true"
        class="size-8 animate-spin rounded-full border-2 border-gray-300 border-t-primary-base"
      ></span>
      <p class="text-sm text-gray-500">{{ message() }}</p>
    </div>
  `,
})
export class LoadingState {
  readonly message = input('در حال بارگذاری...');
}
