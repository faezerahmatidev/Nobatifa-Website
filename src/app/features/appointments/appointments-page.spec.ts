import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMockDataAccess } from '../../data-access/mock/provide-mock-data-access';
import { AppointmentsPage } from './appointments-page';

describe('AppointmentsPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsPage],
      providers: [provideRouter([]), ...provideMockDataAccess()],
    }).compileComponents();
  });

  it('renders one card per appointment', async () => {
    const fixture = TestBed.createComponent(AppointmentsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    const cards = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '[data-testid="appointment-card"]',
    );
    expect(cards.length).toBe(3);
  });

  it('enables the invoice button only for done appointments', async () => {
    const fixture = TestBed.createComponent(AppointmentsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const invoiceButtons = Array.from(el.querySelectorAll('button')).filter(
      (button) => button.textContent?.trim() === 'فاکتور',
    ) as HTMLButtonElement[];
    expect(invoiceButtons.length).toBe(3);
    expect(invoiceButtons.filter((button) => !button.disabled).length).toBe(1);
  });
});
