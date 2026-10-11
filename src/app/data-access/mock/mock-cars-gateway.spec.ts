import { firstValueFrom } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { CARS_GATEWAY, type CarsGateway } from '../ports/cars-gateway';
import { provideMockDataAccess } from './provide-mock-data-access';

const PLATE = { part1: '11', part2: '365', letter: 'س', iranCode: '45' };

function setup(): CarsGateway {
  TestBed.configureTestingModule({ providers: [...provideMockDataAccess()] });
  return TestBed.inject(CARS_GATEWAY);
}

describe('MockCarsGateway', () => {
  it('lists the seeded vehicles', async () => {
    const cars = await firstValueFrom(setup().list());
    expect(cars.length).toBe(2);
  });

  it('creates, updates and removes a vehicle', async () => {
    const gateway = setup();
    const created = await firstValueFrom(gateway.create('پراید', PLATE));
    expect(created.id).toBeTruthy();
    const updated = await firstValueFrom(gateway.update(created.id, 'کوییک', PLATE));
    expect(updated.type).toBe('کوییک');
    await firstValueFrom(gateway.remove(created.id));
    const cars = await firstValueFrom(gateway.list());
    expect(cars.some((car) => car.id === created.id)).toBe(false);
  });

  it('rejects incomplete vehicles', async () => {
    const gateway = setup();
    await expect(
      firstValueFrom(gateway.create('', { part1: '', part2: '', letter: '', iranCode: '' })),
    ).rejects.toThrow('اطلاعات خودرو کامل نیست');
  });
});
