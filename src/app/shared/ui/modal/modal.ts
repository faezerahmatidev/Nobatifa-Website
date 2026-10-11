import { afterRenderEffect, ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { Icon } from '../icon/icon';

export type ModalSize = 'sm' | 'md' | 'lg';

const WIDTH_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

@Component({
  selector: 'app-modal',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'onEscape()' },
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4"
        (click)="closed.emit()"
        data-testid="backdrop"
      >
        <div
          #panel
          tabindex="-1"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title()"
          (click)="$event.stopPropagation()"
          [class]="'w-full rounded-2xl bg-white p-6 shadow-xl outline-none ' + WIDTH_CLASSES[size()]"
        >
          <div class="mb-4 flex items-center gap-2">
            <button
              type="button"
              (click)="closed.emit()"
              aria-label="بستن"
              class="flex size-7 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-gray-600"
            >
              <app-icon name="x" [size]="14" />
            </button>
            <h2 class="text-lg font-black text-gray-900">{{ title() }}</h2>
          </div>
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class Modal {
  readonly open = input.required<boolean>();
  readonly title = input('');
  readonly size = input<ModalSize>('md');
  readonly closed = output<void>();

  protected readonly WIDTH_CLASSES = WIDTH_CLASSES;
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  constructor() {
    afterRenderEffect(() => {
      if (!this.open()) {
        return;
      }
      const panel = this.panel()?.nativeElement;
      if (!panel || panel.contains(document.activeElement)) {
        return;
      }
      const target =
        panel.querySelector<HTMLElement>('input') ??
        panel.querySelector<HTMLElement>('[autofocus]') ??
        panel;
      target.focus({ preventScroll: true });
    });
  }

  protected onEscape(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }
}
