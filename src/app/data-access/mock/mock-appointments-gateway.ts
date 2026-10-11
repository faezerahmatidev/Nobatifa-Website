import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Appointment } from '../models';
import {
  APPOINTMENTS_GATEWAY,
  type AppointmentsGateway,
} from '../ports/appointments-gateway';
import { MockDatabase, respond } from './mock-database';

@Injectable()
export class MockAppointmentsGateway implements AppointmentsGateway {
  constructor(private readonly db: MockDatabase) {}

  list(): Observable<Appointment[]> {
    return respond(this.db.appointments.map((item) => ({ ...item })));
  }
}

export const MOCK_APPOINTMENTS_PROVIDER = {
  provide: APPOINTMENTS_GATEWAY,
  useClass: MockAppointmentsGateway,
};
