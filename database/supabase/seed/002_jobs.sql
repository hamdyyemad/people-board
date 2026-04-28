-- ==========================================
-- SEED: Jobs
-- ==========================================
-- This file seeds the jobs table with initial job titles
-- All jobs are linked to departments created in 001_departments.sql

-- ==========================================
-- ENGINEERING JOBS
-- ==========================================
INSERT INTO jobs (id, title, department_id, is_active, created_at, updated_at)
VALUES 
    -- Backend Development (department: 550e8400-e29b-41d4-a716-446655440010)
    ('650e8400-e29b-41d4-a716-446655440000', 'Senior Backend Engineer', '550e8400-e29b-41d4-a716-446655440010', true, NOW() - INTERVAL '90 minutes', NOW() - INTERVAL '90 minutes'),
    ('650e8400-e29b-41d4-a716-446655440001', 'Backend Engineer', '550e8400-e29b-41d4-a716-446655440010', true, NOW() - INTERVAL '89 minutes', NOW() - INTERVAL '89 minutes'),
    ('650e8400-e29b-41d4-a716-446655440002', 'Junior Backend Developer', '550e8400-e29b-41d4-a716-446655440010', true, NOW() - INTERVAL '88 minutes', NOW() - INTERVAL '88 minutes'),
    ('650e8400-e29b-41d4-a716-446655440003', 'Backend Team Lead', '550e8400-e29b-41d4-a716-446655440010', true, NOW() - INTERVAL '87 minutes', NOW() - INTERVAL '87 minutes'),
    
    -- Frontend Development (department: 550e8400-e29b-41d4-a716-446655440011)
    ('650e8400-e29b-41d4-a716-446655440010', 'Senior Frontend Engineer', '550e8400-e29b-41d4-a716-446655440011', true, NOW() - INTERVAL '86 minutes', NOW() - INTERVAL '86 minutes'),
    ('650e8400-e29b-41d4-a716-446655440011', 'Frontend Engineer', '550e8400-e29b-41d4-a716-446655440011', true, NOW() - INTERVAL '85 minutes', NOW() - INTERVAL '85 minutes'),
    ('650e8400-e29b-41d4-a716-446655440012', 'Junior Frontend Developer', '550e8400-e29b-41d4-a716-446655440011', true, NOW() - INTERVAL '84 minutes', NOW() - INTERVAL '84 minutes'),
    ('650e8400-e29b-41d4-a716-446655440013', 'UI/UX Engineer', '550e8400-e29b-41d4-a716-446655440011', true, NOW() - INTERVAL '83 minutes', NOW() - INTERVAL '83 minutes'),
    
    -- DevOps & Infrastructure (department: 550e8400-e29b-41d4-a716-446655440012)
    ('650e8400-e29b-41d4-a716-446655440020', 'DevOps Engineer', '550e8400-e29b-41d4-a716-446655440012', true, NOW() - INTERVAL '82 minutes', NOW() - INTERVAL '82 minutes'),
    ('650e8400-e29b-41d4-a716-446655440021', 'Senior DevOps Engineer', '550e8400-e29b-41d4-a716-446655440012', true, NOW() - INTERVAL '81 minutes', NOW() - INTERVAL '81 minutes'),
    ('650e8400-e29b-41d4-a716-446655440022', 'Cloud Infrastructure Engineer', '550e8400-e29b-41d4-a716-446655440012', true, NOW() - INTERVAL '80 minutes', NOW() - INTERVAL '80 minutes'),
    ('650e8400-e29b-41d4-a716-446655440023', 'Site Reliability Engineer', '550e8400-e29b-41d4-a716-446655440012', true, NOW() - INTERVAL '79 minutes', NOW() - INTERVAL '79 minutes'),
    
    -- QA & Testing (department: 550e8400-e29b-41d4-a716-446655440013)
    ('650e8400-e29b-41d4-a716-446655440030', 'QA Engineer', '550e8400-e29b-41d4-a716-446655440013', true, NOW() - INTERVAL '78 minutes', NOW() - INTERVAL '78 minutes'),
    ('650e8400-e29b-41d4-a716-446655440031', 'Senior QA Engineer', '550e8400-e29b-41d4-a716-446655440013', true, NOW() - INTERVAL '77 minutes', NOW() - INTERVAL '77 minutes'),
    ('650e8400-e29b-41d4-a716-446655440032', 'Test Automation Engineer', '550e8400-e29b-41d4-a716-446655440013', true, NOW() - INTERVAL '76 minutes', NOW() - INTERVAL '76 minutes'),
    ('650e8400-e29b-41d4-a716-446655440033', 'QA Team Lead', '550e8400-e29b-41d4-a716-446655440013', true, NOW() - INTERVAL '75 minutes', NOW() - INTERVAL '75 minutes')
