-- Drop existing tables if they exist
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS bets;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  points_balance INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  team_a TEXT NOT NULL,
  team_b TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'live', 'completed', 'canceled')),
  initial_odds_a DECIMAL NOT NULL,
  initial_odds_b DECIMAL NOT NULL,
  current_odds_a DECIMAL NOT NULL,
  current_odds_b DECIMAL NOT NULL,
  total_bets_a INTEGER NOT NULL DEFAULT 0,
  total_bets_b INTEGER NOT NULL DEFAULT 0,
  winner TEXT CHECK (winner IS NULL OR winner IN ('a', 'b', 'draw')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create bets table
CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  team TEXT NOT NULL CHECK (team IN ('a', 'b')),
  amount INTEGER NOT NULL,
  odds_at_placement DECIMAL NOT NULL,
  potential_payout DECIMAL NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'won', 'lost', 'voided')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bet_placed', 'bet_won', 'bet_lost', 'bonus', 'adjustment')),
  reference_id UUID REFERENCES bets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_event_id ON bets(event_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_events_status ON events(status);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bets_updated_at
BEFORE UPDATE ON bets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Create function to calculate odds
CREATE OR REPLACE FUNCTION calculate_odds(event_id UUID)
RETURNS VOID AS $$
DECLARE
  total_a INTEGER;
  total_b INTEGER;
  implied_prob_a DECIMAL;
  implied_prob_b DECIMAL;
  new_odds_a DECIMAL;
  new_odds_b DECIMAL;
  margin DECIMAL := 0.05; -- 5% margin
BEGIN
  -- Get total bets for each team
  SELECT total_bets_a, total_bets_b INTO total_a, total_b
  FROM events
  WHERE id = event_id;
  
  -- Calculate implied probabilities
  IF (total_a + total_b) = 0 THEN
    -- If no bets, use initial odds
    SELECT initial_odds_a, initial_odds_b INTO new_odds_a, new_odds_b
    FROM events
    WHERE id = event_id;
  ELSE
    -- Calculate implied probabilities based on betting volume
    implied_prob_a := total_a::DECIMAL / (total_a + total_b);
    implied_prob_b := total_b::DECIMAL / (total_a + total_b);
    
    -- Adjust for margin
    implied_prob_a := implied_prob_a * (1 + margin);
    implied_prob_b := implied_prob_b * (1 + margin);
    
    -- Convert to odds (ensure minimum of 1.01)
    new_odds_a := GREATEST(1 / implied_prob_a, 1.01);
    new_odds_b := GREATEST(1 / implied_prob_b, 1.01);
  END IF;
  
  -- Update the odds
  UPDATE events
  SET current_odds_a = new_odds_a,
      current_odds_b = new_odds_b
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to settle bets
CREATE OR REPLACE FUNCTION settle_bets(event_id UUID, winner TEXT)
RETURNS VOID AS $$
DECLARE
  bet_record RECORD;
BEGIN
  -- Update event winner
  UPDATE events
  SET winner = settle_bets.winner,
      status = 'completed'
  WHERE id = event_id;
  
  -- Process each bet for this event
  FOR bet_record IN 
    SELECT * FROM bets WHERE event_id = settle_bets.event_id AND status = 'pending'
  LOOP
    -- Determine if bet won or lost
    IF (bet_record.team = winner) THEN
      -- Bet won
      UPDATE bets
      SET status = 'won'
      WHERE id = bet_record.id;
      
      -- Add winnings to user balance
      UPDATE users
      SET points_balance = points_balance + bet_record.potential_payout
      WHERE id = bet_record.user_id;
      
      -- Record transaction
      INSERT INTO transactions (user_id, amount, type, reference_id)
      VALUES (bet_record.user_id, bet_record.potential_payout, 'bet_won', bet_record.id);
      
    ELSIF (winner IS NULL OR winner = 'draw') THEN
      -- Bet voided (event canceled or draw)
      UPDATE bets
      SET status = 'voided'
      WHERE id = bet_record.id;
      
      -- Return original bet amount
      UPDATE users
      SET points_balance = points_balance + bet_record.amount
      WHERE id = bet_record.user_id;
      
      -- Record transaction
      INSERT INTO transactions (user_id, amount, type, reference_id)
      VALUES (bet_record.user_id, bet_record.amount, 'bet_placed', bet_record.id);
      
    ELSE
      -- Bet lost
      UPDATE bets
      SET status = 'lost'
      WHERE id = bet_record.id;
      
      -- Record transaction (0 amount, just for record)
      INSERT INTO transactions (user_id, amount, type, reference_id)
      VALUES (bet_record.user_id, 0, 'bet_lost', bet_record.id);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for recalculating odds when a new bet is placed
CREATE OR REPLACE FUNCTION on_bet_placed()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_odds(NEW.event_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bet_placed
AFTER INSERT ON bets
FOR EACH ROW
EXECUTE FUNCTION on_bet_placed();

-- Create trigger for settling bets when an event is completed
CREATE OR REPLACE FUNCTION on_event_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    PERFORM settle_bets(NEW.id, NEW.winner);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_event_completed
AFTER UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION on_event_completed(); 