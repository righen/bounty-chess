-- Bounty Chess Tournament Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PLAYERS TABLE
CREATE TABLE players (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  birthdate TEXT,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
  current_address TEXT,
  meal TEXT,
  bounty INTEGER NOT NULL DEFAULT 20,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  has_sheriff_badge BOOLEAN NOT NULL DEFAULT true,
  criminal_status TEXT NOT NULL DEFAULT 'normal' CHECK (criminal_status IN ('normal', 'angry', 'mad')),
  opponent_ids INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TOURNAMENT TABLE (singleton - only one row)
CREATE TABLE tournament (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  current_round INTEGER NOT NULL DEFAULT 0,
  total_rounds INTEGER NOT NULL DEFAULT 9,
  tournament_started BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial tournament state
INSERT INTO tournament (id, current_round, total_rounds, tournament_started)
VALUES ('00000000-0000-0000-0000-000000000001', 0, 9, false);

-- 3. ROUNDS TABLE
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_number INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. GAMES TABLE
CREATE TABLE games (
  id TEXT PRIMARY KEY,
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  white_player_id INTEGER NOT NULL,
  black_player_id INTEGER NOT NULL, -- 0 for BYE
  white_sheriff_used BOOLEAN NOT NULL DEFAULT false,
  black_sheriff_used BOOLEAN NOT NULL DEFAULT false,
  result TEXT CHECK (result IN ('white', 'black', 'draw') OR result IS NULL),
  bounty_transferred INTEGER,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints for players (optional, since 0 is used for BYE)
-- We'll handle this in application logic instead

-- 5. INDEXES for performance
CREATE INDEX idx_games_round_id ON games(round_id);
CREATE INDEX idx_games_white_player ON games(white_player_id);
CREATE INDEX idx_games_black_player ON games(black_player_id);
CREATE INDEX idx_rounds_number ON rounds(round_number);

-- 6. ROW LEVEL SECURITY (RLS) - Allow public read/write for now
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated and anonymous users
CREATE POLICY "Enable all for anon" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON tournament FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON rounds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON games FOR ALL USING (true) WITH CHECK (true);

-- 7. TRIGGER for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournament_updated_at BEFORE UPDATE ON tournament
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rounds_updated_at BEFORE UPDATE ON rounds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Done! Your database is ready.

