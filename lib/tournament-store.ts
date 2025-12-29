import { supabase } from './supabase';

export interface Tournament {
  id: string;
  name: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  format: 'swiss' | 'round_robin' | 'knockout';
  total_rounds: number;
  current_round: number;
  time_control: string | null;
  default_time_minutes: number;
  grace_period_minutes: number;
  bye_points: number;
  initial_bounty: number;
  entry_fee: number | null;
  prize_fund: number | null;
  status: 'draft' | 'registration' | 'ready' | 'in_progress' | 'completed' | 'cancelled';
  tournament_started: boolean;
  allow_late_entries: boolean;
  late_entry_deadline_round: number | null;
  created_at: string;
  updated_at: string;
  organizer_id: string | null;
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
    const { data, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        tournament_registrations(count),
        games(count)
      `)
      .order('start_date', { ascending: false });

    if (error) throw error;

    // Transform data to include counts
    const tournaments: TournamentWithStats[] = (data || []).map((t: any) => ({
      ...t,
      player_count: t.tournament_registrations?.[0]?.count || 0,
      checked_in_count: 0, // Will be calculated separately
      games_completed: 0, // Will be calculated separately
      total_games: t.games?.[0]?.count || 0,
    }));

    return tournaments;
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
        start_date: tournament.start_date,
        end_date: tournament.end_date || null,
        format: tournament.format || 'swiss',
        total_rounds: tournament.total_rounds || 9,
        current_round: 0,
        time_control: tournament.time_control || null,
        default_time_minutes: tournament.default_time_minutes || 30,
        grace_period_minutes: tournament.grace_period_minutes || 0,
        bye_points: tournament.bye_points || 1.0,
        initial_bounty: tournament.initial_bounty || 20,
        entry_fee: tournament.entry_fee || null,
        prize_fund: tournament.prize_fund || null,
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

