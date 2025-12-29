import { supabase } from './supabase';
import { registerPlayer, updateRegistration } from './registration-store';

export type CheckInAction = 'check_in' | 'check_out' | 'payment' | 'refund' | 'walk_in';

export interface CheckInLogEntry {
  id: number;
  tournament_id: string;
  player_id: number | null;
  registration_id: string | null;
  action_type: CheckInAction;
  amount: number | null;
  notes: string | null;
  performed_by: string | null;
  performed_at: string;
}

/**
 * Check in a player
 */
export async function checkInPlayer(
  registrationId: string,
  performedBy?: string,
  notes?: string
): Promise<void> {
  try {
    // Update registration
    await updateRegistration(registrationId, {
      checked_in: true,
      check_in_time: new Date().toISOString(),
    });

    // Get registration details for logging
    const { data: registration } = await supabase
      .from('tournament_registrations')
      .select('tournament_id, player_id')
      .eq('id', registrationId)
      .single();

    if (!registration) throw new Error('Registration not found');

    // Log the action
    await logCheckInAction(
      registration.tournament_id,
      registration.player_id,
      registrationId,
      'check_in',
      null,
      notes || null,
      performedBy || null
    );
  } catch (error) {
    console.error('Error checking in player:', error);
    throw error;
  }
}

/**
 * Undo check-in (check out)
 */
export async function checkOutPlayer(
  registrationId: string,
  performedBy?: string,
  notes?: string
): Promise<void> {
  try {
    // Update registration
    await updateRegistration(registrationId, {
      checked_in: false,
      check_in_time: null,
    });

    // Get registration details for logging
    const { data: registration } = await supabase
      .from('tournament_registrations')
      .select('tournament_id, player_id')
      .eq('id', registrationId)
      .single();

    if (!registration) throw new Error('Registration not found');

    // Log the action
    await logCheckInAction(
      registration.tournament_id,
      registration.player_id,
      registrationId,
      'check_out',
      null,
      notes || null,
      performedBy || null
    );
  } catch (error) {
    console.error('Error checking out player:', error);
    throw error;
  }
}

/**
 * Record payment
 */
export async function recordPayment(
  registrationId: string,
  amount: number,
  paymentMethod: string,
  paymentReference?: string,
  performedBy?: string,
  notes?: string
): Promise<void> {
  try {
    // Update registration
    await updateRegistration(registrationId, {
      entry_fee_paid: true,
      payment_method: paymentMethod,
      payment_reference: paymentReference || null,
    });

    // Get registration details for logging
    const { data: registration } = await supabase
      .from('tournament_registrations')
      .select('tournament_id, player_id')
      .eq('id', registrationId)
      .single();

    if (!registration) throw new Error('Registration not found');

    // Log the payment
    await logCheckInAction(
      registration.tournament_id,
      registration.player_id,
      registrationId,
      'payment',
      amount,
      notes || null,
      performedBy || null
    );
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
}

/**
 * Walk-in player: Add to pool and register in one action
 */
export async function addWalkInPlayer(
  tournamentId: string,
  playerData: {
    name: string;
    surname: string;
    email?: string;
    phone?: string;
    birthdate?: string;
    age?: number;
    gender?: 'M' | 'F';
    rating?: number;
  },
  entryFeePaid: boolean,
  paymentMethod?: string,
  performedBy?: string
): Promise<string> {
  try {
    // 1. Add player to pool
    const { data: newPlayer, error: playerError } = await supabase
      .from('player_pool')
      .insert([{
        name: playerData.name,
        surname: playerData.surname,
        email: playerData.email || null,
        phone: playerData.phone || null,
        birthdate: playerData.birthdate || null,
        age: playerData.age || null,
        gender: playerData.gender || null,
        rating: playerData.rating || null,
        active: true,
        banned: false,
      }])
      .select()
      .single();

    if (playerError) throw playerError;

    // 2. Register player for tournament
    const registration = await registerPlayer(
      tournamentId,
      newPlayer.id,
      entryFeePaid,
      paymentMethod
    );

    // 3. Automatically check in the walk-in player
    await updateRegistration(registration.id, {
      checked_in: true,
      check_in_time: new Date().toISOString(),
    });

    // 4. Log the walk-in action
    await logCheckInAction(
      tournamentId,
      newPlayer.id,
      registration.id,
      'walk_in',
      null,
      `Walk-in player: ${playerData.name} ${playerData.surname}`,
      performedBy || null
    );

    return registration.id;
  } catch (error) {
    console.error('Error adding walk-in player:', error);
    throw error;
  }
}

/**
 * Log check-in action
 */
async function logCheckInAction(
  tournamentId: string,
  playerId: number | null,
  registrationId: string | null,
  actionType: CheckInAction,
  amount: number | null,
  notes: string | null,
  performedBy: string | null
): Promise<void> {
  try {
    const { error } = await supabase
      .from('check_in_log')
      .insert([{
        tournament_id: tournamentId,
        player_id: playerId,
        registration_id: registrationId,
        action_type: actionType,
        amount: amount,
        notes: notes,
        performed_by: performedBy,
        performed_at: new Date().toISOString(),
      }]);

    if (error) {
      console.error('Error logging check-in action:', error);
      // Don't throw - logging failure shouldn't break the main action
    }
  } catch (error) {
    console.error('Error logging check-in action:', error);
  }
}

/**
 * Get check-in statistics for a tournament
 */
export async function getCheckInStats(tournamentId: string): Promise<{
  total: number;
  checkedIn: number;
  notCheckedIn: number;
  paid: number;
  unpaid: number;
  walkIns: number;
}> {
  try {
    // Get all registrations
    const { data: registrations, error: regError } = await supabase
      .from('tournament_registrations')
      .select('id, checked_in, entry_fee_paid')
      .eq('tournament_id', tournamentId);

    if (regError) throw regError;

    const total = registrations?.length || 0;
    const checkedIn = registrations?.filter(r => r.checked_in).length || 0;
    const notCheckedIn = total - checkedIn;
    const paid = registrations?.filter(r => r.entry_fee_paid).length || 0;
    const unpaid = total - paid;

    // Get walk-ins count
    const { data: walkIns, error: walkInError } = await supabase
      .from('check_in_log')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('action_type', 'walk_in');

    if (walkInError) throw walkInError;

    return {
      total,
      checkedIn,
      notCheckedIn,
      paid,
      unpaid,
      walkIns: walkIns?.length || 0,
    };
  } catch (error) {
    console.error('Error getting check-in stats:', error);
    throw error;
  }
}

/**
 * Get check-in log for a tournament
 */
export async function getCheckInLog(tournamentId: string): Promise<CheckInLogEntry[]> {
  try {
    const { data, error } = await supabase
      .from('check_in_log')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('performed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting check-in log:', error);
    throw error;
  }
}

/**
 * Bulk check-in multiple players
 */
export async function bulkCheckIn(
  registrationIds: string[],
  performedBy?: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const id of registrationIds) {
    try {
      await checkInPlayer(id, performedBy);
      success++;
    } catch (error) {
      console.error(`Failed to check in registration ${id}:`, error);
      failed++;
    }
  }

  return { success, failed };
}

