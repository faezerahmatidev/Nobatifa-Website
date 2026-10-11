import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Appointment } from '../models';

export interface AppointmentsGateway {
  list(): Observable<Appointment[]>;
}

export const APPOINTMENTS_GATEWAY = new InjectionToken<AppointmentsGateway>(
  'AppointmentsGateway',
);
