-- V4__seed_demo_admin.sql
-- Demo admin login for local development only:
--   email:    admin@velocira.example.com
--   password: ChangeMe123!
-- The hash below is a real BCrypt(strength 12) hash of "ChangeMe123!",
-- generated and verified in this environment with Python's bcrypt library
-- (not a placeholder string). Rotate this immediately in any real
-- deployment — this is a seed for local/staging use only.

INSERT INTO users (id, full_name, email, phone, password_hash, email_verified, phone_verified, active)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Velocira Admin',
    'admin@velocira.example.com',
    '+911800000000',
    '$2a$12$ajtqXhtG5GbxXRLHp3NdZO9B10.taARQ.6bmZXQWj5/dmCrETN1b.',
    true, true, true
);

INSERT INTO user_roles (user_id, role_id)
SELECT '22222222-2222-2222-2222-222222222222', id FROM roles WHERE name = 'ADMIN';
