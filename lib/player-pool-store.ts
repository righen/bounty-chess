import { supabase } from './supabase';

export interface PlayerPoolRecord {
  id: string;
  name: string;
  surname: string;
  birthdate: string | null;
  age: number | null;
  gender: 'M' | 'F' | null;
  contact_phone: string | null;
  contact_email: string | null;
  fide_id: string | null;
  fide_rating: number | null;
  national_rating: number | null;
  club_affiliation: string | null;
  tournaments_played: number;
  total_wins: number;
  total_losses: number;
  total_draws: number;
  highest_bounty: number;
  notes: string | null;
  is_active: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlayerPoolInput {
  name: string;
  surname: string;
  birthdate?: string;
  age?: number;
  gender?: 'M' | 'F';
  contact_phone?: string;
  contact_email?: string;
  fide_id?: string;
  fide_rating?: number;
  national_rating?: number;
  club_affiliation?: string;
  notes?: string;
  is_active?: boolean;
  is_banned?: boolean;
}

/**
 * Load all players from the player pool
 */
export async function loadPlayerPool(): Promise<PlayerPoolRecord[]> {
  try {
    const { data, error } = await supabase
      .from('player_pool')
      .select('*')
      .order('surname')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading player pool:', error);
    throw error;
  }
}

/**
 * Get a single player from the pool by ID
 */
export async function getPlayerFromPool(id: string): Promise<PlayerPoolRecord | null> {
  try {
    const { data, error } = await supabase
      .from('player_pool')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting player from pool:', error);
    throw error;
  }
}

/**
 * Add a new player to the pool
 */
export async function addPlayerToPool(player: PlayerPoolInput): Promise<PlayerPoolRecord> {
  try {
    const { data, error } = await supabase
      .from('player_pool')
      .insert([{
        name: player.name,
        surname: player.surname,
        birthdate: player.birthdate || null,
        age: player.age || null,
        gender: player.gender || null,
        contact_phone: player.contact_phone || null,
        contact_email: player.contact_email || null,
        fide_id: player.fide_id || null,
        fide_rating: player.fide_rating || null,
        national_rating: player.national_rating || null,
        club_affiliation: player.club_affiliation || null,
        notes: player.notes || null,
        is_active: player.is_active !== undefined ? player.is_active : true,
        is_banned: player.is_banned !== undefined ? player.is_banned : false,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding player to pool:', error);
    throw error;
  }
}

/**
 * Update a player in the pool
 */
export async function updatePlayerInPool(id: string, player: Partial<PlayerPoolInput>): Promise<PlayerPoolRecord> {
  try {
    const updateData: any = {};
    
    if (player.name !== undefined) updateData.name = player.name;
    if (player.surname !== undefined) updateData.surname = player.surname;
    if (player.birthdate !== undefined) updateData.birthdate = player.birthdate || null;
    if (player.age !== undefined) updateData.age = player.age || null;
    if (player.gender !== undefined) updateData.gender = player.gender || null;
    if (player.contact_phone !== undefined) updateData.contact_phone = player.contact_phone || null;
    if (player.contact_email !== undefined) updateData.contact_email = player.contact_email || null;
    if (player.fide_id !== undefined) updateData.fide_id = player.fide_id || null;
    if (player.fide_rating !== undefined) updateData.fide_rating = player.fide_rating || null;
    if (player.national_rating !== undefined) updateData.national_rating = player.national_rating || null;
    if (player.club_affiliation !== undefined) updateData.club_affiliation = player.club_affiliation || null;
    if (player.notes !== undefined) updateData.notes = player.notes || null;
    if (player.is_active !== undefined) updateData.is_active = player.is_active;
    if (player.is_banned !== undefined) updateData.is_banned = player.is_banned;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('player_pool')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating player in pool:', error);
    throw error;
  }
}

/**
 * Delete a player from the pool
 */
export async function deletePlayerFromPool(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('player_pool')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting player from pool:', error);
    throw error;
  }
}

/**
 * Search players in the pool
 */
export async function searchPlayerPool(query: string): Promise<PlayerPoolRecord[]> {
  try {
    const { data, error } = await supabase
      .from('player_pool')
      .select('*')
      .or(`name.ilike.%${query}%,surname.ilike.%${query}%,contact_email.ilike.%${query}%`)
      .order('surname')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching player pool:', error);
    throw error;
  }
}

/**
 * Bulk import players to the pool from CSV
 */
export async function bulkImportPlayersToPool(players: PlayerPoolInput[]): Promise<{ success: number; failed: number }> {
  try {
    let success = 0;
    let failed = 0;

    for (const player of players) {
      try {
        await addPlayerToPool(player);
        success++;
      } catch (error) {
        console.error('Failed to import player:', player, error);
        failed++;
      }
    }

    return { success, failed };
  } catch (error) {
    console.error('Error bulk importing players:', error);
    throw error;
  }
}

/**
 * Get player statistics summary
 */
export async function getPlayerPoolStats(): Promise<{
  total: number;
  active: number;
  banned: number;
  withFideRating: number;
}> {
  try {
    const { data, error } = await supabase
      .from('player_pool')
      .select('id, is_active, is_banned, fide_rating');

    if (error) throw error;

    const total = data?.length || 0;
    const active = data?.filter(p => p.is_active && !p.is_banned).length || 0;
    const banned = data?.filter(p => p.is_banned).length || 0;
    const withFideRating = data?.filter(p => p.fide_rating && p.fide_rating > 0).length || 0;

    return { total, active, banned, withFideRating };
  } catch (error) {
    console.error('Error getting player pool stats:', error);
    throw error;
  }
}

