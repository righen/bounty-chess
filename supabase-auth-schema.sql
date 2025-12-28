-- ============================================
-- BOUNTY CHESS - AUTHENTICATION SCHEMA
-- ============================================
-- This file sets up the authentication system with role-based access control
-- Roles: admin (full access) | arbiter (can only input results)

-- ============================================
-- 1. Enable Row Level Security on existing tables
-- ============================================
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Create profiles table for user roles
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'arbiter')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. RLS Policies for profiles table
-- ============================================

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to insert new profiles (create arbiters)
CREATE POLICY "Admins can create profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to update profiles
CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 4. RLS Policies for players table
-- ============================================

-- Public: Anyone can read players (for public leaderboard)
CREATE POLICY "Anyone can view players"
  ON players FOR SELECT
  USING (true);

-- Admins: Full access to players
CREATE POLICY "Admins can manage players"
  ON players FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 5. RLS Policies for rounds table
-- ============================================

-- Public: Anyone can read rounds
CREATE POLICY "Anyone can view rounds"
  ON rounds FOR SELECT
  USING (true);

-- Admins: Full access to rounds
CREATE POLICY "Admins can manage rounds"
  ON rounds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 6. RLS Policies for games table
-- ============================================

-- Public: Anyone can read games
CREATE POLICY "Anyone can view games"
  ON games FOR SELECT
  USING (true);

-- Admins: Full access to games
CREATE POLICY "Admins can manage games"
  ON games FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Arbiters: Can only UPDATE game results (not insert or delete)
CREATE POLICY "Arbiters can update game results"
  ON games FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'arbiter')
    )
  );

-- ============================================
-- 7. Function to automatically create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'arbiter')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 8. Function to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS on_profile_updated ON profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 9. Create initial admin user (MANUAL STEP)
-- ============================================
-- After running this schema, you need to:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" and create your first admin with email/password
-- 3. Then run this query to set them as admin (replace EMAIL):
--
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@example.com';
--
-- OR create the first admin programmatically:
-- (You'll need to do this via Supabase Dashboard or API initially)

-- ============================================
-- 10. Indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Enable Email Auth in Supabase Dashboard > Authentication > Providers
-- 3. Create your first admin user in Supabase Dashboard
-- 4. Update the admin user's role to 'admin' in the profiles table

