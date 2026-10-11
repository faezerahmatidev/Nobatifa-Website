import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'search'
  | 'calendar'
  | 'clock'
  | 'map-pin'
  | 'phone'
  | 'user'
  | 'log-in'
  | 'log-out'
  | 'menu'
  | 'x'
  | 'check'
  | 'pencil'
  | 'trash'
  | 'bell'
  | 'more'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'instagram'
  | 'send'
  | 'scan'
  | 'plus'
  | 'lock';

/**
 * آیکون‌های پروژه با استایل اوت‌لاین (سازگار با دیزاین‌سیستم).
 * دیتای pathها از ست Lucide است تا با آمدن پشتیبانی Angular 22
 * در lucide-angular، جایگزینی یک‌خطی ممکن باشد.
 */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.aria-hidden]': 'true',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
    '[style.display]': '"inline-flex"',
  },
  styles: `
    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  `,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      width="100%"
      height="100%"
    >
      @switch (name()) {
        @case ('search') {
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        }
        @case ('calendar') {
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M3 10h18" />
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        }
        @case ('map-pin') {
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        }
        @case ('phone') {
          <path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
          />
        }
        @case ('user') {
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        }
        @case ('log-in') {
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" x2="3" y1="12" y2="12" />
        }
        @case ('log-out') {
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" x2="9" y1="12" y2="12" />
        }
        @case ('menu') {
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="18" y2="18" />
        }
        @case ('x') {
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        }
        @case ('check') {
          <path d="M20 6 9 17l-5-5" />
        }
        @case ('pencil') {
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        }
        @case ('trash') {
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" x2="10" y1="11" y2="17" />
          <line x1="14" x2="14" y1="11" y2="17" />
        }
        @case ('bell') {
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        }
        @case ('more') {
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        }
        @case ('chevron-left') {
          <path d="m15 18-6-6 6-6" />
        }
        @case ('chevron-right') {
          <path d="m9 18 6-6-6-6" />
        }
        @case ('chevron-down') {
          <path d="m6 9 6 6 6-6" />
        }
        @case ('instagram') {
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        }
        @case ('send') {
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        }
        @case ('scan') {
          <g transform="translate(0.5,2.5)">
            <path d="M21.75 10.2056H0.75" />
            <path d="M19.8794 5.995V4.482C19.8794 2.421 18.2084 0.75 16.1464 0.75H14.9414" />
            <path d="M2.61914 5.995V4.482C2.61914 2.421 4.29014 0.75 6.35214 0.75H7.58814" />
            <path
              d="M19.8794 10.2046V14.2786C19.8794 16.3406 18.2084 18.0116 16.1464 18.0116H14.9414"
            />
            <path
              d="M2.61914 10.2046V14.2786C2.61914 16.3406 4.29014 18.0116 6.35214 18.0116H7.58814"
            />
          </g>
        }
        @case ('plus') {
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        }
        @case ('lock') {
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        }
      }
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input<number>(20);
}
