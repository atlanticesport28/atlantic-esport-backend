-- Enable RLS
-- TABLES

-- Profiles Table (Extends Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  country TEXT,
  points INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_rate DECIMAL DEFAULT 0,
  stream_url TEXT,
  role TEXT DEFAULT 'player' CHECK (role IN ('player', 'organizer', 'country_admin', 'continental_admin', 'super_admin')),
  role_level INTEGER DEFAULT 1,
  continent TEXT,
  country TEXT,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tournaments Table
CREATE TABLE tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  banner_url TEXT,
  organizer_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  max_players INTEGER NOT NULL,
  type TEXT CHECK (type IN ('public', 'private')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tournament Players (Joining)
CREATE TABLE tournament_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(tournament_id, user_id)
);

-- Matches Table
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_a UUID REFERENCES profiles(id),
  player_b UUID REFERENCES profiles(id),
  score_a INTEGER,
  score_b INTEGER,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'pending', 'finished', 'disputed')),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  round INTEGER DEFAULT 1,
  live_url TEXT,
  embed_url TEXT,
  winner_id UUID REFERENCES profiles(id),
  validated_by_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Match Proofs (Submissions)
CREATE TABLE match_proofs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  score_submitted JSONB, -- { score_a: X, score_b: Y }
  screenshot_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(match_id, user_id)
);

-- Chat Messages
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Teams Table
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  tag TEXT UNIQUE NOT NULL,
  captain_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Team Members
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('captain', 'member')),
  UNIQUE(team_id, user_id)
);

-- Team Battles
CREATE TABLE team_battles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_a UUID REFERENCES teams(id),
  team_b UUID REFERENCES teams(id),
  tournament_id UUID REFERENCES tournaments(id),
  status TEXT CHECK (status IN ('upcoming', 'live', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Team Matches (The 3 matches in a battle)
CREATE TABLE team_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_battle_id UUID REFERENCES team_battles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'upcoming',
  score_a INTEGER,
  score_b INTEGER
);

-- Leaderboard (Can be a view or a table updated via triggers)
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  id as user_id,
  points,
  wins,
  country,
  RANK() OVER (ORDER BY points DESC) as rank
FROM profiles;

-- TRIGGER: Create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role TEXT := 'player';
    default_level INTEGER := 1;
    default_perms TEXT[] := '{}';
    user_count INTEGER;
BEGIN
  -- Check if this is the first user
  SELECT count(*) INTO user_count FROM public.profiles;

  IF user_count = 0 THEN
    -- First user becomes Super Admin
    default_role := 'super_admin';
    default_level := 5;
    default_perms := ARRAY['create_tournament', 'start_tournament', 'view_dashboard', 'manage_users', 'manage_region', 'view_analytics', 'ban_user'];
  ELSE
    -- Set defaults based on metadata role if provided, else 'player'
    IF (new.raw_user_meta_data->>'role') = 'organizer' THEN
      default_role := 'organizer';
      default_level := 2;
      default_perms := ARRAY['create_tournament', 'start_tournament', 'view_dashboard'];
    ELSIF (new.raw_user_meta_data->>'role') = 'country_admin' THEN
      default_role := 'country_admin';
      default_level := 3;
      default_perms := ARRAY['create_tournament', 'start_tournament', 'view_dashboard', 'manage_users', 'manage_region'];
    ELSIF (new.raw_user_meta_data->>'role') = 'continental_admin' THEN
      default_role := 'continental_admin';
      default_level := 4;
      default_perms := ARRAY['create_tournament', 'start_tournament', 'view_dashboard', 'manage_users', 'manage_region', 'view_analytics'];
    ELSIF (new.raw_user_meta_data->>'role') = 'super_admin' THEN
      -- Optional: Prevent others from signing up as super_admin via metadata
      default_role := 'player';
      default_level := 1;
      default_perms := '{}';
    END IF;
  END IF;

  INSERT INTO public.profiles (id, username, avatar_url, role, role_level, continent, country, permissions)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username', 
    new.raw_user_meta_data->>'avatar_url', 
    default_role,
    default_level,
    new.raw_user_meta_data->>'continent',
    new.raw_user_meta_data->>'country',
    default_perms
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
