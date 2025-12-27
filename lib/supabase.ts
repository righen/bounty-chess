import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We don't need auth sessions for this app
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Rate limit for real-time updates
    },
  },
});

// Database types
export type Database = {
  public: {
    Tables: {
      players: {
        Row: {
          id: number;
          name: string;
          surname: string;
          birthdate: string | null;
          age: number;
          gender: 'M' | 'F';
          current_address: string | null;
          meal: string | null;
          bounty: number;
          wins: number;
          losses: number;
          draws: number;
          has_sheriff_badge: boolean;
          criminal_status: 'normal' | 'angry' | 'mad';
          opponent_ids: number[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['players']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['players']['Insert']>;
      };
      tournament: {
        Row: {
          id: string;
          current_round: number;
          total_rounds: number;
          tournament_started: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tournament']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tournament']['Insert']>;
      };
      rounds: {
        Row: {
          id: string;
          round_number: number;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['rounds']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['rounds']['Insert']>;
      };
      games: {
        Row: {
          id: string;
          round_id: string;
          round_number: number;
          white_player_id: number;
          black_player_id: number;
          white_sheriff_used: boolean;
          black_sheriff_used: boolean;
          result: 'white' | 'black' | 'draw' | null;
          bounty_transferred: number | null;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['games']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['games']['Insert']>;
      };
    };
  };
};

