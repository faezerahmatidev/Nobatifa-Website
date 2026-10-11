import { MockCarsGateway } from '../../data-access/mock/mock-cars-gateway';
import { MockDatabase } from '../../data-access/mock/mock-database';
import { CarsFacade } from './cars-facade';

const PLATE = { part1: '11', part2: '365', letter: 'س', iranCode: '45' };

function setup(): CarsFacade {
  return new CarsFacade(new MockCarsGateway(new MockDatabase()));
}

describe('CarsFacade', () => {
  it('loads the seeded cars', async () => {
    const facade = setup();
    await facade.load();
    expect(facade.state()).toBe('ready');
    expect(facade.cars().length).toBe(2);
  });

  it('creates a car and closes the modal', async () => {
    const facade = setup();
    await facade.load();
    facade.openCreate();
    expect(facade.modalOpen()).toBe(true);
    await facade.save('پراید', PLATE);
    expect(facade.modalOpen()).toBe(false);
    expect(facade.cars().length).toBe(3);
  });

  it('edits a car', async () => {
    const facade = setup();
    await facade.load();
    const car = facade.cars()[0];
    facade.openEdit(car);
    expect(facade.editing()?.id).toBe(car.id);
    await facade.save('دنا', PLATE);
    expect(facade.cars().find((item) => item.id === car.id)?.type).toBe('دنا');
  });

  it('deletes a car after confirmation', async () => {
    const facade = setup();
    await facade.load();
    const id = facade.cars()[0].id;
    facade.askDelete(id);
    expect(facade.confirmDeleteId()).toBe(id);
    await facade.confirmDelete();
    expect(facade.cars().some((car) => car.id === id)).toBe(false);
  });

  it('shows form errors for invalid data', async () => {
    const facade = setup();
    facade.openCreate();
    await facade.save('', { part1: '', part2: '', letter: '', iranCode: '' });
    expect(facade.formError()).toBe('اطلاعات خودرو کامل نیست');
    expect(facade.modalOpen()).toBe(true);
  });
});
