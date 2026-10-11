import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { Appointment } from '../../data-access/models';
import { APPOINTMENTS_GATEWAY } from '../../data-access/ports/appointments-gateway';

export type ListState = 'idle' | 'loading' | 'ready' | 'empty' | 'error';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'خطایی رخ داد';
}

@Injectable()
export class AppointmentsFacade {
  readonly appointments = signal<Appointment[]>([]);
  readonly state = signal<ListState>('idle');
  readonly error = signal<string | null>(null);

  private readonly appointmentsGateway = inject(APPOINTMENTS_GATEWAY);
  private readonly router = inject(Router);

  async load(): Promise<void> {
    this.state.set('loading');
    this.error.set(null);
    try {
      const list = await firstValueFrom(this.appointmentsGateway.list());
      this.appointments.set(list);
      this.state.set(list.length ? 'ready' : 'empty');
    } catch (error) {
      this.state.set('error');
      this.error.set(errorMessage(error));
    }
  }

  goToCenter(code: string): void {
    void this.router.navigate(['/center', code]);
  }

  goToInvoice(id: string): void {
    void this.router.navigate(['/profile/invoice', id]);
  }
}