ON CONFLICT DO NOTHING;

-- ==========================================
-- HUMAN RESOURCES JOBS
-- ==========================================
INSERT INTO jobs (id, title, department_id, is_active, created_at, updated_at)
VALUES 
    -- Recruitment (department: 550e8400-e29b-41d4-a716-446655440020)
    ('650e8400-e29b-41d4-a716-446655440040', 'Recruiter', '550e8400-e29b-41d4-a716-446655440020', true, NOW() - INTERVAL '74 minutes', NOW() - INTERVAL '74 minutes'),
    ('650e8400-e29b-41d4-a716-446655440041', 'Senior Recruiter', '550e8400-e29b-41d4-a716-446655440020', true, NOW() - INTERVAL '73 minutes', NOW() - INTERVAL '73 minutes'),
    ('650e8400-e29b-41d4-a716-446655440042', 'Technical Recruiter', '550e8400-e29b-41d4-a716-446655440020', true, NOW() - INTERVAL '72 minutes', NOW() - INTERVAL '72 minutes'),
    ('650e8400-e29b-41d4-a716-446655440043', 'Talent Acquisition Manager', '550e8400-e29b-41d4-a716-446655440020', true, NOW() - INTERVAL '71 minutes', NOW() - INTERVAL '71 minutes'),
    
    -- Employee Relations (department: 550e8400-e29b-41d4-a716-446655440021)
    ('650e8400-e29b-41d4-a716-446655440050', 'HR Business Partner', '550e8400-e29b-41d4-a716-446655440021', true, NOW() - INTERVAL '70 minutes', NOW() - INTERVAL '70 minutes'),
    ('650e8400-e29b-41d4-a716-446655440051', 'Employee Relations Specialist', '550e8400-e29b-41d4-a716-446655440021', true, NOW() - INTERVAL '69 minutes', NOW() - INTERVAL '69 minutes'),
    ('650e8400-e29b-41d4-a716-446655440052', 'HR Generalist', '550e8400-e29b-41d4-a716-446655440021', true, NOW() - INTERVAL '68 minutes', NOW() - INTERVAL '68 minutes'),
    
    -- Compensation & Benefits (department: 550e8400-e29b-41d4-a716-446655440022)
    ('650e8400-e29b-41d4-a716-446655440060', 'Compensation Analyst', '550e8400-e29b-41d4-a716-446655440022', true, NOW() - INTERVAL '67 minutes', NOW() - INTERVAL '67 minutes'),
    ('650e8400-e29b-41d4-a716-446655440061', 'Benefits Coordinator', '550e8400-e29b-41d4-a716-446655440022', true, NOW() - INTERVAL '66 minutes', NOW() - INTERVAL '66 minutes'),
    ('650e8400-e29b-41d4-a716-446655440062', 'Total Rewards Manager', '550e8400-e29b-41d4-a716-446655440022', true, NOW() - INTERVAL '65 minutes', NOW() - INTERVAL '65 minutes')
ON CONFLICT DO NOTHING;

