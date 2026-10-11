import { TestBed } from '@angular/core/testing';
import { provideMockDataAccess } from '../../data-access/mock/provide-mock-data-access';
import { CarsPage } from './cars-page';

describe('CarsPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarsPage],
      providers: [...provideMockDataAccess()],
    }).compileComponents();
  });

  it('renders the title and seeded cars', async () => {
    const fixture = TestBed.createComponent(CarsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('خودروهای من');
    expect(el.textContent).toContain('پراید');
  });

  it('opens the create modal', async () => {
    const fixture = TestBed.createComponent(CarsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const create = Array.from(el.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('خودروی جدید'),
    );
    create?.click();
    fixture.detectChanges();
    expect(el.querySelector('[role="dialog"]')).toBeTruthy();
    expect(el.textContent).toContain('نوع خودرو');
  });
});
