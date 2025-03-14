export enum EventStatus {
  UPCOMING = 'upcoming',
  LIVE = 'live',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export enum EventWinner {
  TEAM_A = 'a',
  TEAM_B = 'b',
  DRAW = 'draw',
}

export interface Event {
  id: string;
  title: string;
  description: string;
  team_a: string;
  team_b: string;
  start_time: Date;
  end_time: Date;
  status: EventStatus;
  initial_odds_a: number;
  initial_odds_b: number;
  current_odds_a: number;
  current_odds_b: number;
  total_bets_a: number;
  total_bets_b: number;
  winner: EventWinner | null;
  created_at: Date;
  updated_at: Date;
} 