-- ==========================================
-- FINANCE JOBS
-- ==========================================
INSERT INTO jobs (id, title, department_id, is_active, created_at, updated_at)
VALUES 
    -- Accounting (department: 550e8400-e29b-41d4-a716-446655440040)
    ('650e8400-e29b-41d4-a716-446655440070', 'Accountant', '550e8400-e29b-41d4-a716-446655440040', true, NOW() - INTERVAL '64 minutes', NOW() - INTERVAL '64 minutes'),
    ('650e8400-e29b-41d4-a716-446655440071', 'Senior Accountant', '550e8400-e29b-41d4-a716-446655440040', true, NOW() - INTERVAL '63 minutes', NOW() - INTERVAL '63 minutes'),
    ('650e8400-e29b-41d4-a716-446655440072', 'Accounting Manager', '550e8400-e29b-41d4-a716-446655440040', true, NOW() - INTERVAL '62 minutes', NOW() - INTERVAL '62 minutes'),
    
    -- Treasury (department: 550e8400-e29b-41d4-a716-446655440041)
    ('650e8400-e29b-41d4-a716-446655440080', 'Treasury Analyst', '550e8400-e29b-41d4-a716-446655440041', true, NOW() - INTERVAL '61 minutes', NOW() - INTERVAL '61 minutes'),
    ('650e8400-e29b-41d4-a716-446655440081', 'Treasury Manager', '550e8400-e29b-41d4-a716-446655440041', true, NOW() - INTERVAL '60 minutes', NOW() - INTERVAL '60 minutes'),
    
    -- Financial Planning & Analysis (department: 550e8400-e29b-41d4-a716-446655440042)
    ('650e8400-e29b-41d4-a716-446655440090', 'Financial Analyst', '550e8400-e29b-41d4-a716-446655440042', true, NOW() - INTERVAL '59 minutes', NOW() - INTERVAL '59 minutes'),
    ('650e8400-e29b-41d4-a716-446655440091', 'Senior Financial Analyst', '550e8400-e29b-41d4-a716-446655440042', true, NOW() - INTERVAL '58 minutes', NOW() - INTERVAL '58 minutes'),
    ('650e8400-e29b-41d4-a716-446655440092', 'FP&A Manager', '550e8400-e29b-41d4-a716-446655440042', true, NOW() - INTERVAL '57 minutes', NOW() - INTERVAL '57 minutes'),
    
    -- Back Office (department: 550e8400-e29b-41d4-a716-446655440043)
    ('650e8400-e29b-41d4-a716-446655440100', 'Back Office Analyst', '550e8400-e29b-41d4-a716-446655440043', true, NOW() - INTERVAL '56 minutes', NOW() - INTERVAL '56 minutes'),
    ('650e8400-e29b-41d4-a716-446655440101', 'Operations Coordinator', '550e8400-e29b-41d4-a716-446655440043', true, NOW() - INTERVAL '55 minutes', NOW() - INTERVAL '55 minutes')
ON CONFLICT DO NOTHING;

