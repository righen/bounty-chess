import { supabase } from './supabase';
import { pairRound, pairRound1Alphabetical } from './fide-swiss-pairing';
import { getTournamentRegistrations, RegistrationWithPlayer } from './registration-store';
import { Tournament } from './tournament-store';
import { Player } from '@/types';

export interface Round {
  id: number | string; // Can be SERIAL (number) or UUID (string) depending on schema
  tournament_id: string;
  round_number: number;
  completed: boolean;
  pairing_generated_at: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface Game {
  id: string;
  tournament_id: string;
  round_id: number | string; // Can be SERIAL (number) or UUID (string) depending on schema
  round_number: number;
  board_number: number;
  white_player_id: number;
  black_player_id: number | null;
  result: 'white_win' | 'black_win' | 'draw' | 'forfeit_white' | 'forfeit_black' | 'bye' | null;
  white_sheriff_used: boolean;
  black_sheriff_used: boolean;
  bounty_transferred: number;
  completed: boolean;
  entered_at: string | null;
}

/**
 * Start tournament - Generate Round 1
 */
export async function startTournament(tournamentId: string): Promise<{ round: Round; games: Game[] }> {
  try {
    console.log('Starting tournament:', tournamentId);
    
    // 1. Get tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (tournamentError) {
      console.error('Error fetching tournament:', tournamentError);
      throw tournamentError;
    }

    console.log('Tournament found:', tournament?.name);

    // 2. Get all checked-in players
    console.log('Fetching registrations...');
    const registrations = await getTournamentRegistrations(tournamentId);
    const checkedInPlayers = registrations.filter(r => r.checked_in);

    console.log(`Found ${checkedInPlayers.length} checked-in players`);

    if (checkedInPlayers.length < 2) {
      throw new Error('Need at least 2 checked-in players to start tournament');
    }

    // 3. Create Round 1
    console.log('Creating Round 1...');
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .insert([{
        tournament_id: tournamentId,
        round_number: 1,
        completed: false,
        pairing_generated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (roundError) {
      console.error('Error creating round:', roundError);
      throw roundError;
    }

    console.log('Round 1 created:', round.id);

    // 4. Generate pairings using FIDE Swiss system
    console.log('Generating pairings...');
    const pairingResult = await generateRoundPairings(
      tournamentId,
      round.id,
      1,
      checkedInPlayers,
      tournament as Tournament
    );

    console.log(`Generated ${pairingResult.games.length} games`);

    // 5. Update tournament status
    console.log('Updating tournament status...');
    const { error: updateError } = await supabase
      .from('tournaments')
      .update({
        status: 'in_progress',
        current_round: 1,
        tournament_started: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tournamentId);

    if (updateError) {
      console.error('Error updating tournament:', updateError);
      throw updateError;
    }

    console.log('Tournament started successfully!');
    return {
      round,
      games: pairingResult.games,
    };
  } catch (error) {
    console.error('Error starting tournament:', error);
    throw error;
  }
}

/**
 * Convert RegistrationWithPlayer to Player format for FIDE pairing
 */
function registrationToPlayer(reg: RegistrationWithPlayer, tournament: Tournament): Player {
  // Get tournament state from registration (if available) or use defaults
  const regAny = reg as any;
  
  return {
    id: reg.player_id || reg.player_pool_id,
    name: reg.player.name,
    surname: reg.player.surname,
    birthdate: reg.player.birthdate || '',
    currentAddress: reg.player.phone || '',
    meal: '',
    paymentProof: '',
    transferName: '',
    age: reg.player.age || 0,
    gender: (reg.player.gender as 'M' | 'F') || 'M',
    bounty: tournament.initial_bounty || 0,
    hasSheriffBadge: regAny.has_sheriff_badge || false,
    criminalStatus: (regAny.criminal_status as 'normal' | 'angry' | 'mad') || 'normal',
    wins: regAny.wins || 0,
    losses: regAny.losses || 0,
    draws: regAny.draws || 0,
    opponentIds: regAny.opponent_ids || [],
    colorHistory: (regAny.color_history as ('W' | 'B' | 'BYE')[]) || [],
  };
}

/**
 * Generate pairings for a round using FIDE Swiss system
 */
export async function generateRoundPairings(
  tournamentId: string,
  roundId: number | string, // Can be SERIAL or UUID
  roundNumber: number,
  players: RegistrationWithPlayer[],
  tournament: Tournament
): Promise<{ games: Game[] }> {
  try {
    console.log(`Generating pairings for Round ${roundNumber}, ${players.length} players`);
    
    // Convert registrations to Player format
    const fidePlayers: Player[] = players.map(reg => registrationToPlayer(reg, tournament));
    console.log(`Converted ${fidePlayers.length} players to FIDE format`);

    // Generate pairings using FIDE Swiss system
    let pairingResult;
    if (roundNumber === 1) {
      // Round 1: Alphabetical pairing
      console.log('Using Round 1 alphabetical pairing');
      pairingResult = pairRound1Alphabetical(fidePlayers);
    } else {
      // Subsequent rounds: FIDE Swiss pairing
      console.log('Using FIDE Swiss pairing');
      pairingResult = pairRound(fidePlayers, roundNumber, tournament.total_rounds);
    }

    console.log('Pairing result:', { success: pairingResult.success, games: pairingResult.games.length, method: pairingResult.method });

    if (!pairingResult.success) {
      throw new Error(`Pairing failed: ${pairingResult.method}`);
    }

    if (!pairingResult.games || pairingResult.games.length === 0) {
      throw new Error('Pairing succeeded but no games were generated');
    }

    // Create games in database
    console.log(`Creating ${pairingResult.games.length} games in database...`);
    const games: Game[] = [];
    for (let i = 0; i < pairingResult.games.length; i++) {
      const fideGame = pairingResult.games[i];
      
      // Determine result type for database
      let result: 'white_win' | 'black_win' | 'draw' | 'forfeit_white' | 'forfeit_black' | 'bye' | null = null;
      if (fideGame.blackPlayerId === 0) {
        result = 'bye';
      } else if (fideGame.result === 'white') {
        result = 'white_win';
      } else if (fideGame.result === 'black') {
        result = 'black_win';
      } else if (fideGame.result === 'draw') {
        result = 'draw';
      }

      try {
        const { data: game, error: gameError } = await supabase
          .from('games')
          .insert([{
            tournament_id: tournamentId,
            round_id: roundId,
            round_number: roundNumber,
            board_number: i + 1,
            white_player_id: fideGame.whitePlayerId,
            black_player_id: fideGame.blackPlayerId === 0 ? null : fideGame.blackPlayerId,
            result: result,
            white_sheriff_used: fideGame.sheriffUsage?.white || false,
            black_sheriff_used: fideGame.sheriffUsage?.black || false,
            bounty_transferred: fideGame.bountyTransfer || 0,
            completed: fideGame.completed || false,
          }])
          .select()
          .single();

        if (gameError) {
          console.error(`Error creating game ${i + 1}:`, gameError);
          throw gameError; // Don't continue, throw to see the error
        }

        games.push(game as Game);
      } catch (gameErr) {
        console.error(`Failed to create game ${i + 1} (Board ${i + 1}):`, gameErr);
        throw gameErr; // Re-throw to stop the process
      }
    }

    console.log(`Successfully created ${games.length} games`);
    return { games };
  } catch (error) {
    console.error('Error generating pairings:', error);
    throw error;
  }
}

/**
 * Calculate player scores from completed games
 */
async function calculatePlayerScores(tournamentId: string): Promise<Map<number, { wins: number; draws: number; losses: number; score: number }>> {
  const scores = new Map<number, { wins: number; draws: number; losses: number; score: number }>();

  const { data: games, error } = await supabase
    .from('games')
    .select('white_player_id, black_player_id, result')
    .eq('tournament_id', tournamentId)
    .eq('completed', true);

  if (error) throw error;

  for (const game of games || []) {
    if (!game.result) continue;

    // Initialize if not exists
    if (!scores.has(game.white_player_id)) {
      scores.set(game.white_player_id, { wins: 0, draws: 0, losses: 0, score: 0 });
    }
    if (game.black_player_id && !scores.has(game.black_player_id)) {
      scores.set(game.black_player_id, { wins: 0, draws: 0, losses: 0, score: 0 });
    }

    const whiteScore = scores.get(game.white_player_id)!;
    const blackScore = game.black_player_id ? scores.get(game.black_player_id)! : null;

    if (game.result === 'white_win' || game.result === 'forfeit_white') {
      whiteScore.wins++;
      whiteScore.score += 1;
      if (blackScore) {
        blackScore.losses++;
      }
    } else if (game.result === 'black_win' || game.result === 'forfeit_black') {
      if (blackScore) {
        blackScore.wins++;
        blackScore.score += 1;
      }
      whiteScore.losses++;
    } else if (game.result === 'draw') {
      whiteScore.draws++;
      whiteScore.score += 0.5;
      if (blackScore) {
        blackScore.draws++;
        blackScore.score += 0.5;
      }
    } else if (game.result === 'bye') {
      whiteScore.wins++;
      whiteScore.score += 1;
    }
  }

  return scores;
}

/**
 * Generate next round pairings
 */
export async function generateNextRound(tournamentId: string): Promise<{ round: Round; games: Game[] }> {
  try {
    // 1. Get tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (tournamentError) throw tournamentError;

    const currentRound = tournament.current_round;
    const nextRound = currentRound + 1;

    if (nextRound > tournament.total_rounds) {
      throw new Error('Tournament has reached maximum rounds');
    }

    // 2. Check if current round is completed
    const { data: currentRoundData } = await supabase
      .from('rounds')
      .select('completed')
      .eq('tournament_id', tournamentId)
      .eq('round_number', currentRound)
      .single();

    if (!currentRoundData?.completed) {
      throw new Error('Current round must be completed before generating next round');
    }

    // 3. Get all active players (checked-in, not withdrawn)
    const registrations = await getTournamentRegistrations(tournamentId);
    const activePlayers = registrations.filter(r => {
      const regAny = r as any;
      return r.checked_in && !regAny.withdrawn;
    });

    if (activePlayers.length < 2) {
      throw new Error('Need at least 2 active players to generate pairings');
    }

    // 4. Calculate scores and update registrations
    const scores = await calculatePlayerScores(tournamentId);
    
      // Update registrations with scores and opponent history
      for (const reg of activePlayers) {
        const playerId = reg.player_id || reg.player_pool_id;
        const playerScore = scores.get(playerId) || { wins: 0, draws: 0, losses: 0, score: 0 };
        
        // Get opponent history from games
        const { data: playerGames } = await supabase
          .from('games')
          .select('white_player_id, black_player_id')
          .eq('tournament_id', tournamentId)
          .or(`white_player_id.eq.${playerId},black_player_id.eq.${playerId}`);

        const opponentIds = new Set<number>();
        for (const game of playerGames || []) {
          if (game.white_player_id === playerId && game.black_player_id) {
            opponentIds.add(game.black_player_id);
          } else if (game.black_player_id === playerId) {
            opponentIds.add(game.white_player_id);
          }
        }

        // Get color history
        const { data: playerGamesWithColors } = await supabase
          .from('games')
          .select('white_player_id, black_player_id, round_number')
          .eq('tournament_id', tournamentId)
          .or(`white_player_id.eq.${playerId},black_player_id.eq.${playerId}`)
          .order('round_number');

        const colorHistory: ('W' | 'B' | 'BYE')[] = [];
        for (const game of playerGamesWithColors || []) {
          if (game.black_player_id === 0 || game.black_player_id === null) {
            colorHistory.push('BYE');
          } else if (game.white_player_id === playerId) {
            colorHistory.push('W');
          } else {
            colorHistory.push('B');
          }
        }

        // Update registration (using any to access fields that may exist in DB but not in TS interface)
        const updateData: any = {
          wins: playerScore.wins,
          draws: playerScore.draws,
          losses: playerScore.losses,
          opponent_ids: Array.from(opponentIds),
          color_history: colorHistory,
          updated_at: new Date().toISOString(),
        };
        
        await supabase
          .from('tournament_registrations')
          .update(updateData)
          .eq('id', reg.id);
      }

    // 5. Create next round
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .insert([{
        tournament_id: tournamentId,
        round_number: nextRound,
        completed: false,
        pairing_generated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (roundError) throw roundError;

    // 6. Reload registrations with updated scores
    const updatedRegistrations = await getTournamentRegistrations(tournamentId);
    const activeUpdatedPlayers = updatedRegistrations.filter(r => {
      const regAny = r as any;
      return r.checked_in && !regAny.withdrawn;
    });

    // 7. Generate pairings
    const pairingResult = await generateRoundPairings(
      tournamentId,
      round.id,
      nextRound,
      activeUpdatedPlayers,
      tournament as Tournament
    );

    // 8. Update tournament
    await supabase
      .from('tournaments')
      .update({
        current_round: nextRound,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tournamentId);

    return {
      round,
      games: pairingResult.games,
    };
  } catch (error) {
    console.error('Error generating next round:', error);
    throw error;
  }
}

/**
 * Get current round games
 */
export async function getRoundGames(tournamentId: string, roundNumber: number): Promise<Game[]> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('round_number', roundNumber)
      .order('board_number');

    if (error) throw error;
    return (data || []) as Game[];
  } catch (error) {
    console.error('Error getting round games:', error);
    throw error;
  }
}

/**
 * Get current round
 */
export async function getCurrentRound(tournamentId: string): Promise<Round | null> {
  try {
    const { data, error } = await supabase
      .from('rounds')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('completed', false)
      .order('round_number', { ascending: false })
      .limit(1)
      .maybeSingle(); // Use maybeSingle instead of single to handle no rows

    if (error) throw error;
    return data as Round | null;
  } catch (error) {
    console.error('Error getting current round:', error);
    throw error;
  }
}

/**
 * Complete current round
 */
export async function completeRound(tournamentId: string, roundNumber: number): Promise<void> {
  try {
    // Mark round as completed
    await supabase
      .from('rounds')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('tournament_id', tournamentId)
      .eq('round_number', roundNumber);

    // Update tournament current round
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('total_rounds')
      .eq('id', tournamentId)
      .single();

    if (tournament && roundNumber >= tournament.total_rounds) {
      // Tournament completed
      await supabase
        .from('tournaments')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', tournamentId);
    }
  } catch (error) {
    console.error('Error completing round:', error);
    throw error;
  }
}

