import { supabase } from './supabase';
import { PlayerPoolRecord, loadPlayerPool } from './player-pool-store';

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  player_pool_id: number;
  player_id?: number; // Legacy field for compatibility
  pairing_number: number | null;
  entry_fee_paid: boolean;
  payment_method: string | null;
  payment_reference: string | null;
  checked_in: boolean;
  check_in_time: string | null;
  notes: string | null;
  registered_at: string;
  updated_at: string;
}

export interface RegistrationWithPlayer extends TournamentRegistration {
  player: PlayerPoolRecord;
}

/**
 * Get all registrations for a tournament
 */
export async function getTournamentRegistrations(tournamentId: string): Promise<RegistrationWithPlayer[]> {
  try {
    // First, get all registrations
    const { data: registrations, error: regError } = await supabase
      .from('tournament_registrations')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('pairing_number');

    if (regError) throw regError;
    if (!registrations || registrations.length === 0) return [];

    // Get all unique player_pool_ids
    const playerIds = registrations
      .map(r => r.player_pool_id)
      .filter((id): id is number => id !== null && id !== undefined);

    if (playerIds.length === 0) {
      // No player_pool_ids, return registrations without player data
      return registrations.map((reg: any) => ({
        ...reg,
        player_id: reg.player_pool_id,
        player: null as any, // Will need to handle this case
      }));
    }

    // Fetch all players in one query
    const { data: players, error: playersError } = await supabase
      .from('player_pool')
      .select('*')
      .in('id', playerIds);

    if (playersError) {
      console.warn('Error fetching players:', playersError);
      // Continue without player data
    }

    // Create a map for quick lookup
    const playerMap = new Map((players || []).map(p => [p.id, p]));

    // Combine registrations with player data
    return registrations.map((reg: any) => {
      const player = reg.player_pool_id ? playerMap.get(reg.player_pool_id) : null;
      return {
        ...reg,
        player_id: reg.player_pool_id, // Map for compatibility
        player: player || {
          id: reg.player_pool_id || 0,
          name: reg.player_name || 'Unknown',
          surname: reg.player_surname || 'Player',
          email: null,
          phone: null,
          birthdate: null,
          age: reg.player_age || null,
          gender: reg.player_gender || null,
          rating: reg.player_rating || null,
          fide_id: null,
          national_id: null,
          photo_url: null,
          notes: null,
          tournaments_played: 0,
          total_games: 0,
          total_wins: 0,
          total_draws: 0,
          total_losses: 0,
          active: true,
          banned: false,
          ban_reason: null,
          created_at: '',
          updated_at: '',
        },
      };
    });
  } catch (error) {
    console.error('Error getting tournament registrations:', error);
    throw error;
  }
}

/**
 * Register a player for a tournament
 */
