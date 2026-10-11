import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { PlateNumber, Vehicle } from '../models';

export interface CarsGateway {
  list(): Observable<Vehicle[]>;
  create(type: string, plate: PlateNumber): Observable<Vehicle>;
  update(id: string, type: string, plate: PlateNumber): Observable<Vehicle>;
  remove(id: string): Observable<void>;
}

export const CARS_GATEWAY = new InjectionToken<CarsGateway>('CarsGateway');