-- ==========================================
-- SALES JOBS
-- ==========================================
INSERT INTO jobs (id, title, department_id, is_active, created_at, updated_at)
VALUES 
    -- Enterprise Sales (department: 550e8400-e29b-41d4-a716-446655440030)
    ('650e8400-e29b-41d4-a716-446655440110', 'Enterprise Account Executive', '550e8400-e29b-41d4-a716-446655440030', true, NOW() - INTERVAL '54 minutes', NOW() - INTERVAL '54 minutes'),
    ('650e8400-e29b-41d4-a716-446655440111', 'Senior Enterprise Account Executive', '550e8400-e29b-41d4-a716-446655440030', true, NOW() - INTERVAL '53 minutes', NOW() - INTERVAL '53 minutes'),
    ('650e8400-e29b-41d4-a716-446655440112', 'Enterprise Sales Manager', '550e8400-e29b-41d4-a716-446655440030', true, NOW() - INTERVAL '52 minutes', NOW() - INTERVAL '52 minutes'),
    
    -- SMB Sales (department: 550e8400-e29b-41d4-a716-446655440031)
    ('650e8400-e29b-41d4-a716-446655440120', 'Sales Representative', '550e8400-e29b-41d4-a716-446655440031', true, NOW() - INTERVAL '51 minutes', NOW() - INTERVAL '51 minutes'),
    ('650e8400-e29b-41d4-a716-446655440121', 'Account Manager', '550e8400-e29b-41d4-a716-446655440031', true, NOW() - INTERVAL '50 minutes', NOW() - INTERVAL '50 minutes'),
    ('650e8400-e29b-41d4-a716-446655440122', 'SMB Sales Manager', '550e8400-e29b-41d4-a716-446655440031', true, NOW() - INTERVAL '49 minutes', NOW() - INTERVAL '49 minutes'),
    
    -- Dealing (department: 550e8400-e29b-41d4-a716-446655440032)
    ('650e8400-e29b-41d4-a716-446655440130', 'Dealer', '550e8400-e29b-41d4-a716-446655440032', true, NOW() - INTERVAL '48 minutes', NOW() - INTERVAL '48 minutes'),
    ('650e8400-e29b-41d4-a716-446655440131', 'Senior Dealer', '550e8400-e29b-41d4-a716-446655440032', true, NOW() - INTERVAL '47 minutes', NOW() - INTERVAL '47 minutes'),
    ('650e8400-e29b-41d4-a716-446655440132', 'Deal Manager', '550e8400-e29b-41d4-a716-446655440032', true, NOW() - INTERVAL '46 minutes', NOW() - INTERVAL '46 minutes')
ON CONFLICT DO NOTHING;

