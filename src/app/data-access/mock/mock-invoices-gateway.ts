import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Invoice } from '../models';
import { INVOICES_GATEWAY, type InvoicesGateway } from '../ports/invoices-gateway';
import { fail, respond } from './mock-database';
import { MOCK_INVOICES } from '../mock-data/invoices';

@Injectable()
export class MockInvoicesGateway implements InvoicesGateway {
  getByAppointmentId(appointmentId: string): Observable<Invoice> {
    const invoice = MOCK_INVOICES.find((item) => item.appointmentId === appointmentId);
    if (!invoice) {
      return fail('فاکتور یافت نشد');
    }
    return respond({ ...invoice, items: [...invoice.items] });
  }
}

export const MOCK_INVOICES_PROVIDER = {
  provide: INVOICES_GATEWAY,
  useClass: MockInvoicesGateway,
};
