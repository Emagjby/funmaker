-- FunMaker Platform Schema
-- Created by: GenchoXD
-- Version: 1.0
-- Description: Complete database schema for FunMaker platform

-- Create custom types for enums
CREATE TYPE event_status AS ENUM ('upcoming', 'live', 'completed', 'canceled');
CREATE TYPE team_type AS ENUM ('a', 'b', 'draw');
CREATE TYPE bet_status AS ENUM ('pending', 'won', 'lost', 'voided');
CREATE TYPE transaction_type AS ENUM ('bet_placed', 'bet_won', 'bet_lost', 'bet_voided', 'bonus', 'adjustment');

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
-- Stores user information and points balance
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID NOT NULL UNIQUE,  -- Links to Supabase auth.users table
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    points_balance INTEGER NOT NULL DEFAULT 1000,
    profile_image_url TEXT, -- Added for user profiles
    last_login_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events Table
-- Stores betting events information
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT, -- Sport, eSport, Politics, etc.
    image_url TEXT, -- Event image
    team_a TEXT NOT NULL,
    team_b TEXT NOT NULL,
    team_a_score INTEGER, -- Current score for live events
    team_b_score INTEGER, -- Current score for live events 
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE, -- For homepage features
    status event_status NOT NULL DEFAULT 'upcoming',
    initial_odds_a DECIMAL NOT NULL,
    initial_odds_b DECIMAL NOT NULL,
    current_odds_a DECIMAL NOT NULL,
    current_odds_b DECIMAL NOT NULL,
    total_bets_a INTEGER NOT NULL DEFAULT 0,
    total_bets_b INTEGER NOT NULL DEFAULT 0,
    winner team_type,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Validation constraints
    CONSTRAINT valid_start_time CHECK (start_time < end_time),
    CONSTRAINT valid_odds_a CHECK (initial_odds_a > 1.0 AND current_odds_a > 1.0),
    CONSTRAINT valid_odds_b CHECK (initial_odds_b > 1.0 AND current_odds_b > 1.0)
);

-- Bets Table
-- Stores individual user bets
CREATE TABLE IF NOT EXISTS bets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    event_id UUID NOT NULL REFERENCES events(id),
    team team_type NOT NULL,
    amount INTEGER NOT NULL,
    odds_at_placement DECIMAL NOT NULL,
    potential_payout DECIMAL NOT NULL,
    status bet_status NOT NULL DEFAULT 'pending',
    settled_at TIMESTAMPTZ, -- When the bet was settled
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Validation constraints
    CONSTRAINT valid_amount CHECK (amount > 0),
    CONSTRAINT valid_odds CHECK (odds_at_placement > 1.0),
    CONSTRAINT valid_payout CHECK (potential_payout > amount)
);

-- Transactions Table
-- Tracks all point transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,
    type transaction_type NOT NULL,
    reference_id UUID REFERENCES bets(id),
    description TEXT, -- Added for transaction details
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Validation constraints
    CONSTRAINT valid_transaction_amount CHECK (amount != 0)
);

-- Admin roles table
-- Manages user roles for the platform
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id), -- Track who assigned the role
    
    CONSTRAINT unique_user_role UNIQUE(user_id, role)
);

