import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { AppointmentStatus } from '../../../data-access/models';
import { Icon, type IconName } from '../icon/icon';

interface BadgeConfig {
  label: string;
  classes: string;
  icon: IconName;
}

const CONFIG: Record<AppointmentStatus, BadgeConfig> = {
  pending: { label: 'در انتظار', classes: 'bg-warning-pale text-warning-bold', icon: 'bell' },
  done: { label: 'انجام‌شده', classes: 'bg-success-pale text-success-deep', icon: 'check' },
  cancelled: { label: 'لغو شده', classes: 'bg-danger-pale text-danger-deep', icon: 'x' },
};

@Component({
  selector: 'app-status-badge',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="classes()">
      <app-icon [name]="icon()" [size]="14" />
      {{ label() }}
    </span>
  `,
})
export class StatusBadge {
  readonly status = input.required<AppointmentStatus>();

  protected readonly label = computed(() => CONFIG[this.status()].label);
  protected readonly icon = computed(() => CONFIG[this.status()].icon);
  protected readonly classes = computed(
    () =>
      `inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${CONFIG[this.status()].classes}`,
  );
}
