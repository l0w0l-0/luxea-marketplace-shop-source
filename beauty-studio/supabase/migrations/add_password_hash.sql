-- Add password_hash column required for real (bcrypt-based) authentication.
alter table "users" add column "password_hash" varchar(255) not null default 'RESET_REQUIRED';
alter table "users" alter column "password_hash" drop default;
