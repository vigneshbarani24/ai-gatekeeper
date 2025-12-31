-- AI Gatekeeper Database Schema
-- Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    elevenlabs_voice_id TEXT,
    twilio_phone_number TEXT UNIQUE,
    plan_tier TEXT DEFAULT 'free', -- free, premium, senior_protection
    scam_detection_enabled BOOLEAN DEFAULT true,
    auto_pass_contacts BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_users_twilio_number ON users(twilio_phone_number);
CREATE INDEX idx_users_phone_number ON users(phone_number);

-- ============================================================================
-- CONTACTS TABLE (Whitelist)
-- ============================================================================

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    relationship TEXT, -- friend, family, doctor, work
    priority INTEGER DEFAULT 5, -- 1-10 (10 = always pass through)
    auto_pass BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE(user_id, phone_number)
);

-- Indexes for fast whitelist checks
CREATE INDEX idx_contacts_user_phone ON contacts(user_id, phone_number);

-- ============================================================================
-- CALLS TABLE
-- ============================================================================

CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    caller_number TEXT NOT NULL,
    caller_name TEXT,
    call_sid TEXT UNIQUE NOT NULL, -- Twilio Call SID
    status TEXT NOT NULL, -- ringing, screening, passed_through, blocked, ended
    intent TEXT, -- friend, sales, appointment, scam, unknown
    scam_score FLOAT DEFAULT 0.0, -- 0.0-1.0
    passed_through BOOLEAN DEFAULT false,
    started_at TIMESTAMP DEFAULT now(),
    ended_at TIMESTAMP,
    duration_seconds INTEGER
);

-- Indexes for queries
CREATE INDEX idx_calls_user_started ON calls(user_id, started_at DESC);
CREATE INDEX idx_calls_caller_number ON calls(caller_number);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_calls_sid ON calls(call_sid);

-- ============================================================================
-- CALL TRANSCRIPTS TABLE
-- ============================================================================

CREATE TABLE call_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID REFERENCES calls(id) ON DELETE CASCADE UNIQUE,
    transcript TEXT NOT NULL,
    sentiment TEXT, -- positive, neutral, negative
    audio_url TEXT, -- Twilio recording URL
    summary TEXT, -- AI-generated summary
    created_at TIMESTAMP DEFAULT now()
);

-- Index for call lookups
CREATE INDEX idx_transcripts_call ON call_transcripts(call_id);

-- ============================================================================
-- SCAM REPORTS TABLE
-- ============================================================================

CREATE TABLE scam_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
    scam_type TEXT NOT NULL, -- irs, tech_support, grandparent, lottery, etc.
    confidence FLOAT NOT NULL, -- Vector similarity score
    pattern_matched TEXT, -- Which scam script matched
    action_taken TEXT, -- blocked, flagged, passed_with_warning
    reported_at TIMESTAMP DEFAULT now()
);

-- Indexes for analytics
CREATE INDEX idx_scam_reports_scam_type ON scam_reports(scam_type);
CREATE INDEX idx_scam_reports_confidence ON scam_reports(confidence);
CREATE INDEX idx_scam_reports_reported_at ON scam_reports(reported_at);

-- ============================================================================
-- CALL ANALYTICS TABLE (Aggregated Metrics)
-- ============================================================================

CREATE TABLE call_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_calls INTEGER DEFAULT 0,
    scams_blocked INTEGER DEFAULT 0,
    sales_blocked INTEGER DEFAULT 0,
    contacts_passed INTEGER DEFAULT 0,
    unknown_screened INTEGER DEFAULT 0,
    avg_call_duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(user_id, date)
);

-- Index for date range queries
CREATE INDEX idx_analytics_user_date ON call_analytics(user_id, date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY users_policy ON users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY contacts_policy ON contacts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY calls_policy ON calls
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY transcripts_policy ON call_transcripts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM calls
            WHERE calls.id = call_transcripts.call_id
            AND calls.user_id = auth.uid()
        )
    );

CREATE POLICY scam_reports_policy ON scam_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM calls
            WHERE calls.id = scam_reports.call_id
            AND calls.user_id = auth.uid()
        )
    );

CREATE POLICY analytics_policy ON call_analytics
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at for users
CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trigger: Auto-update updated_at for contacts
CREATE TRIGGER contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SEED DATA (Example)
-- ============================================================================

-- Example user (for testing)
INSERT INTO users (
    id,
    phone_number,
    name,
    email,
    twilio_phone_number,
    plan_tier
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '+15551234567',
    'Test User',
    'test@example.com',
    '+15559876543',
    'premium'
) ON CONFLICT DO NOTHING;

-- Example contacts
INSERT INTO contacts (user_id, name, phone_number, relationship, priority, auto_pass) VALUES
    ('00000000-0000-0000-0000-000000000001', 'John Smith', '+15555551111', 'friend', 10, true),
    ('00000000-0000-0000-0000-000000000001', 'Dr. Johnson', '+15555552222', 'doctor', 9, true),
    ('00000000-0000-0000-0000-000000000001', 'Mom', '+15555553333', 'family', 10, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VIEWS (For Analytics Dashboard)
-- ============================================================================

-- View: Recent calls summary
CREATE OR REPLACE VIEW recent_calls_summary AS
SELECT
    u.id as user_id,
    u.name as user_name,
    COUNT(c.id) as total_calls_today,
    COUNT(CASE WHEN c.status = 'blocked' THEN 1 END) as blocked_today,
    COUNT(CASE WHEN c.passed_through THEN 1 END) as passed_today,
    AVG(c.scam_score) as avg_scam_score
FROM users u
LEFT JOIN calls c ON u.id = c.user_id
    AND c.started_at >= CURRENT_DATE
GROUP BY u.id, u.name;

-- View: Top scam types
CREATE OR REPLACE VIEW top_scam_types AS
SELECT
    scam_type,
    COUNT(*) as count,
    AVG(confidence) as avg_confidence
FROM scam_reports
WHERE reported_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY scam_type
ORDER BY count DESC;

-- ============================================================================
-- GRANTS (For service role)
-- ============================================================================

-- Grant service role full access (backend uses service role key)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
