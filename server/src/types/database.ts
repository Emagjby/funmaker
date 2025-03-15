export type TeamType = 'a' | 'b' | 'draw';
export type EventStatus = 'upcoming' | 'live' | 'completed' | 'canceled';
export type BetStatus = 'pending' | 'won' | 'lost' | 'voided';
export type TransactionType = 'bet_placed' | 'bet_won' | 'bet_lost' | 'bet_voided' | 'bonus' | 'adjustment';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_id: string;
          email: string;
          username: string;
          points_balance: number;
          profile_image_url: string | null;
          last_login_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_id: string;
          email: string;
          username: string;
          points_balance?: number;
          profile_image_url?: string | null;
          last_login_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_id?: string;
          email?: string;
          username?: string;
          points_balance?: number;
          profile_image_url?: string | null;
          last_login_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string | null;
          image_url: string | null;
          team_a: string;
          team_b: string;
          team_a_score: number | null;
          team_b_score: number | null;
          start_time: string;
          end_time: string;
          is_featured: boolean;
          status: EventStatus;
          initial_odds_a: number;
          initial_odds_b: number;
          current_odds_a: number;
          current_odds_b: number;
          total_bets_a: number;
          total_bets_b: number;
          winner: TeamType | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category?: string | null;
          image_url?: string | null;
          team_a: string;
          team_b: string;
          team_a_score?: number | null;
          team_b_score?: number | null;
          start_time: string;
          end_time: string;
          is_featured?: boolean;
          status?: EventStatus;
          initial_odds_a: number;
          initial_odds_b: number;
          current_odds_a?: number;
          current_odds_b?: number;
          total_bets_a?: number;
          total_bets_b?: number;
          winner?: TeamType | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          image_url?: string | null;
          team_a?: string;
          team_b?: string;
          team_a_score?: number | null;
          team_b_score?: number | null;
          start_time?: string;
          end_time?: string;
          is_featured?: boolean;
          status?: EventStatus;
          initial_odds_a?: number;
          initial_odds_b?: number;
          current_odds_a?: number;
          current_odds_b?: number;
          total_bets_a?: number;
          total_bets_b?: number;
          winner?: TeamType | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bets: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          team: TeamType;
          amount: number;
          odds_at_placement: number;
          potential_payout: number;
          status: BetStatus;
          settled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          team: TeamType;
          amount: number;
          odds_at_placement: number;
          potential_payout: number;
          status?: BetStatus;
          settled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string;
          team?: TeamType;
          amount?: number;
          odds_at_placement?: number;
          potential_payout?: number;
          status?: BetStatus;
          settled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: TransactionType;
          reference_id: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: TransactionType;
          reference_id?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          type?: TransactionType;
          reference_id?: string | null;
          description?: string | null;
          created_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
          created_by?: string | null;
        };
      };
      migrations: {
        Row: {
          id: number;
          name: string;
          applied_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          applied_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          applied_at?: string;
        };
      };
    };
    Views: {
      user_leaderboard: {
        Row: {
          id: string;
          username: string;
          points_balance: number;
          profile_image_url: string | null;
          total_bets: number;
          total_wins: number;
          total_losses: number;
          win_percentage: number;
          total_points_won: number;
          betting_skill: number;
        };
      };
    };
    Functions: {
      calculate_odds: {
        Args: { event_id: string };
        Returns: null;
      };
      settle_bets: {
        Args: { event_id: string; winner: TeamType };
        Returns: null;
      };
      refresh_leaderboard: {
        Args: Record<string, never>;
        Returns: null;
      };
      exec_sql: {
        Args: { sql: string };
        Returns: unknown;
      };
      create_migrations_table_if_not_exists: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      create_sql_function: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
  };
}

// FIXME: Resolve compatibility issue with Supabase client
declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    query: (sql: string) => Promise<{ data: any; error: Error | null }>;
  }
} 