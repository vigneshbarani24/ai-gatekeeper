-- ===============================================
-- AI Gatekeeper - Seed Data
-- Comprehensive test data for demo and development
-- ===============================================

-- ======================
-- USERS (Demo Accounts)
-- ======================

INSERT INTO users (id, phone_number, twilio_phone_number, elevenlabs_voice_id, created_at)
VALUES
    -- User 1: Sarah (Professional with high call volume)
    (
        'user_sarah_123',
        '+15551234567',
        '+15559876543',
        'voice_sarah_abc',
        NOW() - INTERVAL '30 days'
    ),

    -- User 2: John (Small business owner)
    (
        'user_john_456',
        '+15552345678',
        '+15558765432',
        'voice_john_def',
        NOW() - INTERVAL '15 days'
    ),

    -- User 3: Demo Account (For testing)
    (
        'user_demo_789',
        '+15559999999',
        '+15551111111',
        'demo_voice_id',
        NOW()
    )
ON CONFLICT (id) DO NOTHING;


-- ======================
-- CONTACTS (Whitelist)
-- ======================

INSERT INTO contacts (id, user_id, phone_number, name, auto_pass, created_at)
VALUES
    -- Sarah's contacts
    ('contact_001', 'user_sarah_123', '+15555555551', 'Mom', TRUE, NOW() - INTERVAL '30 days'),
    ('contact_002', 'user_sarah_123', '+15555555552', 'Dad', TRUE, NOW() - INTERVAL '30 days'),
    ('contact_003', 'user_sarah_123', '+15555555553', 'Doctor Office', TRUE, NOW() - INTERVAL '20 days'),
    ('contact_004', 'user_sarah_123', '+15555555554', 'Best Friend Alice', TRUE, NOW() - INTERVAL '25 days'),
    ('contact_005', 'user_sarah_123', '+15555555555', 'Work - Boss', TRUE, NOW() - INTERVAL '15 days'),

    -- John's contacts
    ('contact_101', 'user_john_456', '+15556666661', 'Wife', TRUE, NOW() - INTERVAL '15 days'),
    ('contact_102', 'user_john_456', '+15556666662', 'Business Partner', TRUE, NOW() - INTERVAL '10 days'),
    ('contact_103', 'user_john_456', '+15556666663', 'Accountant', TRUE, NOW() - INTERVAL '5 days'),

    -- Demo contacts
    ('contact_201', 'user_demo_789', '+15557777771', 'Test Contact 1', FALSE, NOW()),
    ('contact_202', 'user_demo_789', '+15557777772', 'Test Contact 2', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;


-- ======================
-- CALLS (History)
-- ======================

INSERT INTO calls (id, user_id, call_sid, caller_number, intent, scam_score, action_taken, duration, created_at)
VALUES
    -- Sarah's calls (mix of legitimate and scams)

    -- Scam calls (blocked)
    ('call_001', 'user_sarah_123', 'CA001_irs_scam', '+15551111111', 'scam', 0.95, 'blocked', 15, NOW() - INTERVAL '2 days'),
    ('call_002', 'user_sarah_123', 'CA002_tech_scam', '+15552222222', 'scam', 0.92, 'blocked', 22, NOW() - INTERVAL '3 days'),
    ('call_003', 'user_sarah_123', 'CA003_social_scam', '+15553333333', 'scam', 0.88, 'blocked', 18, NOW() - INTERVAL '5 days'),
    ('call_004', 'user_sarah_123', 'CA004_warrant_scam', '+15554444444', 'scam', 0.97, 'blocked', 12, NOW() - INTERVAL '7 days'),

    -- Sales calls (screened)
    ('call_005', 'user_sarah_123', 'CA005_insurance', '+15555555556', 'sales', 0.15, 'screened', 45, NOW() - INTERVAL '1 day'),
    ('call_006', 'user_sarah_123', 'CA006_solar_panels', '+15555555557', 'sales', 0.10, 'screened', 60, NOW() - INTERVAL '4 days'),
    ('call_007', 'user_sarah_123', 'CA007_credit_card', '+15555555558', 'sales', 0.25, 'blocked', 30, NOW() - INTERVAL '6 days'),

    -- Legitimate calls (passed through)
    ('call_008', 'user_sarah_123', 'CA008_mom', '+15555555551', 'friend', 0.02, 'passed', 180, NOW() - INTERVAL '1 day'),
    ('call_009', 'user_sarah_123', 'CA009_doctor', '+15555555553', 'appointment', 0.05, 'passed', 90, NOW() - INTERVAL '2 days'),
    ('call_010', 'user_sarah_123', 'CA010_boss', '+15555555555', 'friend', 0.01, 'passed', 240, NOW() - INTERVAL '3 days'),

    -- John's calls
    ('call_101', 'user_john_456', 'CA101_warranty_scam', '+15556666664', 'scam', 0.90, 'blocked', 20, NOW() - INTERVAL '1 day'),
    ('call_102', 'user_john_456', 'CA102_wife', '+15556666661', 'friend', 0.00, 'passed', 300, NOW() - INTERVAL '2 days'),
    ('call_103', 'user_john_456', 'CA103_accountant', '+15556666663', 'appointment', 0.03, 'passed', 120, NOW() - INTERVAL '3 days'),

    -- Demo calls
    ('call_201', 'user_demo_789', 'CA201_demo_scam', '+15557777773', 'scam', 0.85, 'blocked', 10, NOW()),
    ('call_202', 'user_demo_789', 'CA202_demo_sales', '+15557777774', 'sales', 0.20, 'screened', 35, NOW())
ON CONFLICT (id) DO NOTHING;


-- ======================
-- CALL TRANSCRIPTS
-- ======================

INSERT INTO call_transcripts (id, call_id, transcript, created_at)
VALUES
    -- IRS Scam
    (
        'transcript_001',
        'call_001',
        'Hello, this is the Internal Revenue Service calling about your unpaid taxes. We have issued a warrant for your arrest. You must call us back immediately at this number to resolve this matter, or the police will be at your door within 24 hours. This is your final warning.',
        NOW() - INTERVAL '2 days'
    ),

    -- Tech Support Scam
    (
        'transcript_002',
        'call_002',
        'Hello, this is Microsoft support. We have detected a virus on your computer that is sending your personal information to hackers. We need to remote access your computer immediately to fix this critical security issue. Please provide your credit card for a one-time security fee of $299.',
        NOW() - INTERVAL '3 days'
    ),

    -- Social Security Scam
    (
        'transcript_003',
        'call_003',
        'This is the Social Security Administration. Your social security number has been suspended due to suspicious activity. Press 1 immediately to speak with an officer, or your benefits will be terminated permanently.',
        NOW() - INTERVAL '5 days'
    ),

    -- Warrant Scam
    (
        'transcript_004',
        'call_004',
        'This is Officer Johnson from the county sheriff. There is an active arrest warrant for you. You missed your court date. You need to pay $5,000 in bail immediately or we will come to arrest you. Do not hang up this call.',
        NOW() - INTERVAL '7 days'
    ),

    -- Insurance Sales (Legitimate)
    (
        'transcript_005',
        'call_005',
        'Hello, my name is Jennifer from State Farm Insurance. I'm calling to see if you would be interested in reviewing your current insurance coverage. We have some new plans that might save you money. Would you have a few minutes to discuss your options?',
        NOW() - INTERVAL '1 day'
    ),

    -- Mom (Legitimate)
    (
        'transcript_008',
        'call_008',
        'Hi honey, it's mom! I wanted to check in and see how you're doing. Are you free for dinner this Sunday? Dad and I would love to see you.',
        NOW() - INTERVAL '1 day'
    ),

    -- Doctor Appointment (Legitimate)
    (
        'transcript_009',
        'call_009',
        'Hello, this is Dr. Smith's office calling to confirm your appointment tomorrow at 2 PM. Please call us back if you need to reschedule. Thank you.',
        NOW() - INTERVAL '2 days'
    )
ON CONFLICT (id) DO NOTHING;


-- ======================
-- SCAM REPORTS
-- ======================

INSERT INTO scam_reports (id, call_id, scam_type, red_flags, confidence, created_at)
VALUES
    (
        'scam_001',
        'call_001',
        'irs',
        ARRAY['irs', 'warrant', 'arrest', 'immediate payment', 'urgency', 'threat'],
        0.95,
        NOW() - INTERVAL '2 days'
    ),

    (
        'scam_002',
        'call_002',
        'tech_support',
        ARRAY['microsoft support', 'virus', 'remote access', 'credit card', 'urgent'],
        0.92,
        NOW() - INTERVAL '3 days'
    ),

    (
        'scam_003',
        'call_003',
        'social_security',
        ARRAY['social security suspended', 'benefits terminated', 'press 1', 'urgency'],
        0.88,
        NOW() - INTERVAL '5 days'
    ),

    (
        'scam_004',
        'call_004',
        'warrant',
        ARRAY['arrest warrant', 'sheriff', 'bail', 'immediate payment', 'threat'],
        0.97,
        NOW() - INTERVAL '7 days'
    ),

    (
        'scam_101',
        'call_101',
        'warranty',
        ARRAY['car warranty', 'expires soon', 'final notice', 'urgency'],
        0.90,
        NOW() - INTERVAL '1 day'
    )
ON CONFLICT (id) DO NOTHING;


-- ======================
-- CALL ANALYTICS
-- ======================

INSERT INTO call_analytics (id, user_id, date, total_calls, scams_blocked, time_saved_minutes, created_at)
VALUES
    -- Sarah's analytics (last 30 days)
    ('analytics_001', 'user_sarah_123', CURRENT_DATE - INTERVAL '29 days', 2, 0, 0, NOW() - INTERVAL '29 days'),
    ('analytics_002', 'user_sarah_123', CURRENT_DATE - INTERVAL '28 days', 3, 1, 23, NOW() - INTERVAL '28 days'),
    ('analytics_003', 'user_sarah_123', CURRENT_DATE - INTERVAL '27 days', 1, 0, 0, NOW() - INTERVAL '27 days'),
    ('analytics_004', 'user_sarah_123', CURRENT_DATE - INTERVAL '7 days', 4, 1, 15, NOW() - INTERVAL '7 days'),
    ('analytics_005', 'user_sarah_123', CURRENT_DATE - INTERVAL '5 days', 3, 1, 18, NOW() - INTERVAL '5 days'),
    ('analytics_006', 'user_sarah_123', CURRENT_DATE - INTERVAL '3 days', 2, 1, 22, NOW() - INTERVAL '3 days'),
    ('analytics_007', 'user_sarah_123', CURRENT_DATE - INTERVAL '2 days', 5, 1, 15, NOW() - INTERVAL '2 days'),
    ('analytics_008', 'user_sarah_123', CURRENT_DATE - INTERVAL '1 day', 3, 0, 45, NOW() - INTERVAL '1 day'),
    ('analytics_009', 'user_sarah_123', CURRENT_DATE, 2, 0, 30, NOW()),

    -- John's analytics
    ('analytics_101', 'user_john_456', CURRENT_DATE - INTERVAL '3 days', 1, 0, 0, NOW() - INTERVAL '3 days'),
    ('analytics_102', 'user_john_456', CURRENT_DATE - INTERVAL '2 days', 2, 0, 0, NOW() - INTERVAL '2 days'),
    ('analytics_103', 'user_john_456', CURRENT_DATE - INTERVAL '1 day', 3, 1, 20, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;


-- ======================
-- AGGREGATE STATS
-- ======================

-- Verify data
SELECT 'Users created:', COUNT(*) FROM users;
SELECT 'Contacts created:', COUNT(*) FROM contacts;
SELECT 'Calls logged:', COUNT(*) FROM calls;
SELECT 'Transcripts saved:', COUNT(*) FROM call_transcripts;
SELECT 'Scams detected:', COUNT(*) FROM scam_reports;
SELECT 'Analytics entries:', COUNT(*) FROM call_analytics;

-- Summary stats
SELECT
    'Total scams blocked:' AS metric,
    COUNT(*) AS value
FROM calls
WHERE action_taken = 'blocked' AND scam_score > 0.85;

SELECT
    'Average scam score:' AS metric,
    ROUND(AVG(scam_score)::numeric, 2) AS value
FROM calls
WHERE intent = 'scam';

SELECT
    'Total time saved (minutes):' AS metric,
    SUM(time_saved_minutes) AS value
FROM call_analytics;
