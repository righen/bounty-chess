import { supabase } from './supabase';

export interface PlayerPoolRecord {
  id: number;
  name: string;
  surname: string;
  email: string | null;
  phone: string | null;
  birthdate: string | null;
  age: number | null;
  gender: 'M' | 'F' | null;
  rating: number | null;
  fide_id: string | null;
  national_id: string | null;
  photo_url: string | null;
  notes: string | null;
  tournaments_played: number;
  total_games: number;
  total_wins: number;
  total_draws: number;
  total_losses: number;
  active: boolean;
  banned: boolean;
  ban_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlayerPoolInput {
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  birthdate?: string;
  age?: number;
  gender?: 'M' | 'F';
  rating?: number;
  fide_id?: string;
  national_id?: string;
  photo_url?: string;
  notes?: string;
  active?: boolean;
  banned?: boolean;
  ban_reason?: string;
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
export async function getPlayerFromPool(id: number): Promise<PlayerPoolRecord | null> {
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
        email: player.email || null,
        phone: player.phone || null,
        birthdate: player.birthdate || null,
        age: player.age || null,
        gender: player.gender || null,
        rating: player.rating || null,
        fide_id: player.fide_id || null,
        national_id: player.national_id || null,
        photo_url: player.photo_url || null,
        notes: player.notes || null,
        active: player.active !== undefined ? player.active : true,
        banned: player.banned !== undefined ? player.banned : false,
        ban_reason: player.ban_reason || null,
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
export async function updatePlayerInPool(id: number, player: Partial<PlayerPoolInput>): Promise<PlayerPoolRecord> {
  try {
    const updateData: any = {};
    
    if (player.name !== undefined) updateData.name = player.name;
    if (player.surname !== undefined) updateData.surname = player.surname;
    if (player.email !== undefined) updateData.email = player.email || null;
    if (player.phone !== undefined) updateData.phone = player.phone || null;
    if (player.birthdate !== undefined) updateData.birthdate = player.birthdate || null;
    if (player.age !== undefined) updateData.age = player.age || null;
    if (player.gender !== undefined) updateData.gender = player.gender || null;
    if (player.rating !== undefined) updateData.rating = player.rating || null;
    if (player.fide_id !== undefined) updateData.fide_id = player.fide_id || null;
    if (player.national_id !== undefined) updateData.national_id = player.national_id || null;
    if (player.photo_url !== undefined) updateData.photo_url = player.photo_url || null;
    if (player.notes !== undefined) updateData.notes = player.notes || null;
    if (player.active !== undefined) updateData.active = player.active;
    if (player.banned !== undefined) updateData.banned = player.banned;
    if (player.ban_reason !== undefined) updateData.ban_reason = player.ban_reason || null;

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
export async function deletePlayerFromPool(id: number): Promise<void> {
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
      .or(`name.ilike.%${query}%,surname.ilike.%${query}%,email.ilike.%${query}%,fide_id.ilike.%${query}%`)
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
  withRating: number;
}> {
  try {
    const { data, error } = await supabase
      .from('player_pool')
      .select('id, active, banned, rating');

    if (error) throw error;

    const total = data?.length || 0;
    const active = data?.filter(p => p.active && !p.banned).length || 0;
    const banned = data?.filter(p => p.banned).length || 0;
    const withRating = data?.filter(p => p.rating && p.rating > 0).length || 0;

    return { total, active, banned, withRating };
  } catch (error) {
    console.error('Error getting player pool stats:', error);
    throw error;
  }
}

