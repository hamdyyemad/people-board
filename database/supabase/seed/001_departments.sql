-- ==========================================
-- SEED: Departments
-- ==========================================
-- This file seeds the departments table with initial organizational structure

-- ==========================================
-- ROOT DEPARTMENTS
-- ==========================================
INSERT INTO departments (id, parent_id, name, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', NULL, 'Engineering', NOW() - INTERVAL '90 minutes', NOW() - INTERVAL '90 minutes'),
    ('550e8400-e29b-41d4-a716-446655440001', NULL, 'Human Resources', NOW() - INTERVAL '80 minutes', NOW() - INTERVAL '80 minutes'),
    ('550e8400-e29b-41d4-a716-446655440002', NULL, 'Finance', NOW() - INTERVAL '70 minutes', NOW() - INTERVAL '70 minutes'),
    ('550e8400-e29b-41d4-a716-446655440003', NULL, 'Sales', NOW() - INTERVAL '60 minutes', NOW() - INTERVAL '60 minutes'),
    ('550e8400-e29b-41d4-a716-446655440004', NULL, 'Marketing', NOW() - INTERVAL '50 minutes', NOW() - INTERVAL '50 minutes'),
    ('550e8400-e29b-41d4-a716-446655440005', NULL, 'Business Development', NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '40 minutes'),
    ('550e8400-e29b-41d4-a716-446655440006', NULL, 'Operations', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
    ('550e8400-e29b-41d4-a716-446655440007', NULL, 'Information Technology', NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '20 minutes'),
    ('550e8400-e29b-41d4-a716-446655440008', NULL, 'Compliance', NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '10 minutes'),
    ('550e8400-e29b-41d4-a716-446655440009', NULL, 'Board of Directors', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ==========================================
-- ENGINEERING SUB-DEPARTMENTS
-- ==========================================
INSERT INTO departments (id, parent_id, name, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Backend Development', NOW() - INTERVAL '87 minutes', NOW() - INTERVAL '87 minutes'),
    ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Frontend Development', NOW() - INTERVAL '84 minutes', NOW() - INTERVAL '84 minutes'),
    ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'DevOps & Infrastructure', NOW() - INTERVAL '81 minutes', NOW() - INTERVAL '81 minutes'),
    ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'QA & Testing', NOW() - INTERVAL '78 minutes', NOW() - INTERVAL '78 minutes')
ON CONFLICT DO NOTHING;

-- ==========================================
-- HUMAN RESOURCES SUB-DEPARTMENTS
-- ==========================================
INSERT INTO departments (id, parent_id, name, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440001', 'Recruitment', NOW() - INTERVAL '77 minutes', NOW() - INTERVAL '77 minutes'),
    ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001', 'Employee Relations', NOW() - INTERVAL '74 minutes', NOW() - INTERVAL '74 minutes'),
    ('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440001', 'Compensation & Benefits', NOW() - INTERVAL '71 minutes', NOW() - INTERVAL '71 minutes')
ON CONFLICT DO NOTHING;

-- ==========================================
-- FINANCE SUB-DEPARTMENTS
-- ==========================================
INSERT INTO departments (id, parent_id, name, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440002', 'Accounting', NOW() - INTERVAL '67 minutes', NOW() - INTERVAL '67 minutes'),
    ('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440002', 'Treasury', NOW() - INTERVAL '64 minutes', NOW() - INTERVAL '64 minutes'),
    ('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440002', 'Financial Planning & Analysis', NOW() - INTERVAL '61 minutes', NOW() - INTERVAL '61 minutes'),
    ('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440002', 'Back Office', NOW() - INTERVAL '58 minutes', NOW() - INTERVAL '58 minutes')
ON CONFLICT DO NOTHING;

-- ==========================================
-- SALES SUB-DEPARTMENTS
-- ==========================================
INSERT INTO departments (id, parent_id, name, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440003', 'Enterprise Sales', NOW() - INTERVAL '57 minutes', NOW() - INTERVAL '57 minutes'),
    ('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440003', 'SMB Sales', NOW() - INTERVAL '54 minutes', NOW() - INTERVAL '54 minutes'),
    ('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440003', 'Dealing', NOW() - INTERVAL '51 minutes', NOW() - INTERVAL '51 minutes')
ON CONFLICT DO NOTHING;

-- ==========================================
-- MARKETING SUB-DEPARTMENTS
-- ==========================================
INSERT INTO departments (id, parent_id, name, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440004', 'Digital Marketing', NOW() - INTERVAL '47 minutes', NOW() - INTERVAL '47 minutes'),
    ('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440004', 'Brand & Communications', NOW() - INTERVAL '44 minutes', NOW() - INTERVAL '44 minutes'),
    ('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440004', 'Product Marketing', NOW() - INTERVAL '41 minutes', NOW() - INTERVAL '41 minutes')
ON CONFLICT DO NOTHING;

-- ==========================================
-- BUSINESS DEVELOPMENT SUB-DEPARTMENTS
-- ==========================================
INSERT INTO departments (id, parent_id, name, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440005', 'Partnerships', NOW() - INTERVAL '37 minutes', NOW() - INTERVAL '37 minutes'),
    ('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440005', 'Strategic Accounts', NOW() - INTERVAL '34 minutes', NOW() - INTERVAL '34 minutes')
ON CONFLICT DO NOTHING;

-- ==========================================
-- OPERATIONS SUB-DEPARTMENTS
-- ==========================================
INSERT INTO departments (id, parent_id, name, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440006', 'Facilities Management', NOW() - INTERVAL '27 minutes', NOW() - INTERVAL '27 minutes'),
    ('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440006', 'Process Improvement', NOW() - INTERVAL '24 minutes', NOW() - INTERVAL '24 minutes'),
    ('550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440006', 'Supply Chain', NOW() - INTERVAL '21 minutes', NOW() - INTERVAL '21 minutes')
ON CONFLICT DO NOTHING;

-- ==========================================
-- INFORMATION TECHNOLOGY SUB-DEPARTMENTS
-- ==========================================
INSERT INTO departments (id, parent_id, name, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440007', 'Systems Administration', NOW() - INTERVAL '17 minutes', NOW() - INTERVAL '17 minutes'),
    ('550e8400-e29b-41d4-a716-446655440081', '550e8400-e29b-41d4-a716-446655440007', 'Help Desk & Support', NOW() - INTERVAL '14 minutes', NOW() - INTERVAL '14 minutes'),
    ('550e8400-e29b-41d4-a716-446655440082', '550e8400-e29b-41d4-a716-446655440007', 'IT Security', NOW() - INTERVAL '11 minutes', NOW() - INTERVAL '11 minutes')
ON CONFLICT DO NOTHING;

-- ==========================================
-- COMPLIANCE SUB-DEPARTMENTS
-- ==========================================
INSERT INTO departments (id, parent_id, name, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440090', '550e8400-e29b-41d4-a716-446655440008', 'Regulatory Affairs', NOW() - INTERVAL '7 minutes', NOW() - INTERVAL '7 minutes'),
    ('550e8400-e29b-41d4-a716-446655440091', '550e8400-e29b-41d4-a716-446655440008', 'Risk Management', NOW() - INTERVAL '4 minutes', NOW() - INTERVAL '4 minutes'),
    ('550e8400-e29b-41d4-a716-446655440092', '550e8400-e29b-41d4-a716-446655440008', 'Audit & Controls', NOW() - INTERVAL '1 minute', NOW() - INTERVAL '1 minute')
ON CONFLICT DO NOTHING;