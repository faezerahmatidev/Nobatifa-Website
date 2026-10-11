import type { Invoice } from '../models';
import { MOCK_VEHICLES } from './vehicles';

const [CAR] = MOCK_VEHICLES;

export const MOCK_INVOICES: readonly Invoice[] = [
  {
    id: 'inv1',
    trackingCode: '000085752257',
    customer: { firstName: 'علیرضا', lastName: 'رمضانی', mobile: '09128573449' },
    vehicle: CAR,
    serviceCenterName: 'اتوسرویس محمد',
    dateTime: '1403/10/16، 9:50',
    items: [
      { title: 'تعویض روغن', amountRial: 6500000 },
      { title: 'روغن گیربکس', amountRial: 1500000 },
      { title: 'روغن دیفرانسیل', amountRial: 3000000 },
      { title: 'دستمزد', amountRial: 1000000 },
    ],
    totalRial: 12000000,
    mileageKm: 30000,
    nextMileageKm: 36000,
    oilType: 'سوپر پایا 10W40',
  },
];
