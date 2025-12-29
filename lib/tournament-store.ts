import { supabase } from './supabase';

export interface Tournament {
  id: string;
  name: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  description: string | null;
  format: 'swiss' | 'round_robin' | 'knockout';
  total_rounds: number;
  current_round: number;
  time_control: string | null;
  default_time_minutes: number;
  grace_period_minutes: number;
  bye_points: number;
  initial_bounty: number | null; // Optional: for bounty tournaments
  entry_fee: number | null;
  prize_pool: number | null; // Fixed: was prize_fund
  status: 'draft' | 'registration' | 'ready' | 'in_progress' | 'completed' | 'cancelled';
  tournament_started: boolean;
  allow_late_entries: boolean;
  late_entry_deadline_round: number | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface TournamentStats {
  total: number;
  draft: number;
  registration: number;
  inProgress: number;
  completed: number;
  totalPlayers: number;
  activeRegistrations: number;
}

export interface TournamentWithStats extends Tournament {
  player_count: number;
  checked_in_count: number;
  games_completed: number;
  total_games: number;
}

/**
 * Load all tournaments
 */
export async function loadTournaments(): Promise<TournamentWithStats[]> {
  try {
    // First, get all tournaments
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('*')
      .order('start_date', { ascending: false });

    if (tournamentsError) {
      console.error('Error loading tournaments:', tournamentsError);
      throw tournamentsError;
    }

    if (!tournaments || tournaments.length === 0) {
      return [];
    }

    // Get player counts for each tournament
    const tournamentIds = tournaments.map(t => t.id);
    const { data: registrations } = await supabase
      .from('tournament_registrations')
      .select('tournament_id')
      .in('tournament_id', tournamentIds);

    const { data: games } = await supabase
      .from('games')
      .select('tournament_id')
      .in('tournament_id', tournamentIds);

    // Count registrations and games per tournament
    const registrationCounts = (registrations || []).reduce((acc: any, reg: any) => {
      acc[reg.tournament_id] = (acc[reg.tournament_id] || 0) + 1;
      return acc;
    }, {});

    const gameCounts = (games || []).reduce((acc: any, game: any) => {
      acc[game.tournament_id] = (acc[game.tournament_id] || 0) + 1;
      return acc;
    }, {});

    // Transform data to include counts
    const tournamentsWithStats: TournamentWithStats[] = tournaments.map((t: any) => ({
      ...t,
      player_count: registrationCounts[t.id] || 0,
      checked_in_count: 0, // Will be calculated separately
      games_completed: 0, // Will be calculated separately
      total_games: gameCounts[t.id] || 0,
    }));

    return tournamentsWithStats;
  } catch (error) {
    console.error('Error loading tournaments:', error);
    throw error;
  }
}

/**
 * Get a single tournament by ID
 */
export async function getTournament(id: string): Promise<Tournament | null> {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting tournament:', error);
    throw error;
  }
}

/**
 * Get tournament statistics
 */
export async function getTournamentStats(): Promise<TournamentStats> {
  try {
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('id, status');

    if (tournamentsError) throw tournamentsError;

    const { data: registrations, error: registrationsError } = await supabase
      .from('tournament_registrations')
      .select('id, checked_in');

    if (registrationsError) throw registrationsError;

    const total = tournaments?.length || 0;
    const draft = tournaments?.filter(t => t.status === 'draft').length || 0;
    const registration = tournaments?.filter(t => t.status === 'registration').length || 0;
    const inProgress = tournaments?.filter(t => t.status === 'in_progress').length || 0;
    const completed = tournaments?.filter(t => t.status === 'completed').length || 0;
    const totalPlayers = registrations?.length || 0;
    const activeRegistrations = registrations?.filter(r => r.checked_in).length || 0;

    return {
      total,
      draft,
      registration,
      inProgress,
      completed,
      totalPlayers,
      activeRegistrations,
    };
  } catch (error) {
    console.error('Error getting tournament stats:', error);
    throw error;
  }
}

/**
 * Create a new tournament
 */
export async function createTournament(tournament: Partial<Tournament>): Promise<Tournament> {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .insert([{
        name: tournament.name,
        location: tournament.location || null,
        description: tournament.description || null,
        start_date: tournament.start_date,
        end_date: tournament.end_date || null,
        format: tournament.format || 'swiss',
        total_rounds: tournament.total_rounds || 9,
        current_round: 0,
        time_control: tournament.time_control || '30+0',
        default_time_minutes: tournament.default_time_minutes || 30,
        grace_period_minutes: tournament.grace_period_minutes || 0,
        bye_points: tournament.bye_points || 1.0,
        initial_bounty: tournament.initial_bounty || null, // Optional: null for standard tournaments
        entry_fee: tournament.entry_fee || 0,
        prize_pool: tournament.prize_pool || 0, // Fixed: was prize_fund
        status: 'draft',
        tournament_started: false,
        allow_late_entries: tournament.allow_late_entries !== undefined ? tournament.allow_late_entries : true,
        late_entry_deadline_round: tournament.late_entry_deadline_round || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }
}

/**
 * Update tournament
 */
export async function updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament> {
  try {
    const updateData: any = { ...updates };
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('tournaments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating tournament:', error);
    throw error;
  }
}

/**
 * Delete tournament
 */
export async function deleteTournament(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting tournament:', error);
    throw error;
  }
}

/**
 * Get recent activity (audit log)
 */
export async function getRecentActivity(limit: number = 10): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('arbiter_actions')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
}

