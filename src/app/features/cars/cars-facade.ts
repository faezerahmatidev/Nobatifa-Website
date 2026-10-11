import { Inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { PlateNumber, Vehicle } from '../../data-access/models';
import { CARS_GATEWAY, type CarsGateway } from '../../data-access/ports/cars-gateway';

export type CarsState = 'idle' | 'loading' | 'ready' | 'empty' | 'error';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'خطایی رخ داد';
}

@Injectable()
export class CarsFacade {
  readonly cars = signal<Vehicle[]>([]);
  readonly state = signal<CarsState>('idle');
  readonly error = signal<string | null>(null);
  readonly modalOpen = signal(false);
  readonly editing = signal<Vehicle | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly openMenuId = signal<string | null>(null);
  readonly confirmDeleteId = signal<string | null>(null);
  readonly deleting = signal(false);

  constructor(@Inject(CARS_GATEWAY) private readonly carsGateway: CarsGateway) {}

  async load(): Promise<void> {
    this.state.set('loading');
    this.error.set(null);
    try {
      const cars = await firstValueFrom(this.carsGateway.list());
      this.cars.set(cars);
      this.state.set(cars.length ? 'ready' : 'empty');
    } catch (error) {
      this.state.set('error');
      this.error.set(errorMessage(error));
    }
  }

  openCreate(): void {
    this.editing.set(null);
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  openEdit(car: Vehicle): void {
    this.editing.set(car);
    this.formError.set(null);
    this.openMenuId.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editing.set(null);
  }

  async save(type: string, plate: PlateNumber): Promise<void> {
    this.saving.set(true);
    this.formError.set(null);
    try {
      const editing = this.editing();
      if (editing) {
        await firstValueFrom(this.carsGateway.update(editing.id, type, plate));
      } else {
        await firstValueFrom(this.carsGateway.create(type, plate));
      }
      await this.load();
      this.closeModal();
    } catch (error) {
      this.formError.set(errorMessage(error));
    } finally {
      this.saving.set(false);
    }
  }

  toggleMenu(id: string): void {
    this.confirmDeleteId.set(null);
    this.openMenuId.update((openId) => (openId === id ? null : id));
  }

  askDelete(id: string): void {
    this.openMenuId.set(null);
    this.confirmDeleteId.set(id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  async confirmDelete(): Promise<void> {
    const id = this.confirmDeleteId();
    if (!id) {
      return;
    }
    this.deleting.set(true);
    try {
      await firstValueFrom(this.carsGateway.remove(id));
      this.confirmDeleteId.set(null);
      await this.load();
    } catch (error) {
      this.error.set(errorMessage(error));
    } finally {
      this.deleting.set(false);
    }
  }
}
