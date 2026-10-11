import { firstValueFrom } from 'rxjs';
import { MockInvoicesGateway } from './mock-invoices-gateway';

describe('MockInvoicesGateway', () => {
  it('returns the invoice with items and total', async () => {
    const gateway = new MockInvoicesGateway();
    const invoice = await firstValueFrom(gateway.getById('inv1'));
    expect(invoice.items.length).toBe(4);
    expect(invoice.totalRial).toBe(12000000);
  });

  it('rejects unknown invoice ids', async () => {
    const gateway = new MockInvoicesGateway();
    await expect(firstValueFrom(gateway.getById('nope'))).rejects.toThrow('فاکتور یافت نشد');
  });
});
