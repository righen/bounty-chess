import { TournamentState, Player, Round, Game, GameResult, SheriffUsage } from '@/types';
import { supabase } from './supabase';
import { generateSwissPairings } from './pairing';
import { calculateBountyTransfer } from './bounty';

const TOURNAMENT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Load tournament state from Supabase
 */
export async function loadTournamentState(): Promise<TournamentState | null> {
  try {
    // Load tournament metadata
    const { data: tournamentData, error: tournamentError } = await supabase
      .from('tournament')
      .select('*')
      .eq('id', TOURNAMENT_ID)
      .single();

    if (tournamentError) throw tournamentError;
    if (!tournamentData) return null;

    // Load players
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*')
      .order('id');

    if (playersError) throw playersError;

    // Load rounds with games
    const { data: roundsData, error: roundsError } = await supabase
      .from('rounds')
      .select('*, games(*)')
      .order('round_number');

    if (roundsError) throw roundsError;

    // Transform to TournamentState
    const players: Player[] = (playersData || []).map(p => ({
      id: p.id,
      name: p.name,
      surname: p.surname,
      birthdate: p.birthdate || '',
      age: p.age,
      gender: p.gender as 'M' | 'F',
      currentAddress: p.current_address || '',
      meal: p.meal || '',
      paymentProof: p.payment_proof || '',
      transferName: p.transfer_name || '',
      bounty: p.bounty,
      wins: p.wins,
      losses: p.losses,
      draws: p.draws,
      hasSheriffBadge: p.has_sheriff_badge,
      criminalStatus: p.criminal_status as 'normal' | 'angry' | 'mad',
      opponentIds: p.opponent_ids || [],
    }));

    const rounds: Round[] = (roundsData || []).map(r => ({
      number: r.round_number,
      games: (r.games || []).map((g: any) => ({
        id: g.id,
        roundNumber: g.round_number,
        whitePlayerId: g.white_player_id,
        blackPlayerId: g.black_player_id,
        result: g.result as GameResult,
        sheriffUsage: {
          white: g.white_sheriff_used,
          black: g.black_sheriff_used,
        },
        bountyTransfer: g.bounty_transferred || 0,
        completed: g.completed,
      })),
      completed: r.completed,
    }));

    return {
      players,
      rounds,
      currentRound: tournamentData.current_round,
      totalRounds: tournamentData.total_rounds,
      tournamentStarted: tournamentData.tournament_started,
    };
  } catch (error) {
    console.error('Error loading tournament state:', error);
    return null;
  }
}

/**
 * Save tournament state to Supabase
 */
export async function saveTournamentState(state: TournamentState): Promise<void> {
  try {
    // Update tournament metadata
    await supabase
      .from('tournament')
      .update({
        current_round: state.currentRound,
        total_rounds: state.totalRounds,
        tournament_started: state.tournamentStarted,
      })
      .eq('id', TOURNAMENT_ID);

    // Upsert players
    if (state.players.length > 0) {
      const playersToUpsert = state.players.map(p => ({
        id: p.id,
        name: p.name,
        surname: p.surname,
        birthdate: p.birthdate || null,
        age: p.age,
        gender: p.gender,
        current_address: p.currentAddress || null,
        meal: p.meal || null,
        payment_proof: p.paymentProof || null,
        transfer_name: p.transferName || null,
        bounty: p.bounty,
        wins: p.wins,
        losses: p.losses,
        draws: p.draws,
        has_sheriff_badge: p.hasSheriffBadge,
        criminal_status: p.criminalStatus,
        opponent_ids: p.opponentIds,
      }));

      await supabase
        .from('players')
        .upsert(playersToUpsert, { onConflict: 'id' });
    }

    // Sync rounds and games
    for (const round of state.rounds) {
      // Get or create round
      const { data: existingRound } = await supabase
        .from('rounds')
        .select('id')
        .eq('round_number', round.number)
        .single();

      let roundId: string;

      if (existingRound) {
        roundId = existingRound.id;
        // Update round completion status
        await supabase
          .from('rounds')
          .update({ completed: round.completed })
          .eq('id', roundId);
      } else {
        // Create new round
        const { data: newRound } = await supabase
          .from('rounds')
          .insert({ round_number: round.number, completed: round.completed })
          .select('id')
          .single();
        
        roundId = newRound!.id;
      }

      // Upsert games
      if (round.games.length > 0) {
        const gamesToUpsert = round.games.map(g => ({
          id: g.id,
          round_id: roundId,
          round_number: g.roundNumber,
          white_player_id: g.whitePlayerId,
          black_player_id: g.blackPlayerId,
          white_sheriff_used: g.sheriffUsage.white,
          black_sheriff_used: g.sheriffUsage.black,
          result: g.result,
          bounty_transferred: g.bountyTransfer,
          completed: g.completed,
        }));

        await supabase
          .from('games')
          .upsert(gamesToUpsert, { onConflict: 'id' });
      }
    }
  } catch (error) {
    console.error('Error saving tournament state:', error);
    throw error;
  }
}

/**
 * Initialize tournament with players
 */
export function initializeTournament(players: Player[]): TournamentState {
  return {
    players,
    rounds: [],
    currentRound: 0,
    totalRounds: 9,
    tournamentStarted: false,
  };
}

/**
 * Start a new round
 */
