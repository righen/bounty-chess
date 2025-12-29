import { supabase } from './supabase';
import { PlayerPoolRecord } from './player-pool-store';

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  player_id: number;
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
    // Use explicit foreign key to avoid ambiguity
    const { data, error } = await supabase
      .from('tournament_registrations')
      .select(`
        *,
        player:player_pool!tournament_registrations_player_id_fkey(*)
      `)
      .eq('tournament_id', tournamentId)
      .order('pairing_number');

    if (error) throw error;

    // Transform the data to match our interface
    return (data || []).map((reg: any) => ({
      ...reg,
      player: reg.player,
    }));
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
    // Check if player is already registered
    const { data: existing, error: checkError } = await supabase
      .from('tournament_registrations')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('player_id', playerId)
      .single();

    if (existing) {
      throw new Error('Player is already registered for this tournament');
    }

    // Get next pairing number
    const { data: registrations, error: countError } = await supabase
      .from('tournament_registrations')
      .select('pairing_number')
      .eq('tournament_id', tournamentId)
      .order('pairing_number', { ascending: false })
      .limit(1);

    const nextPairingNumber = registrations && registrations.length > 0 
      ? (registrations[0].pairing_number || 0) + 1 
      : 1;

    // Create registration
    const { data, error } = await supabase
      .from('tournament_registrations')
      .insert([{
        tournament_id: tournamentId,
        player_id: playerId,
        pairing_number: nextPairingNumber,
        entry_fee_paid: entryFeePaid,
        payment_method: paymentMethod || null,
        payment_reference: paymentReference || null,
        checked_in: false,
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

  for (const playerId of playerIds) {
    try {
      await registerPlayer(tournamentId, playerId, entryFeePaid);
      success++;
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
      .select('player_id')
      .eq('tournament_id', tournamentId);

    if (regError) throw regError;

    const registeredIds = registrations?.map(r => r.player_id) || [];

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

