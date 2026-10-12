import { inject, Injectable } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { from, map, Observable } from 'rxjs';
import { SUPABASE_CLIENT } from '../../core/backend/supabase-client';
import type { Invoice } from '../models';
import { INVOICES_GATEWAY, type InvoicesGateway } from '../ports/invoices-gateway';

interface InvoiceItemRow {
  title: string;
  amount_rial: number | string;
}

interface InvoiceRow {
  id: string;
  appointment_id: string;
  tracking_code: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_mobile: string;
  vehicle_type: string;
  plate_part1: string;
  plate_part2: string;
  plate_letter: string;
  plate_iran_code: string;
  service_center_name: string;
  date_time: string;
  mileage_km: number | string;
  next_mileage_km: number | string;
  oil_type: string;
  total_rial: number | string;
  invoice_items: InvoiceItemRow[];
}

/** Real `InvoicesGateway`: owner-readable via RLS through the appointment. */
@Injectable()
export class SupabaseInvoicesGateway implements InvoicesGateway {
  private readonly supabase: SupabaseClient = inject(SUPABASE_CLIENT);

  getByAppointmentId(appointmentId: string): Observable<Invoice> {
    return from(
      this.supabase
        .from('invoices')
        .select(
          'id, appointment_id, tracking_code, customer_first_name, customer_last_name, ' +
            'customer_mobile, vehicle_type, plate_part1, plate_part2, plate_letter, ' +
            'plate_iran_code, service_center_name, date_time, mileage_km, next_mileage_km, ' +
            'oil_type, total_rial, invoice_items(title, amount_rial)',
        )
        .eq('appointment_id', appointmentId)
        .maybeSingle(),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        if (!data) {
          throw new Error('فاکتور یافت نشد');
        }
        const row = data as unknown as InvoiceRow;
        return {
          id: row.id,
          appointmentId: row.appointment_id,
          trackingCode: row.tracking_code,
          customer: {
            firstName: row.customer_first_name,
            lastName: row.customer_last_name,
            mobile: row.customer_mobile,
          },
          vehicle: {
            id: '',
            type: row.vehicle_type,
            plate: {
              part1: row.plate_part1,
              part2: row.plate_part2,
              letter: row.plate_letter,
              iranCode: row.plate_iran_code,
            },
          },
          serviceCenterName: row.service_center_name,
          dateTime: row.date_time,
          items: (row.invoice_items ?? []).map((item) => ({
            title: item.title,
            amountRial: Number(item.amount_rial),
          })),
          totalRial: Number(row.total_rial),
          mileageKm: Number(row.mileage_km),
          nextMileageKm: Number(row.next_mileage_km),
          oilType: row.oil_type,
        };
      }),
    );
  }
}

export const SUPABASE_INVOICES_PROVIDER = {
  provide: INVOICES_GATEWAY,
  useClass: SupabaseInvoicesGateway,
};
