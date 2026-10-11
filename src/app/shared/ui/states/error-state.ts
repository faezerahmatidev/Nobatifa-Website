import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from '../button/button';

@Component({
  selector: 'app-error-state',
  imports: [Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div role="alert" class="flex flex-col items-center gap-3 py-8 text-center">
      <p class="max-w-sm text-sm text-danger-bold">{{ message() }}</p>
      <app-button variant="accent" size="sm" (click)="retry.emit()">تلاش مجدد</app-button>
    </div>
  `,
})
export class ErrorState {
  readonly message = input('خطایی رخ داد. لطفا دوباره تلاش کنید.');
  readonly retry = output<void>();
}
