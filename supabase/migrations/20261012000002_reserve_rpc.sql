-- Nobatifa atomic reservation (Phase 7).
-- Single-transaction booking: lock slot → verify → mark reserved → insert.
-- Concurrent attempts serialize on the row lock; losers get a clear error,
-- never a double booking. UNIQUE(appointments.slot_id) stays as backstop.
-- No user-side status transitions exist in the app (display-only statuses),
-- so this function is the only writer of user appointments.
-- NOT applied to any database (no live project yet).

CREATE OR REPLACE FUNCTION public.reserve_appointment(
  p_center_id uuid,
  p_day_id uuid,
  p_slot_id uuid,
  p_vehicle_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_date text;
  v_time text;
  v_status text;
  v_appointment_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'ابتدا وارد شوید';
  END IF;

  -- Lock the slot first: concurrent reserves queue here.
  SELECT time_slots.time, time_slots.status INTO v_time, v_status
  FROM time_slots
  WHERE time_slots.id = p_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'اطلاعات رزرو معتبر نیست';
  END IF;

  IF v_status <> 'available' THEN
    RAISE EXCEPTION 'این ساعت قابل رزرو نیست';
  END IF;

  SELECT booking_days.date INTO v_date
  FROM booking_days
  WHERE booking_days.id = p_day_id
    AND booking_days.center_id = p_center_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'اطلاعات رزرو معتبر نیست';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM service_centers WHERE id = p_center_id) THEN
    RAISE EXCEPTION 'اطلاعات رزرو معتبر نیست';
  END IF;

  -- Ownership is enforced here, never trusted from the caller.
  IF NOT EXISTS (
    SELECT 1 FROM vehicles WHERE id = p_vehicle_id AND owner_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'اطلاعات رزرو معتبر نیست';
  END IF;

  UPDATE time_slots SET status = 'reserved' WHERE id = p_slot_id;

  INSERT INTO appointments (user_id, center_id, vehicle_id, slot_id, date, time)
  VALUES (v_user_id, p_center_id, p_vehicle_id, p_slot_id, v_date, v_time)
  RETURNING id INTO v_appointment_id;

  RETURN v_appointment_id;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_appointment(uuid, uuid, uuid, uuid)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reserve_appointment(uuid, uuid, uuid, uuid)
  TO authenticated;
