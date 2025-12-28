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

    // Load rounds
    const { data: roundsData, error: roundsError } = await supabase
      .from('rounds')
      .select('*')
      .order('round_number');

    if (roundsError) throw roundsError;

    // Load all games separately
    const { data: gamesData, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .order('round_number');

    if (gamesError) throw gamesError;

    console.log(`📥 Loaded ${(roundsData || []).length} rounds and ${(gamesData || []).length} games from Supabase`);

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
      colorHistory: (p.color_history as ('W' | 'B' | 'BYE')[]) || [],
    }));

    // Group games by round number
    const gamesByRound = new Map<number, any[]>();
    (gamesData || []).forEach(g => {
      if (!gamesByRound.has(g.round_number)) {
        gamesByRound.set(g.round_number, []);
      }
      gamesByRound.get(g.round_number)!.push(g);
    });

    const rounds: Round[] = (roundsData || []).map(r => {
      const roundGames = gamesByRound.get(r.round_number) || [];
      console.log(`📥 Round ${r.round_number}: ${roundGames.length} games`);
      return {
        number: r.round_number,
        games: roundGames.map((g: any) => ({
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
      };
    });

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
    console.log('💾 Saving tournament state...', {
      players: state.players.length,
      currentRound: state.currentRound,
      tournamentStarted: state.tournamentStarted,
    });

    // Update tournament metadata
    const { data: tournamentData, error: tournamentError } = await supabase
      .from('tournament')
      .update({
        current_round: state.currentRound,
        total_rounds: state.totalRounds,
        tournament_started: state.tournamentStarted,
      })
      .eq('id', TOURNAMENT_ID)
      .select();

    if (tournamentError) {
      console.error('❌ Error updating tournament:', tournamentError);
      throw tournamentError;
    }

    console.log('✅ Tournament updated:', tournamentData);

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
        color_history: p.colorHistory,
      }));

      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .upsert(playersToUpsert, { onConflict: 'id' })
        .select();

      if (playersError) {
        console.error('❌ Error upserting players:', playersError);
        throw playersError;
      }

      console.log(`✅ ${playersData?.length || 0} players saved to database`);
    }

    // Sync rounds and games
    for (const round of state.rounds) {
      console.log(`💾 Saving Round ${round.number} with ${round.games.length} games`);
      
      // Get or create round
      const { data: existingRound, error: existingRoundError } = await supabase
        .from('rounds')
        .select('id')
        .eq('round_number', round.number)
        .single();

      if (existingRoundError && existingRoundError.code !== 'PGRST116') {
        console.error('Error checking existing round:', existingRoundError);
      }

      let roundId: string;

      if (existingRound) {
        roundId = existingRound.id;
        console.log(`✓ Round ${round.number} already exists with ID: ${roundId}`);
        // Update round completion status
        const { error: updateError } = await supabase
          .from('rounds')
          .update({ completed: round.completed })
          .eq('id', roundId);
        
        if (updateError) {
          console.error('Error updating round:', updateError);
          throw updateError;
        }
      } else {
        // Create new round
        console.log(`➕ Creating new Round ${round.number}`);
        const { data: newRound, error: insertError } = await supabase
          .from('rounds')
          .insert({ round_number: round.number, completed: round.completed })
          .select('id')
          .single();
        
        if (insertError) {
          console.error('Error creating round:', insertError);
          throw insertError;
        }
        
        roundId = newRound!.id;
        console.log(`✓ Created Round ${round.number} with ID: ${roundId}`);
      }

      // Upsert games
      if (round.games.length > 0) {
        console.log(`💾 Upserting ${round.games.length} games for Round ${round.number}`);
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

        const { error: gamesError } = await supabase
          .from('games')
          .upsert(gamesToUpsert, { onConflict: 'id' });
        
        if (gamesError) {
          console.error('Error upserting games:', gamesError);
          throw gamesError;
        }
        
        console.log(`✓ Successfully saved ${round.games.length} games`);
      } else {
        console.log(`⚠️ Round ${round.number} has no games to save`);
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
  
  console.log(`🎮 Generated ${games.length} games for Round ${nextRoundNumber}:`, games);
  
  // Handle BYE games - update player color history immediately
  const updatedPlayers = state.players.map(player => {
    const byeGame = games.find(g => g.blackPlayerId === 0 && g.whitePlayerId === player.id);
    if (byeGame) {
      // Player has a BYE, add to color history and update stats
      return {
        ...player,
        colorHistory: [...player.colorHistory, 'BYE' as const],
        wins: player.wins + 1, // BYE counts as a win
        opponentIds: [...player.opponentIds], // No opponent for BYE
      };
    }
    return player;
  });
  
  const newRound: Round = {
    number: nextRoundNumber,
    games,
    completed: false,
  };

  return {
    ...state,
    players: updatedPlayers,
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
        colorHistory: [...player.colorHistory, 'W' as const], // Record white color
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
        colorHistory: [...player.colorHistory, 'B' as const], // Record black color
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
 * Reset tournament but keep players (reset their stats to initial state)
 */
export async function resetTournamentKeepPlayers(): Promise<void> {
  try {
    console.log('🔄 Resetting tournament (keeping players)...');
    
    // Delete all games
    await supabase.from('games').delete().neq('id', '');
    
    // Delete all rounds
    await supabase.from('rounds').delete().neq('id', '');
    
    // Reset all players to initial state (20 bounty, sheriff badge, 0-0-0 record)
    const { data: players } = await supabase.from('players').select('id');
    
    if (players && players.length > 0) {
      await supabase
        .from('players')
        .update({
          bounty: 20,
          wins: 0,
          losses: 0,
          draws: 0,
          has_sheriff_badge: true,
          criminal_status: 'normal',
          opponent_ids: [],
          color_history: [],
        })
        .in('id', players.map(p => p.id));
    }
    
    // Reset tournament status
    await supabase
      .from('tournament')
      .update({
        current_round: 0,
        total_rounds: 9,
        tournament_started: false,
      })
      .eq('id', TOURNAMENT_ID);
      
    console.log('✅ Tournament reset complete (players kept)');
  } catch (error) {
    console.error('❌ Error resetting tournament:', error);
    throw error;
  }
}

/**
 * Clear all tournament data (DELETE EVERYTHING)
 */
export async function clearTournamentData(): Promise<void> {
  try {
    console.log('🗑️ Clearing ALL tournament data...');
    
    // Delete all games
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
      
    console.log('✅ All data cleared');
  } catch (error) {
    console.error('❌ Error clearing tournament data:', error);
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