export function startNewRound(state: TournamentState): TournamentState {
  const nextRoundNumber = state.currentRound + 1;
  
  if (nextRoundNumber > state.totalRounds) {
    throw new Error('Tournament is already complete');
  }

  const games = generateSwissPairings(state.players, nextRoundNumber);
  
  const newRound: Round = {
    number: nextRoundNumber,
    games,
    completed: false,
  };

  return {
    ...state,
    rounds: [...state.rounds, newRound],
    currentRound: nextRoundNumber,
  };
}

/**
 * Submit game result
 */
export function submitGameResult(
  state: TournamentState,
  gameId: string,
  result: GameResult,
  sheriffUsage: SheriffUsage
): TournamentState {
  const currentRound = state.rounds[state.currentRound - 1];
  if (!currentRound) {
    throw new Error('No active round');
  }

  const gameIndex = currentRound.games.findIndex(g => g.id === gameId);
  if (gameIndex === -1) {
    throw new Error('Game not found');
  }

  const game = currentRound.games[gameIndex];
  if (game.completed) {
    throw new Error('Game already completed');
  }

  // Handle BYE games (already completed in pairing)
  if (game.blackPlayerId === 0) {
    return state;
  }

  const whitePlayer = state.players.find(p => p.id === game.whitePlayerId);
  const blackPlayer = state.players.find(p => p.id === game.blackPlayerId);

  if (!whitePlayer || !blackPlayer) {
    throw new Error('Players not found');
  }

  // Determine winner and loser
  let winner: Player | null = null;
  let loser: Player | null = null;

  if (result === 'white') {
    winner = whitePlayer;
    loser = blackPlayer;
  } else if (result === 'black') {
    winner = blackPlayer;
    loser = whitePlayer;
  }

  // Calculate bounty transfer
  const bountyCalc = winner && loser
    ? calculateBountyTransfer(winner, loser, sheriffUsage, currentRound.number, result)
    : {
        bountyTransfer: 0,
        winnerBountyChange: 0,
        loserBountyChange: 0,
        winnerCriminalStatus: whitePlayer.criminalStatus,
        loserCriminalStatus: blackPlayer.criminalStatus,
      };

  // Update players
  const updatedPlayers = state.players.map(player => {
    if (player.id === whitePlayer.id) {
      const updates: Partial<Player> = {
        opponentIds: [...player.opponentIds, blackPlayer.id],
      };

      if (result === 'white') {
        updates.wins = player.wins + 1;
        updates.bounty = player.bounty + bountyCalc.winnerBountyChange;
        updates.criminalStatus = bountyCalc.winnerCriminalStatus;
        if (sheriffUsage.white) updates.hasSheriffBadge = false;
      } else if (result === 'black') {
        updates.losses = player.losses + 1;
        updates.bounty = player.bounty + bountyCalc.loserBountyChange;
        updates.criminalStatus = bountyCalc.loserCriminalStatus;
        if (sheriffUsage.white) updates.hasSheriffBadge = false;
      } else {
        updates.draws = player.draws + 1;
      }

      return { ...player, ...updates };
    }

    if (player.id === blackPlayer.id) {
      const updates: Partial<Player> = {
        opponentIds: [...player.opponentIds, whitePlayer.id],
      };

      if (result === 'black') {
        updates.wins = player.wins + 1;
        updates.bounty = player.bounty + bountyCalc.winnerBountyChange;
        updates.criminalStatus = bountyCalc.winnerCriminalStatus;
        if (sheriffUsage.black) updates.hasSheriffBadge = false;
      } else if (result === 'white') {
        updates.losses = player.losses + 1;
        updates.bounty = player.bounty + bountyCalc.loserBountyChange;
        updates.criminalStatus = bountyCalc.loserCriminalStatus;
        if (sheriffUsage.black) updates.hasSheriffBadge = false;
      } else {
        updates.draws = player.draws + 1;
      }

      return { ...player, ...updates };
    }

    return player;
  });

  // Update game
  const updatedGames = [...currentRound.games];
  updatedGames[gameIndex] = {
    ...game,
    result,
    sheriffUsage: {
      white: sheriffUsage.white,
      black: sheriffUsage.black,
    },
    bountyTransfer: bountyCalc.bountyTransfer,
    completed: true,
  };

  // Check if round is complete
  const roundComplete = updatedGames.every(g => g.completed);

  const updatedRounds = [...state.rounds];
  updatedRounds[state.currentRound - 1] = {
    ...currentRound,
    games: updatedGames,
    completed: roundComplete,
  };

  return {
    ...state,
    players: updatedPlayers,
    rounds: updatedRounds,
  };
}

/**
 * Clear all tournament data
 */
export async function clearTournamentData(): Promise<void> {
  try {
    // Delete all games (will cascade delete due to foreign key)
    await supabase.from('games').delete().neq('id', '');
    
    // Delete all rounds
    await supabase.from('rounds').delete().neq('id', '');
    
    // Delete all players
    await supabase.from('players').delete().neq('id', 0);
    
    // Reset tournament
    await supabase
      .from('tournament')
      .update({
        current_round: 0,
        total_rounds: 9,
        tournament_started: false,
      })
      .eq('id', TOURNAMENT_ID);
  } catch (error) {
    console.error('Error clearing tournament data:', error);
    throw error;
  }
}

/**
 * Export tournament data as JSON
 */
export function exportTournamentData(state: TournamentState): string {
  return JSON.stringify(state, null, 2);
}

/**
 * Import tournament data from JSON
 */
export function importTournamentData(jsonData: string): TournamentState {
  return JSON.parse(jsonData);
}

