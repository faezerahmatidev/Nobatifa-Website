import type { Appointment } from '../models';
import { MOCK_CENTERS } from './service-centers';
import { MOCK_VEHICLES } from './vehicles';

const [CENTER] = MOCK_CENTERS;
const [CAR] = MOCK_VEHICLES;

export const MOCK_APPOINTMENTS: readonly Appointment[] = [
  {
    id: 'a1',
    serviceCenter: CENTER,
    date: '1404/01/24',
    time: '9:20',
    vehicle: CAR,
    status: 'pending',
  },
  {
    id: 'a2',
    serviceCenter: CENTER,
    date: '1404/01/20',
    time: '10:30',
    vehicle: CAR,
    status: 'done',
  },
  {
    id: 'a3',
    serviceCenter: CENTER,
    date: '1404/01/18',
    time: '11:00',
    vehicle: CAR,
    status: 'cancelled',
  },
];
