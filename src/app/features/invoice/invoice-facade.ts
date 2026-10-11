import { Inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Invoice } from '../../data-access/models';
import { INVOICES_GATEWAY, type InvoicesGateway } from '../../data-access/ports/invoices-gateway';

export type DetailState = 'idle' | 'loading' | 'ready' | 'error';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'خطایی رخ داد';
}

@Injectable()
export class InvoiceFacade {
  readonly invoice = signal<Invoice | null>(null);
  readonly state = signal<DetailState>('idle');
  readonly error = signal<string | null>(null);

  constructor(@Inject(INVOICES_GATEWAY) private readonly invoices: InvoicesGateway) {}

  async load(id: string): Promise<void> {
    this.state.set('loading');
    this.error.set(null);
    try {
      const invoice = await firstValueFrom(this.invoices.getById(id));
      this.invoice.set(invoice);
      this.state.set('ready');
    } catch (error) {
      this.state.set('error');
      this.error.set(errorMessage(error));
    }
  }

  formatRial(amount: number): string {
    return `${amount.toLocaleString('fa-IR')} ریال`;
  }
}
