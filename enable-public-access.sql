-- Enable Public Access to Tournament Data
-- This allows the public leaderboard to display players, games, and pairings
-- Run this in Supabase SQL Editor

-- Enable RLS on all tables if not already enabled
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to avoid duplicates
DROP POLICY IF EXISTS "Public read access to players" ON players;
DROP POLICY IF EXISTS "Admins can insert players" ON players;
DROP POLICY IF EXISTS "Admins can update players" ON players;
DROP POLICY IF EXISTS "Admins can delete players" ON players;

DROP POLICY IF EXISTS "Public read access to games" ON games;
DROP POLICY IF EXISTS "Admins and arbiters can insert games" ON games;
DROP POLICY IF EXISTS "Admins and arbiters can update games" ON games;
DROP POLICY IF EXISTS "Admins can delete games" ON games;

DROP POLICY IF EXISTS "Public read access to rounds" ON rounds;
DROP POLICY IF EXISTS "Admins can manage rounds" ON rounds;

DROP POLICY IF EXISTS "Public read access to tournament" ON tournament;
DROP POLICY IF EXISTS "Admins can update tournament" ON tournament;
DROP POLICY IF EXISTS "Admins can insert tournament" ON tournament;

-- PLAYERS: Allow public SELECT, admins can INSERT/UPDATE/DELETE
CREATE POLICY "Public read access to players"
ON players FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can insert players" ON players
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update players" ON players
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete players" ON players
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- GAMES: Allow public SELECT, admins/arbiters can INSERT/UPDATE
CREATE POLICY "Public read access to games"
ON games FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins and arbiters can insert games" ON games
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'arbiter')
  )
);

CREATE POLICY "Admins and arbiters can update games" ON games
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'arbiter')
  )
);

CREATE POLICY "Admins can delete games" ON games
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ROUNDS: Allow public SELECT, admins can INSERT/UPDATE/DELETE
CREATE POLICY "Public read access to rounds"
ON rounds FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage rounds" ON rounds
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- TOURNAMENT: Allow public SELECT, admins can UPDATE
CREATE POLICY "Public read access to tournament"
ON tournament FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can update tournament" ON tournament
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can insert tournament" ON tournament
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Verify policies were created
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('players', 'games', 'rounds', 'tournament')
ORDER BY tablename, policyname;

