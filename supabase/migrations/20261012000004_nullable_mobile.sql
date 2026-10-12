-- Nobatifa dev-bypass support (post-Phase 9 live onboarding).
-- Anonymous dev logins (code 1111, development builds only) create
-- auth users WITHOUT a phone number, so profiles.mobile must allow NULL.
-- Real phone users always have a mobile (UNIQUE still enforced for values;
-- PostgreSQL treats NULLs as distinct). NOT applied anywhere yet.

ALTER TABLE profiles ALTER COLUMN mobile DROP NOT NULL;

COMMENT ON COLUMN profiles.mobile IS
  'Login identity for phone users; NULL for anonymous dev logins (development only)';