-- Create indexes for better performance
CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_event_id ON bets(event_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_active_events ON events(id) WHERE status IN ('upcoming', 'live');
CREATE INDEX idx_featured_events ON events(is_featured) WHERE is_featured = TRUE;

--
-- Functions and Triggers
--

-- Function to calculate odds based on betting patterns
-- This is the secret sauce of our platform!
CREATE OR REPLACE FUNCTION calculate_odds(event_id UUID)
RETURNS VOID AS $$
DECLARE
  total_a INTEGER;
  total_b INTEGER;
  total_bets INTEGER;
  implied_prob_a DECIMAL;
  implied_prob_b DECIMAL;
  fair_odds_a DECIMAL;
  fair_odds_b DECIMAL;
  margin DECIMAL := 0.05; -- 5% house edge - might tweak this later
  adjusted_prob_a DECIMAL;
  adjusted_prob_b DECIMAL;
  total_prob DECIMAL;
  final_odds_a DECIMAL;
  final_odds_b DECIMAL;
  min_odds DECIMAL := 1.05; -- Minimum odds allowed
  bet_volume INTEGER;
  smoothing_factor DECIMAL;
  e RECORD;
BEGIN
  -- Get the event details
  SELECT * INTO e FROM events WHERE id = event_id;
  
  -- Get total bets (we need these to calculate implied probabilities)
  total_a := e.total_bets_a;
  total_b := e.total_bets_b;
  total_bets := total_a + total_b;
  
  -- If no bets yet, just use the initial odds
  IF total_bets = 0 THEN
    UPDATE events 
    SET 
      current_odds_a = initial_odds_a,
      current_odds_b = initial_odds_b
    WHERE id = event_id;
    RETURN;
  END IF;
  
  -- Calculate implied probabilities from the betting volume
  implied_prob_a := total_a::decimal / total_bets::decimal;
  implied_prob_b := total_b::decimal / total_bets::decimal;
  
  -- Convert to fair odds (without house edge)
  fair_odds_a := CASE WHEN implied_prob_a = 0 THEN 50 ELSE 1 / implied_prob_a END;
  fair_odds_b := CASE WHEN implied_prob_b = 0 THEN 50 ELSE 1 / implied_prob_b END;
  
  -- Apply house margin
  -- TODO: Consider adjusting margin based on event popularity
  adjusted_prob_a := implied_prob_a * (1 + margin);
  adjusted_prob_b := implied_prob_b * (1 + margin);
  
  -- Normalize probabilities so they add up to 1 again
  total_prob := adjusted_prob_a + adjusted_prob_b;
  adjusted_prob_a := adjusted_prob_a / total_prob;
  adjusted_prob_b := adjusted_prob_b / total_prob;
  
  -- Convert back to odds format
  final_odds_a := CASE WHEN adjusted_prob_a = 0 THEN 50 ELSE 1 / adjusted_prob_a END;
  final_odds_b := CASE WHEN adjusted_prob_b = 0 THEN 50 ELSE 1 / adjusted_prob_b END;
  
  -- Apply minimum odds (never go below min_odds)
  final_odds_a := GREATEST(final_odds_a, min_odds);
  final_odds_b := GREATEST(final_odds_b, min_odds);
  
  -- Gradual transition from initial odds to calculated odds based on bet volume
  -- This makes changes smoother with low bet volumes
  bet_volume := LEAST(total_bets, 10000); -- Cap at 10,000 for max influence
  smoothing_factor := LEAST(bet_volume::decimal / 10000, 1); -- 0-1 scale
  
  final_odds_a := ((1 - smoothing_factor) * e.initial_odds_a) + (smoothing_factor * final_odds_a);
  final_odds_b := ((1 - smoothing_factor) * e.initial_odds_b) + (smoothing_factor * final_odds_b);
  
  -- Round to 2 decimal places for display
  final_odds_a := ROUND(final_odds_a::numeric, 2);
  final_odds_b := ROUND(final_odds_b::numeric, 2);
  
  -- Update event with new odds
  UPDATE events
  SET
    current_odds_a = final_odds_a,
    current_odds_b = final_odds_b,
    updated_at = NOW()
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to recalculate odds when a bet is placed
CREATE OR REPLACE FUNCTION trigger_calculate_odds()
RETURNS TRIGGER AS $$
BEGIN
  -- We should consider adding a delay here in the future if this becomes too
  -- resource-intensive in production. Could batch odds calculations.
  PERFORM calculate_odds(NEW.event_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for bet placement
CREATE TRIGGER on_bet_placed
AFTER INSERT ON bets
FOR EACH ROW
EXECUTE FUNCTION trigger_calculate_odds();

-- Function to settle bets when an event is completed
-- This is where we pay out winnings or mark bets as lost
CREATE OR REPLACE FUNCTION settle_bets(event_id UUID, winner team_type)
RETURNS VOID AS $$
DECLARE
  bet RECORD;
  settlement_time TIMESTAMPTZ := NOW();
BEGIN
  -- Update event status and winner
  UPDATE events
  SET 
    status = 'completed',
    winner = settle_bets.winner,
    updated_at = settlement_time
  WHERE id = event_id AND status != 'completed';
  
  -- Process each pending bet for this event
  FOR bet IN 
    SELECT * FROM bets 
    WHERE event_id = settle_bets.event_id AND status = 'pending'
  LOOP
    IF winner = 'draw' THEN
      -- If it's a draw, void all bets and refund
      UPDATE bets 
      SET 
        status = 'voided',
        settled_at = settlement_time,
        updated_at = settlement_time
      WHERE id = bet.id;
      
      -- Create refund transaction
      INSERT INTO transactions (
        user_id, 
        amount, 
        type, 
        reference_id,
        description
      ) VALUES (
        bet.user_id, 
        bet.amount, 
        'bet_voided', 
        bet.id,
        'Bet voided due to draw result'
      );
      
      -- Refund the user
      UPDATE users
      SET points_balance = points_balance + bet.amount
      WHERE id = bet.user_id;
      
    ELSIF bet.team = winner THEN
      -- Winning bet
      UPDATE bets 
      SET 
        status = 'won',
        settled_at = settlement_time,
        updated_at = settlement_time
      WHERE id = bet.id;
      
      -- Create winning transaction
      INSERT INTO transactions (
        user_id, 
        amount, 
        type, 
        reference_id,
        description
      ) VALUES (
        bet.user_id, 
        bet.potential_payout, 
        'bet_won', 
        bet.id,
        format('Won bet on %s with odds %s', bet.team, bet.odds_at_placement)
      );
      
      -- Update user balance with winnings
      UPDATE users
      SET 
        points_balance = points_balance + bet.potential_payout,
        updated_at = settlement_time
      WHERE id = bet.user_id;
      
    ELSE
      -- Losing bet
      UPDATE bets 
      SET 
        status = 'lost',
        settled_at = settlement_time,
        updated_at = settlement_time
      WHERE id = bet.id;
      
      -- Create loss transaction record (amount 0 since no payout)
      INSERT INTO transactions (
        user_id, 
        amount, 
        type, 
        reference_id,
        description
      ) VALUES (
        bet.user_id, 
        0, 
        'bet_lost', 
        bet.id,
        format('Lost bet on %s', bet.team)
      );
    END IF;
  END LOOP;
  
  -- Refresh the leaderboard to reflect new standings
  PERFORM refresh_leaderboard();
END;
$$ LANGUAGE plpgsql;

-- Trigger function for event completion to automatically settle bets
CREATE OR REPLACE FUNCTION trigger_settle_bets()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM settle_bets(NEW.id, NEW.winner);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for event completion
CREATE TRIGGER on_event_completed
AFTER UPDATE ON events
FOR EACH ROW
WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
EXECUTE FUNCTION trigger_settle_bets();

-- Function to create a user record when a new auth user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (auth_id, email, username, points_balance, is_active, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(gen_random_uuid()::text, 1, 8)),
    1000, -- Starting balance
    TRUE,
    NOW()
  );
  
  -- Log the transaction for the initial points
  INSERT INTO transactions (
    user_id,
    amount,
    type,
    description
  ) VALUES (
    (SELECT id FROM users WHERE auth_id = NEW.id),
    1000,
    'bonus',
    'Welcome bonus'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: The trigger for this function needs to be added manually in the Supabase dashboard
-- as it requires access to the auth schema which may not be available in SQL migrations
--
-- In SQL Editor, run:
-- CREATE TRIGGER on_auth_user_created
-- AFTER INSERT ON auth.users
-- FOR EACH ROW
-- EXECUTE FUNCTION handle_new_user();

--
-- Row Level Security Policies
--

-- First enable RLS on all tables
-- This ensures no access until we explicitly grant it
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- User policies
-- Let users read only their own records
CREATE POLICY user_read_own ON users
  FOR SELECT USING (auth.uid() = auth_id);

-- Let users update only their own records, except certain fields
CREATE POLICY user_update_own ON users
  FOR UPDATE 
  USING (
    auth.uid() = auth_id
    -- TODO: Add row-level logic to prevent updating points_balance,
    -- this should only happen through the bet settlement process
  );

-- Event policies
-- Everyone can view events (they're public)
CREATE POLICY event_read_all ON events
  FOR SELECT USING (true);

-- Only admins can create events
CREATE POLICY event_create_admin ON events
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT auth_id FROM users WHERE id IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  ));

-- Only admins can update events
CREATE POLICY event_update_admin ON events
  FOR UPDATE USING (auth.uid() IN (
    SELECT auth_id FROM users WHERE id IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  ));

-- Bet policies
-- Users can view their own bets
CREATE POLICY bet_read_own ON bets
  FOR SELECT USING (user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

-- Admins can view all bets
CREATE POLICY bet_read_all_for_admin ON bets
  FOR SELECT USING (auth.uid() IN (
    SELECT auth_id FROM users WHERE id IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  ));

-- Users can create bets for themselves
-- We'll verify they have sufficient balance in the API layer
CREATE POLICY bet_create_own ON bets
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

-- Transaction policies
-- Users can view their own transactions 
CREATE POLICY transaction_read_own ON transactions
  FOR SELECT USING (user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

-- Admins can view all transactions
CREATE POLICY transaction_read_all_for_admin ON transactions
  FOR SELECT USING (auth.uid() IN (
    SELECT auth_id FROM users WHERE id IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  ));

-- User roles policies
-- Only admins can view roles
CREATE POLICY user_roles_read_admin ON user_roles
  FOR SELECT USING (auth.uid() IN (
    SELECT auth_id FROM users WHERE id IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  ));

-- Only admins can modify roles
CREATE POLICY user_roles_modify_admin ON user_roles
  FOR ALL USING (auth.uid() IN (
    SELECT auth_id FROM users WHERE id IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  ));

--
-- Leaderboard View
--

-- Using a materialized view for performance reasons
-- This is much faster than calculating this on the fly each time
CREATE MATERIALIZED VIEW IF NOT EXISTS user_leaderboard AS
SELECT 
  u.id,
  u.username,
  u.points_balance,
  u.profile_image_url,  -- Include profile image for the leaderboard UI
  COUNT(b.id) AS total_bets,
  SUM(CASE WHEN b.status = 'won' THEN 1 ELSE 0 END) AS total_wins,
  SUM(CASE WHEN b.status = 'lost' THEN 1 ELSE 0 END) AS total_losses,
  -- Win percentage calculation - avoid division by zero
  CASE 
    WHEN COUNT(b.id) > 0 THEN 
      ROUND((SUM(CASE WHEN b.status = 'won' THEN 1 ELSE 0 END)::decimal / COUNT(b.id)::decimal) * 100, 2)
    ELSE 0
  END AS win_percentage,
  -- Total points won
  COALESCE(SUM(CASE WHEN b.status = 'won' THEN b.potential_payout ELSE 0 END), 0) AS total_points_won,
  -- Calculate a rough betting skill factor (this is our 'secret sauce' for rankings)
  -- Higher values = better betting skill
  CASE
    WHEN COUNT(b.id) >= 10 THEN  -- Only meaningful with enough bets
      (COALESCE(SUM(CASE WHEN b.status = 'won' THEN b.potential_payout - b.amount ELSE 0 END), 0) / 
      GREATEST(SUM(b.amount), 1))
    ELSE 0
  END AS betting_skill
FROM users u
LEFT JOIN bets b ON u.id = b.user_id AND b.status IN ('won', 'lost')
WHERE u.is_active = TRUE  -- Only show active users
GROUP BY u.id, u.username, u.points_balance, u.profile_image_url
ORDER BY points_balance DESC, win_percentage DESC, total_wins DESC;

-- Function to refresh the leaderboard materialized view
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS VOID AS $$
BEGIN
  -- TODO: Consider adding locking for high-concurrency environments
  REFRESH MATERIALIZED VIEW user_leaderboard;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for leaderboard view for faster sorting/filtering
CREATE INDEX idx_leaderboard_points ON user_leaderboard(points_balance DESC);
CREATE INDEX idx_leaderboard_win_rate ON user_leaderboard(win_percentage DESC);
CREATE INDEX idx_leaderboard_skill ON user_leaderboard(betting_skill DESC); 