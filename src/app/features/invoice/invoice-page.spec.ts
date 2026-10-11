import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideMockDataAccess } from '../../data-access/mock/provide-mock-data-access';
import { InvoicePage } from './invoice-page';

describe('InvoicePage', () => {
  it('renders the invoice detail', async () => {
    await TestBed.configureTestingModule({
      imports: [InvoicePage],
      providers: [
        provideRouter([]),
        ...provideMockDataAccess(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: 'a2' }) } },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(InvoicePage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('۰۰۰۰۸۵۷۵۲۲۵۷');
    expect(el.textContent).toContain('مشخصات پرداخت');
    expect(el.textContent).toContain('خدمات');
  });
});
