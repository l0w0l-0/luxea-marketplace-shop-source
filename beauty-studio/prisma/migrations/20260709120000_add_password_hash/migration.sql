-- Add password_hash column required for real (bcrypt-based) authentication.
-- Backfilled with an unusable placeholder so the NOT NULL constraint can be
-- applied to any existing rows; real users must reset their password once
-- this ships, since the old plaintext passwords never lived in this table.
ALTER TABLE "users" ADD COLUMN "password_hash" VARCHAR(255) NOT NULL DEFAULT 'RESET_REQUIRED';
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP DEFAULT;
