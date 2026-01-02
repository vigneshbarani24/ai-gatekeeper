# AI Gatekeeper - Supabase Database Setup

## Step 1: Create Tables

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `htmodjahzirxhbzbzcrb`
3. Go to **SQL Editor**
4. Run the schema file: `backend/database/schema.sql`
5. Then run the seed data: `backend/database/seed_data.sql`

## Step 2: Get Service Role Key

You need the **service_role** key (not the anon key) for the backend.

1. Go to **Settings** → **API**
2. Copy the `service_role` key (secret)
3. Update `backend/.env`:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 3: Test Connection

Run this to test:

```bash
cd backend
python -c "from app.services.database import db_service; import asyncio; asyncio.run(db_service.test_connection())"
```

## Quick SQL Commands

### Check if tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Count records:
```sql
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM calls) as calls,
  (SELECT COUNT(*) FROM contacts) as contacts;
```

### View recent calls:
```sql
SELECT * FROM calls ORDER BY started_at DESC LIMIT 10;
```
