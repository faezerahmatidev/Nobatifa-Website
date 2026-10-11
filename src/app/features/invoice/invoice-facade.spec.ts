import { TestBed } from '@angular/core/testing';
import { provideMockDataAccess } from '../../data-access/mock/provide-mock-data-access';
import { InvoiceFacade } from './invoice-facade';

function setup(): InvoiceFacade {
  TestBed.configureTestingModule({ providers: [InvoiceFacade, ...provideMockDataAccess()] });
  return TestBed.inject(InvoiceFacade);
}

describe('InvoiceFacade', () => {
  it('loads the invoice detail', async () => {
    const facade = setup();
    await facade.load('inv1');
    expect(facade.state()).toBe('ready');
    expect(facade.invoice()?.trackingCode).toBe('000085752257');
    expect(facade.invoice()?.items.length).toBe(4);
  });

  it('shows an error for unknown ids', async () => {
    const facade = setup();
    await facade.load('nope');
    expect(facade.state()).toBe('error');
    expect(facade.error()).toBe('فاکتور یافت نشد');
  });

  it('formats amounts in Rial', () => {
    const facade = setup();
    expect(facade.formatRial(12000000)).toContain('ریال');
  });
});
