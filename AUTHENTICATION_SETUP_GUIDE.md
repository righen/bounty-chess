# 🔐 Authentication Setup Guide

This guide will walk you through setting up the authentication system for the Bounty Chess Tournament application.

## 📋 Overview

The authentication system provides three levels of access:

1. **Public Access** (No login required)
   - View public leaderboard at `/public/leaderboard`
   - Real-time updates of tournament standings

2. **Arbiter Access** (Login required)
   - View leaderboard
   - View current round
   - **Input game results ONLY**
   - View prizes

3. **Admin Access** (Login required)
   - **Full access to all features**
   - Manage players
   - Start/end tournament rounds
   - Input game results
   - Import/export data
   - Reset tournament
   - Create/manage arbiter accounts

---

## 🚀 Step-by-Step Setup

### Step 1: Enable Email Authentication in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Ensure **Email** is enabled
5. (Optional) Configure email templates in **Authentication** → **Email Templates**

### Step 2: Run the Authentication Schema SQL

1. Open your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `supabase-auth-schema.sql`
5. Paste into the SQL Editor
6. Click **Run** or press `Ctrl+Enter`

This will:
- Create the `profiles` table for user roles
- Enable Row Level Security (RLS) on all tables
- Set up RLS policies for role-based access
- Create triggers for automatic profile creation
- Add indexes for performance

### Step 3: Create Your First Admin User

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter:
   - **Email**: Your admin email (e.g., `admin@b4chess.com`)
   - **Password**: Choose a secure password
   - **Auto Confirm User**: ✅ Check this box
4. Click **Create User**

