import { firstValueFrom } from 'rxjs';
import { MockAppointmentsGateway } from './mock-appointments-gateway';
import { MockDatabase } from './mock-database';

describe('MockAppointmentsGateway', () => {
  it('lists appointments with all statuses', async () => {
    const gateway = new MockAppointmentsGateway(new MockDatabase());
    const list = await firstValueFrom(gateway.list());
    expect(list.map((item) => item.status).sort()).toEqual(
      ['cancelled', 'done', 'pending'].sort(),
    );
  });
});
