# 🔧 SUPABASE SETUP INSTRUCTIONS

## STEP 1: Get Your Supabase Credentials

1. Go to: https://supabase.com/dashboard
2. Click on your project (bounty-chess)
3. Go to: **Settings** ⚙️ → **API**

You'll see:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
Project API keys:
  - anon public: eyJhbGciOiJI...
  - service_role: eyJhbGciOiJI...
```

## STEP 2: Create Database Schema

1. In Supabase Dashboard, go to: **SQL Editor** (left sidebar)
2. Click: **+ New Query**
3. Copy the contents of `supabase-schema.sql` file
4. Paste into the SQL editor
5. Click **Run** (or press Ctrl+Enter)

You should see: "Success. No rows returned"

## STEP 3: Create Environment Variables File

Create a file called `.env.local` in the project root with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL_HERE
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

**Replace** `YOUR_PROJECT_URL_HERE` and `YOUR_ANON_KEY_HERE` with your actual values from Step 1.

**Example:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghij.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMjM0NTY3OCwiZXhwIjoxOTI3OTIxNjc4fQ.xxxxxxxxxxxxxxxxx
```

## STEP 4: Verify Setup

After I install the libraries and update the code, we'll test that everything connects properly.

---

**Once you have your credentials, paste them here and I'll set everything up!**




