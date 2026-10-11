import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="flex items-center gap-2">
      <svg
        [attr.width]="size()"
        [attr.height]="size()"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="20" cy="20" r="17" stroke="var(--color-accent-bold)" stroke-width="3" />
        <path
          d="M20 20V11"
          stroke="var(--color-primary-base)"
          stroke-width="3"
          stroke-linecap="round"
        />
        <path
          d="M20 20H27"
          stroke="var(--color-primary-base)"
          stroke-width="3"
          stroke-linecap="round"
        />
        <circle cx="20" cy="20" r="2" fill="var(--color-primary-base)" />
      </svg>
      <span class="text-lg font-black text-accent-bold">نوبتیفا</span>
    </span>
  `,
})
export class Logo {
  readonly size = input(36);
}
