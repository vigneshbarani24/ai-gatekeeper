# 🚀 Deployment Guide: AI Gatekeeper

## 1. Backend (Google Cloud Run)
**Status**: ✅ **REDEPLOYED & LIVE**
URL: `https://ai-gatekeeper-backend-707989164210.us-central1.run.app`

We updated the Gemini Service code (switched to `gemini-2.0-flash-exp`). **You MUST redeploy the backend** for these changes to take effect.

**Deploy Command:**
```bash
cd backend
gcloud run deploy ai-gatekeeper-backend --source . --platform managed --region us-central1 --allow-unauthenticated
```
(Adjust region/name if different)

---

## 2. Frontend (Vercel)
You can deploy the frontend directly to Vercel.

### Option A: Using Vercel CLI (Recommended)

1.  **Install Vercel CLI** (if not installed):
    ```bash
    npm i -g vercel
    ```

2.  **Deploy**:
    Run this command from the `frontend` directory:
    ```bash
    cd frontend
    vercel
    ```

3.  **Configure Environment Variables**:
    When asked about environment variables, ensure you add:
    *   `NEXT_PUBLIC_BACKEND_URL`: `https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app`
    *   `NEXT_PUBLIC_SUPABASE_URL`: (Your Supabase URL)
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)

### Option B: Using Vercel Dashboard (Git Integration)

1.  **Push your code** to GitHub.
2.  **Import Project** in Vercel Dashboard.
3.  **Select Directory**: `frontend`.
4.  **Add Environment Variables**:
    *   `NEXT_PUBLIC_BACKEND_URL` = `https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app`
    *   `NEXT_PUBLIC_SUPABASE_URL` = `...`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `...`
5.  **Deploy**.

---

## 3. Verification

Once deployed, visit your Vercel URL.
1.  Check the **Home Page Stats** (should load from Cloud Run DB).
2.  Go to **Dashboard** and verify the Orb connects (it might ask for microphone permissions).
3.  Check **Calls History**.

The system is now fully distributed! 🌍
