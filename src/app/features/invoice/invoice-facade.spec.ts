import { MockInvoicesGateway } from '../../data-access/mock/mock-invoices-gateway';
import { InvoiceFacade } from './invoice-facade';

describe('InvoiceFacade', () => {
  it('loads the invoice detail', async () => {
    const facade = new InvoiceFacade(new MockInvoicesGateway());
    await facade.load('inv1');
    expect(facade.state()).toBe('ready');
    expect(facade.invoice()?.trackingCode).toBe('000085752257');
    expect(facade.invoice()?.items.length).toBe(4);
  });

  it('shows an error for unknown ids', async () => {
    const facade = new InvoiceFacade(new MockInvoicesGateway());
    await facade.load('nope');
    expect(facade.state()).toBe('error');
    expect(facade.error()).toBe('فاکتور یافت نشد');
  });

  it('formats amounts in Rial', () => {
    const facade = new InvoiceFacade(new MockInvoicesGateway());
    expect(facade.formatRial(12000000)).toContain('ریال');
  });
});