export async function registerPlayer(
  tournamentId: string,
  playerId: number,
  entryFeePaid: boolean = false,
  paymentMethod?: string,
  paymentReference?: string
): Promise<TournamentRegistration> {
  try {
    // 1. Get player data from player_pool
    const { data: player, error: playerError } = await supabase
      .from('player_pool')
      .select('*')
      .eq('id', playerId)
      .single();

    if (playerError || !player) {
      throw new Error('Player not found in player pool');
    }

    // 2. Check if player is already registered
    const { data: existing, error: checkError } = await supabase
      .from('tournament_registrations')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('player_pool_id', playerId)
      .single();

    if (existing) {
      throw new Error('Player is already registered for this tournament');
    }

    // 3. Get next pairing number
    const { data: registrations, error: countError } = await supabase
      .from('tournament_registrations')
      .select('pairing_number')
      .eq('tournament_id', tournamentId)
      .order('pairing_number', { ascending: false })
      .limit(1);

    const nextPairingNumber = registrations && registrations.length > 0 
      ? (registrations[0].pairing_number || 0) + 1 
      : 1;

    // 4. Create registration with all required fields
    const { data, error } = await supabase
      .from('tournament_registrations')
      .insert([{
        tournament_id: tournamentId,
        player_pool_id: playerId,
        player_name: player.name,
        player_surname: player.surname,
        player_age: player.age,
        player_gender: player.gender,
        player_rating: player.rating,
        pairing_number: nextPairingNumber,
        entry_fee_paid: entryFeePaid,
        payment_method: paymentMethod || null,
        payment_reference: paymentReference || null,
        checked_in: false,
        status: 'registered',
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error registering player:', error);
    throw error;
  }
}

/**
 * Bulk register multiple players
 */
export async function bulkRegisterPlayers(
  tournamentId: string,
  playerIds: number[],
  entryFeePaid: boolean = false
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  // Check for existing registrations to avoid duplicates
  const { data: existingRegs } = await supabase
    .from('tournament_registrations')
    .select('player_pool_id')
    .eq('tournament_id', tournamentId)
    .in('player_pool_id', playerIds);

  const existingPlayerIds = new Set(existingRegs?.map(r => r.player_pool_id) || []);

  for (const playerId of playerIds) {
    try {
      // Skip if already registered
      if (existingPlayerIds.has(playerId)) {
        failed++;
        errors.push(`Player ${playerId}: Already registered`);
        continue;
      }
      
      await registerPlayer(tournamentId, playerId, entryFeePaid);
      success++;
      // Add to set to prevent duplicate registrations in same batch
      existingPlayerIds.add(playerId);
    } catch (error: any) {
      failed++;
      errors.push(`Player ${playerId}: ${error.message}`);
    }
  }

  return { success, failed, errors };
}

/**
 * Update registration (e.g., mark entry fee as paid)
 */
export async function updateRegistration(
  registrationId: string,
  updates: Partial<TournamentRegistration>
): Promise<TournamentRegistration> {
  try {
    const updateData: any = { ...updates };
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('tournament_registrations')
      .update(updateData)
      .eq('id', registrationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating registration:', error);
    throw error;
  }
}

/**
 * Remove a registration
 */
export async function unregisterPlayer(registrationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tournament_registrations')
      .delete()
      .eq('id', registrationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error unregistering player:', error);
    throw error;
  }
}

/**
 * Get registration statistics for a tournament
 */
export async function getRegistrationStats(tournamentId: string): Promise<{
  total: number;
  paidFees: number;
  checkedIn: number;
  pending: number;
}> {
  try {
    const { data, error } = await supabase
      .from('tournament_registrations')
      .select('id, entry_fee_paid, checked_in')
      .eq('tournament_id', tournamentId);

    if (error) throw error;

    const total = data?.length || 0;
    const paidFees = data?.filter(r => r.entry_fee_paid).length || 0;
    const checkedIn = data?.filter(r => r.checked_in).length || 0;
    const pending = data?.filter(r => !r.entry_fee_paid).length || 0;

    return { total, paidFees, checkedIn, pending };
  } catch (error) {
    console.error('Error getting registration stats:', error);
    throw error;
  }
}

/**
 * Check in a player
 */
export async function checkInPlayer(registrationId: string): Promise<TournamentRegistration> {
  try {
    const { data, error } = await supabase
      .from('tournament_registrations')
      .update({
        checked_in: true,
        check_in_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', registrationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error checking in player:', error);
    throw error;
  }
}

/**
 * Get available players (not yet registered for this tournament)
 */
export async function getAvailablePlayers(tournamentId: string): Promise<PlayerPoolRecord[]> {
  try {
    // Get all registered player IDs for this tournament
    const { data: registrations, error: regError } = await supabase
      .from('tournament_registrations')
      .select('player_pool_id')
      .eq('tournament_id', tournamentId);

    if (regError) throw regError;

    const registeredIds = registrations?.map(r => r.player_pool_id).filter(id => id !== null) || [];

    // Get all active players not in the registered list
    let query = supabase
      .from('player_pool')
      .select('*')
      .eq('active', true)
      .eq('banned', false)
      .order('surname')
      .order('name');

    if (registeredIds.length > 0) {
      query = query.not('id', 'in', `(${registeredIds.join(',')})`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting available players:', error);
    throw error;
  }
}

