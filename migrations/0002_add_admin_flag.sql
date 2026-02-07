-- Add admin flag to users table
ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0;

-- Set initial admin user (Apple Sign-In relay email)
UPDATE users SET is_admin = 1 WHERE email = 'bv2fb882zc@privaterelay.appleid.com';
