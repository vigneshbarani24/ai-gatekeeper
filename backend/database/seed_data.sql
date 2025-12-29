-- ===============================================
-- AI Gatekeeper - Seed Data
-- Matches frontend demo data for seamless testing
-- ===============================================

-- ======================
-- USERS (Demo Account)
-- ======================

-- Main demo user (matches frontend expectations)
INSERT INTO users (
    id,
    phone_number,
    name,
    email,
    elevenlabs_voice_id,
    twilio_phone_number,
    plan_tier,
    scam_detection_enabled,
    auto_pass_contacts,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '+15551234567',
    'Tom',
    'tom@example.com',
    'demo_voice_tom',
    '+15559876543',
    'premium',
    true,
    true,
    NOW() - INTERVAL '30 days'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    elevenlabs_voice_id = EXCLUDED.elevenlabs_voice_id;


-- ======================
-- CONTACTS (Whitelist)
-- ======================

INSERT INTO contacts (
    id,
    user_id,
    name,
    phone_number,
    relationship,
    priority,
    auto_pass,
    created_at
) VALUES
    -- Family
    (
        '10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        'Mom',
        '+15555551001',
        'family',
        10,
        true,
        NOW() - INTERVAL '30 days'
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001',
        'Dad',
        '+15555551002',
        'family',
        10,
        true,
        NOW() - INTERVAL '30 days'
    ),

    -- Friends
    (
        '10000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000001',
        'Sarah',
        '+15555551003',
        'friend',
        9,
        true,
        NOW() - INTERVAL '25 days'
    ),

    -- Professional
    (
        '10000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000001',
        'Dr. Smith''s Office',
        '+15555551004',
        'doctor',
        8,
        true,
        NOW() - INTERVAL '20 days'
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone_number = EXCLUDED.phone_number;


-- ======================
-- CALLS (Matches Frontend Demo Data)
-- ======================

INSERT INTO calls (
    id,
    user_id,
    caller_number,
    caller_name,
    call_sid,
    status,
    intent,
    scam_score,
    passed_through,
    started_at,
    ended_at,
    duration_seconds
) VALUES
    -- Call 1: Sarah (Friend) - 2 hours ago
    (
        '20000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        '+15555551003',
        'Sarah',
        'CA_demo_001',
        'ended',
        'friend',
        0.05,
        true,
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '2 hours' + INTERVAL '5 minutes',
        300
    ),

    -- Call 2: Unknown (IRS Scam) - 5 hours ago - BLOCKED
    (
        '20000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001',
        '+18005551234',
        'Unknown',
        'CA_demo_002',
        'blocked',
        'scam',
        0.95,
        false,
        NOW() - INTERVAL '5 hours',
        NOW() - INTERVAL '5 hours' + INTERVAL '15 seconds',
        15
    ),

    -- Call 3: Mom - 1 day ago
    (
        '20000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000001',
        '+15555551001',
        'Mom',
        'CA_demo_003',
        'ended',
        'friend',
        0.02,
        true,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day' + INTERVAL '8 minutes',
        480
    ),

    -- Call 4: Sales Call - 1 day ago - BLOCKED
    (
        '20000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000001',
        '+18885559999',
        'Unknown',
        'CA_demo_004',
        'blocked',
        'sales',
        0.35,
        false,
        NOW() - INTERVAL '1 day' - INTERVAL '3 hours',
        NOW() - INTERVAL '1 day' - INTERVAL '3 hours' + INTERVAL '45 seconds',
        45
    ),

    -- Call 5: Dr. Smith's Office (Appointment) - 2 days ago
    (
        '20000000-0000-0000-0000-000000000005',
        '00000000-0000-0000-0000-000000000001',
        '+15555551004',
        'Dr. Smith''s Office',
        'CA_demo_005',
        'ended',
        'appointment',
        0.08,
        true,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days' + INTERVAL '2 minutes',
        120
    ),

    -- Call 6: Unknown (Tech Support Scam) - 3 days ago - BLOCKED
    (
        '20000000-0000-0000-0000-000000000006',
        '00000000-0000-0000-0000-000000000001',
        '+18665554321',
        'Unknown',
        'CA_demo_006',
        'blocked',
        'scam',
        0.92,
        false,
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days' + INTERVAL '22 seconds',
        22
    ),

    -- Call 7: Dad - 3 days ago
    (
        '20000000-0000-0000-0000-000000000007',
        '00000000-0000-0000-0000-000000000001',
        '+15555551002',
        'Dad',
        'CA_demo_007',
        'ended',
        'friend',
        0.01,
        true,
        NOW() - INTERVAL '3 days' - INTERVAL '6 hours',
        NOW() - INTERVAL '3 days' - INTERVAL '6 hours' + INTERVAL '6 minutes',
        360
    ),

    -- Call 8: Delivery Driver - 4 days ago
    (
        '20000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0000-000000000001',
        '+15555559876',
        'Unknown',
        'CA_demo_008',
        'ended',
        'unknown',
        0.15,
        true,
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '4 days' + INTERVAL '1 minute',
        60
    )
ON CONFLICT (id) DO UPDATE SET
    caller_name = EXCLUDED.caller_name,
    status = EXCLUDED.status,
    intent = EXCLUDED.intent,
    scam_score = EXCLUDED.scam_score;


-- ======================
-- CALL TRANSCRIPTS
-- ======================

INSERT INTO call_transcripts (
    id,
    call_id,
    transcript,
    sentiment,
    summary,
    created_at
) VALUES
    -- Sarah (Friend) transcript
    (
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        'Hey Tom! It''s Sarah. I was just calling to see if you wanted to grab coffee this weekend. I know a great new place that opened downtown. Let me know when you''re free!',
        'positive',
        'Friend calling to make weekend plans for coffee',
        NOW() - INTERVAL '2 hours'
    ),

    -- IRS Scam transcript
    (
        '30000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000002',
        'This is the Internal Revenue Service. We have issued a warrant for your arrest due to unpaid taxes. You must call us back immediately at this number or the police will be dispatched to your location within 24 hours. This is your final warning.',
        'negative',
        'IRS impersonation scam with arrest threats',
        NOW() - INTERVAL '5 hours'
    ),

    -- Mom transcript
    (
        '30000000-0000-0000-0000-000000000003',
        '20000000-0000-0000-0000-000000000003',
        'Hi sweetheart, it''s Mom. I just wanted to check in and see how you''re doing. Your father and I would love to have you over for dinner this Sunday if you''re available. Call me back when you get a chance. Love you!',
        'positive',
        'Mother calling to check in and invite for dinner',
        NOW() - INTERVAL '1 day'
    ),

    -- Sales Call transcript
    (
        '30000000-0000-0000-0000-000000000004',
        '20000000-0000-0000-0000-000000000004',
        'Hello, I''m calling about your car''s extended warranty. This is your final opportunity to extend your coverage before it expires. Press 1 to speak with a representative or press 2 to be removed from our list.',
        'neutral',
        'Unsolicited car warranty sales call',
        NOW() - INTERVAL '1 day' - INTERVAL '3 hours'
    ),

    -- Dr. Smith's Office transcript
    (
        '30000000-0000-0000-0000-000000000005',
        '20000000-0000-0000-0000-000000000005',
        'Hello, this is Dr. Smith''s office calling to confirm your appointment scheduled for tomorrow at 2:30 PM. Please call us back at 555-1004 if you need to reschedule. Thank you.',
        'neutral',
        'Doctor''s office confirming appointment',
        NOW() - INTERVAL '2 days'
    ),

    -- Tech Support Scam transcript
    (
        '30000000-0000-0000-0000-000000000006',
        '20000000-0000-0000-0000-000000000006',
        'Hello, this is Microsoft technical support. We have detected a critical virus on your computer that is sending your personal information to hackers. We need immediate remote access to your computer to fix this security breach. Please stay on the line.',
        'negative',
        'Tech support scam impersonating Microsoft',
        NOW() - INTERVAL '3 days'
    ),

    -- Dad transcript
    (
        '30000000-0000-0000-0000-000000000007',
        '20000000-0000-0000-0000-000000000007',
        'Hey son, it''s Dad. I need your help with something on the computer when you get a chance. Nothing urgent, but when you have some time could you give me a call back? Thanks.',
        'positive',
        'Father requesting help with computer',
        NOW() - INTERVAL '3 days' - INTERVAL '6 hours'
    ),

    -- Delivery Driver transcript
    (
        '30000000-0000-0000-0000-000000000008',
        '20000000-0000-0000-0000-000000000008',
        'Hi, this is your delivery driver. I have a package for you but I can''t find your apartment number. Can you come down to the lobby? I''m in a white van.',
        'neutral',
        'Delivery driver requesting assistance',
        NOW() - INTERVAL '4 days'
    )
ON CONFLICT (call_id) DO UPDATE SET
    transcript = EXCLUDED.transcript,
    summary = EXCLUDED.summary;


-- ======================
-- SCAM REPORTS
-- ======================

INSERT INTO scam_reports (
    id,
    call_id,
    scam_type,
    confidence,
    pattern_matched,
    action_taken,
    reported_at
) VALUES
    -- IRS Scam report
    (
        '40000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000002',
        'irs',
        0.95,
        'IRS impersonation with arrest warrant threat and urgency tactics',
        'blocked',
        NOW() - INTERVAL '5 hours'
    ),

    -- Tech Support Scam report
    (
        '40000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000006',
        'tech_support',
        0.92,
        'Microsoft impersonation with virus threat and remote access request',
        'blocked',
        NOW() - INTERVAL '3 days'
    )
ON CONFLICT (id) DO UPDATE SET
    confidence = EXCLUDED.confidence,
    pattern_matched = EXCLUDED.pattern_matched;


-- ======================
-- CALL ANALYTICS (Last 30 days)
-- ======================

INSERT INTO call_analytics (
    id,
    user_id,
    date,
    total_calls,
    scams_blocked,
    sales_blocked,
    contacts_passed,
    unknown_screened,
    avg_call_duration_seconds,
    created_at
) VALUES
    -- Last 7 days of analytics
    (
        '50000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        CURRENT_DATE - INTERVAL '6 days',
        5,
        1,
        0,
        3,
        1,
        180,
        NOW() - INTERVAL '6 days'
    ),
    (
        '50000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001',
        CURRENT_DATE - INTERVAL '5 days',
        3,
        0,
        1,
        2,
        0,
        120,
        NOW() - INTERVAL '5 days'
    ),
    (
        '50000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000001',
        CURRENT_DATE - INTERVAL '4 days',
        7,
        2,
        1,
        3,
        1,
        90,
        NOW() - INTERVAL '4 days'
    ),
    (
        '50000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000001',
        CURRENT_DATE - INTERVAL '3 days',
        4,
        1,
        0,
        2,
        1,
        240,
        NOW() - INTERVAL '3 days'
    ),
    (
        '50000000-0000-0000-0000-000000000005',
        '00000000-0000-0000-0000-000000000001',
        CURRENT_DATE - INTERVAL '2 days',
        6,
        1,
        1,
        3,
        1,
        150,
        NOW() - INTERVAL '2 days'
    ),
    (
        '50000000-0000-0000-0000-000000000006',
        '00000000-0000-0000-0000-000000000001',
        CURRENT_DATE - INTERVAL '1 day',
        8,
        0,
        2,
        4,
        2,
        200,
        NOW() - INTERVAL '1 day'
    ),
    (
        '50000000-0000-0000-0000-000000000007',
        '00000000-0000-0000-0000-000000000001',
        CURRENT_DATE,
        2,
        1,
        1,
        0,
        0,
        45,
        NOW()
    )
ON CONFLICT (id) DO UPDATE SET
    total_calls = EXCLUDED.total_calls,
    scams_blocked = EXCLUDED.scams_blocked;


-- ======================
-- VERIFICATION QUERIES
-- ======================

-- Display seeded data counts
SELECT 'Users created:' AS info, COUNT(*)::text AS count FROM users;
SELECT 'Contacts created:' AS info, COUNT(*)::text AS count FROM contacts;
SELECT 'Calls logged:' AS info, COUNT(*)::text AS count FROM calls;
SELECT 'Transcripts saved:' AS info, COUNT(*)::text AS count FROM call_transcripts;
SELECT 'Scams detected:' AS info, COUNT(*)::text AS count FROM scam_reports;
SELECT 'Analytics entries:' AS info, COUNT(*)::text AS count FROM call_analytics;

-- Summary statistics
SELECT
    'Total scams blocked' AS metric,
    COUNT(*)::text AS value
FROM calls
WHERE intent = 'scam' AND status = 'blocked';

SELECT
    'Total sales blocked' AS metric,
    COUNT(*)::text AS value
FROM calls
WHERE intent = 'sales' AND status = 'blocked';

SELECT
    'Average scam score' AS metric,
    ROUND(AVG(scam_score)::numeric, 3)::text AS value
FROM calls
WHERE intent = 'scam';

SELECT
    'Total calls today' AS metric,
    COUNT(*)::text AS value
FROM calls
WHERE started_at >= CURRENT_DATE;

-- Display recent calls for verification
SELECT
    id,
    caller_name,
    intent,
    scam_score,
    status,
    started_at
FROM calls
ORDER BY started_at DESC
LIMIT 10;
