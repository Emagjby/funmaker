export enum BetTeam {
  TEAM_A = 'a',
  TEAM_B = 'b',
}

export enum BetStatus {
  PENDING = 'pending',
  WON = 'won',
  LOST = 'lost',
  VOIDED = 'voided',
}

export interface Bet {
  id: string;
  user_id: string;
  event_id: string;
  team: BetTeam;
  amount: number;
  odds_at_placement: number;
  potential_payout: number;
  status: BetStatus;
  created_at: Date;
  updated_at: Date;
} 