import type { BookingDay, SlotStatus, TimeSlot } from '../models';

export interface MockBookingDay extends BookingDay {
  centerId: string;
}

const DAY_LIST: ReadonlyArray<[string, string]> = [
  ['یکشنبه', '01/11'],
  ['سه‌شنبه', '01/13'],
  ['چهارشنبه', '01/14'],
  ['پنجشنبه', '01/15'],
  ['جمعه', '01/16'],
  ['شنبه', '01/17'],
  ['یکشنبه', '01/18'],
  ['دوشنبه', '01/19'],
  ['سه‌شنبه', '01/20'],
  ['چهارشنبه', '01/21'],
  ['پنجشنبه', '01/22'],
  ['جمعه', '01/23'],
  ['شنبه', '01/24'],
];

export const MOCK_DAYS: readonly MockBookingDay[] = DAY_LIST.map(([weekday, date], index) => ({
  id: `day-${String(index + 1).padStart(2, '0')}`,
  centerId: 'c1',
  weekday,
  date,
}));

const SLOT_TEMPLATE: ReadonlyArray<[string, SlotStatus]> = [
  ['08:40', 'available'],
  ['09:10', 'closed'],
  ['10:00', 'reserved'],
  ['10:20', 'available'],
  ['11:20', 'available'],
  ['12:00', 'available'],
  ['13:20', 'available'],
  ['13:30', 'available'],
];

export const MOCK_SLOTS_BY_DAY: Record<string, TimeSlot[]> = Object.fromEntries(
  MOCK_DAYS.map((day) => [
    day.id,
    SLOT_TEMPLATE.map(([time, status], index) => ({
      id: `${day.id}-s${index + 1}`,
      date: day.date,
      time,
      status,
    })),
  ]),
);
