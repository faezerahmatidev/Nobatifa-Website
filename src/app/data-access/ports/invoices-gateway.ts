import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Invoice } from '../models';

export interface InvoicesGateway {
  getByAppointmentId(appointmentId: string): Observable<Invoice>;
}

export const INVOICES_GATEWAY = new InjectionToken<InvoicesGateway>('InvoicesGateway');
