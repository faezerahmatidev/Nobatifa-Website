import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <img
      src="logo.svg"
      alt="نوبتیفا"
      [style.height.px]="height()"
      class="w-auto"
    />
  `,
})
export class Logo {
  readonly height = input(36);
}
