import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideMockDataAccess } from '../../data-access/mock/provide-mock-data-access';
import { CenterPage } from './center-page';

function setup(code: string): void {
  TestBed.configureTestingModule({
    imports: [CenterPage],
    providers: [
      provideRouter([]),
      ...provideMockDataAccess(),
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ code }) } },
      },
    ],
  });
}

describe('CenterPage', () => {
  it('loads the booking for a valid center code', async () => {
    setup('1001');
    await TestBed.compileComponents();
    const fixture = TestBed.createComponent(CenterPage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 600));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('اتوسرویس محمد');
    expect(el.querySelectorAll('app-slot-card').length).toBeGreaterThan(0);
  }, 10000);

  it('shows an error for an unknown center code', async () => {
    setup('0000');
    await TestBed.compileComponents();
    const fixture = TestBed.createComponent(CenterPage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 600));
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'کد اتوسرویس یافت نشد',
    );
  }, 10000);
});
