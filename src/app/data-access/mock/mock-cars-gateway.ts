import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { PlateNumber, Vehicle } from '../models';
import { CARS_GATEWAY, type CarsGateway } from '../ports/cars-gateway';
import { fail, MockDatabase, respond } from './mock-database';

function isPlateComplete(plate: PlateNumber): boolean {
  return Boolean(plate.part1 && plate.part2 && plate.letter && plate.iranCode);
}

@Injectable()
export class MockCarsGateway implements CarsGateway {
  constructor(private readonly db: MockDatabase) {}

  list(): Observable<Vehicle[]> {
    return respond(this.db.vehicles.map((vehicle) => ({ ...vehicle })));
  }

  create(type: string, plate: PlateNumber): Observable<Vehicle> {
    if (!type.trim() || !isPlateComplete(plate)) {
      return fail('اطلاعات خودرو کامل نیست');
    }
    const vehicle: Vehicle = {
      id: this.db.nextVehicleId(),
      type: type.trim(),
      plate: { ...plate },
    };
    this.db.vehicles.push(vehicle);
    return respond({ ...vehicle });
  }

  update(id: string, type: string, plate: PlateNumber): Observable<Vehicle> {
    const vehicle = this.db.vehicles.find((item) => item.id === id);
    if (!vehicle) {
      return fail('خودرو یافت نشد');
    }
    if (!type.trim() || !isPlateComplete(plate)) {
      return fail('اطلاعات خودرو کامل نیست');
    }
    vehicle.type = type.trim();
    vehicle.plate = { ...plate };
    return respond({ ...vehicle });
  }

  remove(id: string): Observable<void> {
    const index = this.db.vehicles.findIndex((item) => item.id === id);
    if (index === -1) {
      return fail('خودرو یافت نشد');
    }
    this.db.vehicles.splice(index, 1);
    return respond(undefined);
  }
}

export const MOCK_CARS_PROVIDER = { provide: CARS_GATEWAY, useClass: MockCarsGateway };
