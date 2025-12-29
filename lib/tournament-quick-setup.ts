import { createTournament, Tournament } from './tournament-store';
import { loadPlayerPool, PlayerPoolRecord } from './player-pool-store';
import { bulkRegisterPlayers } from './registration-store';

export interface QuickSetupOptions {
  name?: string;
  location?: string;
  totalRounds?: number;
  timeControl?: string;
  entryFee?: number;
  useBountySystem?: boolean;
  initialBounty?: number;
  autoRegisterAllPlayers?: boolean;
}

/**
 * Quick setup: Create tournament and register all active players
 */
export async function quickSetupTournament(
  options: QuickSetupOptions = {}
): Promise<{ tournament: Tournament; playersRegistered: number }> {
  try {
    // Default options
    const {
      name = `Tournament ${new Date().toLocaleDateString()}`,
      location = 'Chess Club',
      totalRounds = 9,
      timeControl = '30+0',
      entryFee = 0,
      useBountySystem = false,
      initialBounty = null,
      autoRegisterAllPlayers = true,
    } = options;

    // Step 1: Create tournament
    const tournament = await createTournament({
      name,
      location,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      format: 'swiss',
      total_rounds: totalRounds,
      time_control: timeControl,
      default_time_minutes: 30,
      grace_period_minutes: 0,
      bye_points: 1.0,
      initial_bounty: useBountySystem ? initialBounty : null,
      entry_fee: entryFee,
      prize_pool: 0,
      allow_late_entries: true,
      status: 'draft',
    });

    // Step 2: Get all active players
    let playersRegistered = 0;
    if (autoRegisterAllPlayers) {
      const players = await loadPlayerPool();
      const activePlayers = players.filter(p => p.active && !p.banned);

      if (activePlayers.length > 0) {
        const playerIds = activePlayers.map(p => p.id);
        const result = await bulkRegisterPlayers(tournament.id, playerIds, entryFee === 0);
        playersRegistered = result.success;
      }
    }

    return { tournament, playersRegistered };
  } catch (error) {
    console.error('Error in quick setup:', error);
    throw error;
  }
}

