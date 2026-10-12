-- Nobatifa dev seed (safe to re-run: all inserts are idempotent).
-- Seeds the demo center + 14 booking days + slot template mirroring
-- src/app/data-access/mock-data/booking.ts. Dev only; production seeding
-- is a separate decision. NOT users/appointments/invoices.

-- Demo center (code 1001, as used by the app's search flow).
INSERT INTO service_centers (id, code, name, address)
VALUES (
  '10010000-0000-4000-8000-000000000001',
  '1001',
  'اتوسرویس محمد',
  'خیابان اندیشه، کوچه طالقانی، بن‌بست اول، پلاک یک'
)
ON CONFLICT (code) DO NOTHING;

-- 14 consecutive booking days for center 1001.
INSERT INTO booking_days (center_id, weekday, date)
SELECT '10010000-0000-4000-8000-000000000001', day.weekday, day.date
FROM (
  VALUES
    ('یکشنبه', '01/11'),
    ('دوشنبه', '01/12'),
    ('سه‌شنبه', '01/13'),
    ('چهارشنبه', '01/14'),
    ('پنجشنبه', '01/15'),
    ('جمعه', '01/16'),
    ('شنبه', '01/17'),
    ('یکشنبه', '01/18'),
    ('دوشنبه', '01/19'),
    ('سه‌شنبه', '01/20'),
    ('چهارشنبه', '01/21'),
    ('پنجشنبه', '01/22'),
    ('جمعه', '01/23'),
    ('شنبه', '01/24')
) AS day (weekday, date)
ON CONFLICT (center_id, date) DO NOTHING;

-- Slot template per day (mirrors the mock: mixed statuses for UI states).
INSERT INTO time_slots (day_id, time, status)
SELECT booking_days.id, slot.time, slot.status
FROM booking_days
CROSS JOIN (
  VALUES
    ('08:40', 'available'),
    ('09:10', 'closed'),
    ('10:00', 'reserved'),
    ('10:20', 'available'),
    ('11:20', 'available'),
    ('12:00', 'available'),
    ('13:20', 'available'),
    ('13:30', 'available')
) AS slot (time, status)
WHERE booking_days.center_id = '10010000-0000-4000-8000-000000000001'
ON CONFLICT (day_id, time) DO NOTHING;