-- ==========================================
-- MARKETING JOBS
-- ==========================================
INSERT INTO jobs (id, title, department_id, is_active, created_at, updated_at)
VALUES 
    -- Digital Marketing (department: 550e8400-e29b-41d4-a716-446655440050)
    ('650e8400-e29b-41d4-a716-446655440140', 'Digital Marketing Specialist', '550e8400-e29b-41d4-a716-446655440050', true, NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes'),
    ('650e8400-e29b-41d4-a716-446655440141', 'SEO Specialist', '550e8400-e29b-41d4-a716-446655440050', true, NOW() - INTERVAL '44 minutes', NOW() - INTERVAL '44 minutes'),
    ('650e8400-e29b-41d4-a716-446655440142', 'Content Marketing Manager', '550e8400-e29b-41d4-a716-446655440050', true, NOW() - INTERVAL '43 minutes', NOW() - INTERVAL '43 minutes'),
    
    -- Brand & Communications (department: 550e8400-e29b-41d4-a716-446655440051)
    ('650e8400-e29b-41d4-a716-446655440150', 'Brand Manager', '550e8400-e29b-41d4-a716-446655440051', true, NOW() - INTERVAL '42 minutes', NOW() - INTERVAL '42 minutes'),
    ('650e8400-e29b-41d4-a716-446655440151', 'Communications Specialist', '550e8400-e29b-41d4-a716-446655440051', true, NOW() - INTERVAL '41 minutes', NOW() - INTERVAL '41 minutes'),
    ('650e8400-e29b-41d4-a716-446655440152', 'Public Relations Manager', '550e8400-e29b-41d4-a716-446655440051', true, NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '40 minutes'),
    
    -- Product Marketing (department: 550e8400-e29b-41d4-a716-446655440052)
    ('650e8400-e29b-41d4-a716-446655440160', 'Product Marketing Manager', '550e8400-e29b-41d4-a716-446655440052', true, NOW() - INTERVAL '39 minutes', NOW() - INTERVAL '39 minutes'),
    ('650e8400-e29b-41d4-a716-446655440161', 'Product Marketing Lead', '550e8400-e29b-41d4-a716-446655440052', true, NOW() - INTERVAL '38 minutes', NOW() - INTERVAL '38 minutes')
ON CONFLICT DO NOTHING;

-- ==========================================
-- BUSINESS DEVELOPMENT JOBS
-- ==========================================
INSERT INTO jobs (id, title, department_id, is_active, created_at, updated_at)
VALUES 
    -- Partnerships (department: 550e8400-e29b-41d4-a716-446655440060)
    ('650e8400-e29b-41d4-a716-446655440170', 'Partnership Manager', '550e8400-e29b-41d4-a716-446655440060', true, NOW() - INTERVAL '37 minutes', NOW() - INTERVAL '37 minutes'),
    ('650e8400-e29b-41d4-a716-446655440171', 'Senior Partnership Manager', '550e8400-e29b-41d4-a716-446655440060', true, NOW() - INTERVAL '36 minutes', NOW() - INTERVAL '36 minutes'),
    ('650e8400-e29b-41d4-a716-446655440172', 'Business Development Manager', '550e8400-e29b-41d4-a716-446655440060', true, NOW() - INTERVAL '35 minutes', NOW() - INTERVAL '35 minutes'),
    
    -- Strategic Accounts (department: 550e8400-e29b-41d4-a716-446655440061)
    ('650e8400-e29b-41d4-a716-446655440180', 'Strategic Account Manager', '550e8400-e29b-41d4-a716-446655440061', true, NOW() - INTERVAL '34 minutes', NOW() - INTERVAL '34 minutes'),
    ('650e8400-e29b-41d4-a716-446655440181', 'Senior Strategic Account Manager', '550e8400-e29b-41d4-a716-446655440061', true, NOW() - INTERVAL '33 minutes', NOW() - INTERVAL '33 minutes')
ON CONFLICT DO NOTHING;

-- ==========================================
-- OPERATIONS JOBS
-- ==========================================
INSERT INTO jobs (id, title, department_id, is_active, created_at, updated_at)
VALUES 
    -- Facilities Management (department: 550e8400-e29b-41d4-a716-446655440070)
    ('650e8400-e29b-41d4-a716-446655440190', 'Facilities Manager', '550e8400-e29b-41d4-a716-446655440070', true, NOW() - INTERVAL '32 minutes', NOW() - INTERVAL '32 minutes'),
    ('650e8400-e29b-41d4-a716-446655440191', 'Facilities Coordinator', '550e8400-e29b-41d4-a716-446655440070', true, NOW() - INTERVAL '31 minutes', NOW() - INTERVAL '31 minutes'),
    
    -- Process Improvement (department: 550e8400-e29b-41d4-a716-446655440071)
    ('650e8400-e29b-41d4-a716-446655440200', 'Process Improvement Specialist', '550e8400-e29b-41d4-a716-446655440071', true, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
    ('650e8400-e29b-41d4-a716-446655440201', 'Operations Analyst', '550e8400-e29b-41d4-a716-446655440071', true, NOW() - INTERVAL '29 minutes', NOW() - INTERVAL '29 minutes'),
    
    -- Supply Chain (department: 550e8400-e29b-41d4-a716-446655440072)
    ('650e8400-e29b-41d4-a716-446655440210', 'Supply Chain Coordinator', '550e8400-e29b-41d4-a716-446655440072', true, NOW() - INTERVAL '28 minutes', NOW() - INTERVAL '28 minutes'),
    ('650e8400-e29b-41d4-a716-446655440211', 'Supply Chain Manager', '550e8400-e29b-41d4-a716-446655440072', true, NOW() - INTERVAL '27 minutes', NOW() - INTERVAL '27 minutes')
ON CONFLICT DO NOTHING;

-- ==========================================
-- INFORMATION TECHNOLOGY JOBS
-- ==========================================
INSERT INTO jobs (id, title, department_id, is_active, created_at, updated_at)
VALUES 
    -- Systems Administration (department: 550e8400-e29b-41d4-a716-446655440080)
    ('650e8400-e29b-41d4-a716-446655440220', 'Systems Administrator', '550e8400-e29b-41d4-a716-446655440080', true, NOW() - INTERVAL '26 minutes', NOW() - INTERVAL '26 minutes'),
    ('650e8400-e29b-41d4-a716-446655440221', 'Senior Systems Administrator', '550e8400-e29b-41d4-a716-446655440080', true, NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '25 minutes'),
    
    -- Help Desk & Support (department: 550e8400-e29b-41d4-a716-446655440081)
    ('650e8400-e29b-41d4-a716-446655440230', 'IT Support Specialist', '550e8400-e29b-41d4-a716-446655440081', true, NOW() - INTERVAL '24 minutes', NOW() - INTERVAL '24 minutes'),
    ('650e8400-e29b-41d4-a716-446655440231', 'Help Desk Technician', '550e8400-e29b-41d4-a716-446655440081', true, NOW() - INTERVAL '23 minutes', NOW() - INTERVAL '23 minutes'),
    ('650e8400-e29b-41d4-a716-446655440232', 'IT Support Manager', '550e8400-e29b-41d4-a716-446655440081', true, NOW() - INTERVAL '22 minutes', NOW() - INTERVAL '22 minutes')
ON CONFLICT DO NOTHING;

-- ==========================================
-- COMPLIANCE JOBS
-- ==========================================
INSERT INTO jobs (id, title, department_id, is_active, created_at, updated_at)
VALUES 
    -- Compliance (root department: 550e8400-e29b-41d4-a716-446655440008)
    ('650e8400-e29b-41d4-a716-446655440240', 'Compliance Officer', '550e8400-e29b-41d4-a716-446655440008', true, NOW() - INTERVAL '21 minutes', NOW() - INTERVAL '21 minutes'),
    ('650e8400-e29b-41d4-a716-446655440241', 'Senior Compliance Officer', '550e8400-e29b-41d4-a716-446655440008', true, NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '20 minutes'),
    ('650e8400-e29b-41d4-a716-446655440242', 'Compliance Manager', '550e8400-e29b-41d4-a716-446655440008', true, NOW() - INTERVAL '19 minutes', NOW() - INTERVAL '19 minutes')
ON CONFLICT DO NOTHING;

-- ==========================================
-- BOARD OF DIRECTORS JOBS
-- ==========================================
INSERT INTO jobs (id, title, department_id, is_active, created_at, updated_at)
VALUES 
    -- Board of Directors (root department: 550e8400-e29b-41d4-a716-446655440009)
    ('650e8400-e29b-41d4-a716-446655440250', 'Chief Executive Officer', '550e8400-e29b-41d4-a716-446655440009', true, NOW() - INTERVAL '18 minutes', NOW() - INTERVAL '18 minutes'),
    ('650e8400-e29b-41d4-a716-446655440251', 'Chief Technology Officer', '550e8400-e29b-41d4-a716-446655440009', true, NOW() - INTERVAL '17 minutes', NOW() - INTERVAL '17 minutes'),
    ('650e8400-e29b-41d4-a716-446655440252', 'Chief Financial Officer', '550e8400-e29b-41d4-a716-446655440009', true, NOW() - INTERVAL '16 minutes', NOW() - INTERVAL '16 minutes'),
    ('650e8400-e29b-41d4-a716-446655440253', 'Chief Operating Officer', '550e8400-e29b-41d4-a716-446655440009', true, NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes'),
    ('650e8400-e29b-41d4-a716-446655440254', 'Chief Human Resources Officer', '550e8400-e29b-41d4-a716-446655440009', true, NOW() - INTERVAL '14 minutes', NOW() - INTERVAL '14 minutes'),
    ('650e8400-e29b-41d4-a716-446655440255', 'Chief Marketing Officer', '550e8400-e29b-41d4-a716-446655440009', true, NOW() - INTERVAL '13 minutes', NOW() - INTERVAL '13 minutes'),
    ('650e8400-e29b-41d4-a716-446655440256', 'Board Member', '550e8400-e29b-41d4-a716-446655440009', true, NOW() - INTERVAL '12 minutes', NOW() - INTERVAL '12 minutes')
ON CONFLICT DO NOTHING;