5. Now, set this user as an admin:
   - Go to **SQL Editor**
   - Run this query (replace with your email):
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'admin@b4chess.com';
   ```

**Option B: Via Application (After deployment)**

1. Temporarily comment out the `<ProtectedRoute>` wrapper in `app/page.tsx`
2. Deploy the application
3. Visit `/login` and sign up with your admin credentials
4. Run the SQL query above to promote yourself to admin
5. Re-enable the `<ProtectedRoute>` wrapper

### Step 4: Test the Authentication System

1. **Test Login**:
   - Visit `/login`
   - Sign in with your admin credentials
   - Verify you're redirected to the dashboard

2. **Test Admin Access**:
   - Verify you can see all menu items in the sidebar
   - Verify you can access "Manage Players"
   - Verify you can see "Manage Users" option

3. **Test Public Leaderboard**:
   - Open an incognito/private browser window
   - Visit `/public/leaderboard`
   - Verify you can see the leaderboard without logging in
   - Verify real-time updates work

4. **Create an Arbiter Account**:
   - In the admin dashboard, click "Manage Users" in the sidebar
   - Click "Create Arbiter"
   - Fill in:
     - Email: `arbiter@example.com`
     - Password: `testpassword123`
     - Full Name: `Test Arbiter`
   - Click "Create Arbiter"

5. **Test Arbiter Access**:
   - Log out from admin account
   - Log in with arbiter credentials
   - Verify arbiter can only see:
     - Leaderboard
     - Current Round (for inputting results)
     - Prizes
   - Verify arbiter **cannot** see:
     - Manage Players
     - Import/Export Data
     - Reset Tournament
     - Manage Users

### Step 5: Environment Variables (Already configured)

Your `.env.local` should already have:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

These are the same variables used for the database connection.

---

## 📁 Files Created/Modified

### New Files:
- `supabase-auth-schema.sql` - Database schema for authentication
- `lib/auth-context.tsx` - Auth context and hooks
- `components/ClientLayout.tsx` - Auth provider wrapper
- `components/ProtectedRoute.tsx` - Route protection component
- `app/login/page.tsx` - Login page
- `app/public/leaderboard/page.tsx` - Public leaderboard
- `app/admin/users/page.tsx` - User management for admins

### Modified Files:
- `app/layout.tsx` - Added `ClientLayout` wrapper
- `app/page.tsx` - Added `ProtectedRoute` and role-based rendering
- `components/Sidebar.tsx` - Added role-based menu visibility and logout button
- `components/Leaderboard.tsx` - Added `isPublicView` prop

---

## 🔒 Security Features

### Row Level Security (RLS)
All database tables have RLS enabled with these policies:

**Players Table**:
- ✅ Anyone can READ (for public leaderboard)
- ✅ Only admins can INSERT/UPDATE/DELETE

**Rounds Table**:
- ✅ Anyone can READ
- ✅ Only admins can INSERT/UPDATE/DELETE

**Games Table**:
- ✅ Anyone can READ
- ✅ Admins can INSERT/UPDATE/DELETE
- ✅ Arbiters can UPDATE (for result input only)

**Profiles Table**:
- ✅ Users can read their own profile
- ✅ Only admins can view all profiles
- ✅ Only admins can create/update/delete profiles

### Client-Side Protection
- Routes protected by `ProtectedRoute` component
- Menu items hidden based on user role
- Actions disabled for non-authorized users

### Server-Side Protection
- Supabase RLS policies enforce permissions at database level
- Even if client-side protection is bypassed, database will reject unauthorized operations

---

## 🎯 Usage

### For Admins:

1. **Login**: Visit `/login` with admin credentials
2. **Manage Players**: Add, edit, delete players
3. **Run Tournament**: Start rounds, generate pairings
4. **Create Arbiters**: 
   - Click "Manage Users" in sidebar
   - Create arbiter accounts for tournament officials
5. **Monitor**: View real-time updates on leaderboard

### For Arbiters:

1. **Login**: Use credentials provided by admin
2. **Input Results**: 
   - Go to "Current Round"
   - Select game results (White win/Black win/Draw)
   - Click sheriff badge if used
   - Submit results
3. **View Progress**: Monitor leaderboard and prize standings

### For Public:

1. **No login required**
2. Visit `/public/leaderboard`
3. Share this URL with tournament participants
4. Leaderboard updates automatically in real-time

---

## 🐛 Troubleshooting

### Issue: "Email not confirmed" error
**Solution**: In Supabase Dashboard → Authentication → Settings, disable "Enable email confirmations" for development

### Issue: RLS policies not working
**Solution**: 
1. Check that you ran the `supabase-auth-schema.sql` file
2. Verify RLS is enabled: Run `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
3. Check policies: Run `SELECT * FROM pg_policies WHERE schemaname = 'public';`

### Issue: Can't create arbiter accounts
**Solution**: 
1. Verify your user's role is 'admin' in the profiles table
2. Check browser console for errors
3. Verify Supabase email auth is enabled

### Issue: Public leaderboard shows "Loading..."
**Solution**: 
1. Check browser console for errors
2. Verify RLS policies allow public READ access to players table
3. Test with: `SELECT * FROM players;` in SQL Editor (should work without auth)

---

## 📱 Mobile Access

The authentication system is fully mobile-responsive:
- Login page optimized for mobile devices
- Public leaderboard works on all screen sizes
- Protected routes work seamlessly on mobile browsers

---

## 🔄 Deployment Checklist

Before deploying to production:

- [ ] Run `supabase-auth-schema.sql` in production database
- [ ] Create admin user in production
- [ ] Test login with admin credentials
- [ ] Create at least one arbiter account for testing
- [ ] Test public leaderboard URL
- [ ] Verify all RLS policies are active
- [ ] Enable email confirmations in Supabase (production)
- [ ] Configure custom email templates (optional)
- [ ] Share public leaderboard URL with participants

---

## 🎉 You're Done!

Your Bounty Chess Tournament application now has a complete authentication system with:
- ✅ Secure role-based access control
- ✅ Public leaderboard for participants
- ✅ Admin dashboard for tournament management
- ✅ Arbiter accounts for result input
- ✅ Real-time updates across all views
- ✅ Row-level security in the database
- ✅ Mobile-responsive design

**Next step**: Test the entire flow and create your arbiter accounts!

