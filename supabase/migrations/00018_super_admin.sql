-- Add super admin support
ALTER TABLE profiles ADD COLUMN is_super_admin BOOLEAN NOT NULL DEFAULT false;

-- Set arham.ashfaqft@gmail.com as super admin
UPDATE profiles SET is_super_admin = true WHERE email = 'arham.ashfaqft@gmail.com';
