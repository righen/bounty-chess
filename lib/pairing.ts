import { Player, Game } from '@/types';

/**
 * Calculate points for a player (1 for win, 0.5 for draw, 0 for loss)
 */
function getPoints(player: Player): number {
  return player.wins + (player.draws * 0.5);
}

/**
 * Generate Swiss pairings following standard Swiss rules
 * Round 1: Alphabetical order, then top half vs bottom half
 * Rounds 2+: By points (wins/draws), with bounty as tiebreaker
 * - No repeat opponents (standard Swiss rule)
 * - Handle odd number of players with a bye
 * - Player with bye gets automatic win (1-0) but no bounty gain
 */
export function generateSwissPairings(
  players: Player[],
  roundNumber: number
): Game[] {
  const games: Game[] = [];
  
  // Sort players based on round number
  const sortedPlayers = [...players].sort((a, b) => {
    if (roundNumber === 1) {
      // Round 1: Alphabetical by surname, then name
      const surnameCompare = a.surname.localeCompare(b.surname);
      if (surnameCompare !== 0) return surnameCompare;
      return a.name.localeCompare(b.name);
    } else {
      // Rounds 2+: By points, then bounty, then wins
      const pointsA = getPoints(a);
      const pointsB = getPoints(b);
      
      if (pointsB !== pointsA) {
        return pointsB - pointsA; // Higher points first
      }
      if (b.bounty !== a.bounty) {
        return b.bounty - a.bounty; // Higher bounty as tiebreaker
      }
      return b.wins - a.wins; // More wins as final tiebreaker
    }
  });

  const paired = new Set<number>();
  
  // Round 1: Use top-half vs bottom-half pairing
  if (roundNumber === 1) {
    const halfPoint = Math.ceil(sortedPlayers.length / 2);
    
    for (let i = 0; i < halfPoint; i++) {
      const player1 = sortedPlayers[i];
      const player2Index = i + halfPoint;
      
      if (paired.has(player1.id)) continue;
      
      // Check if there's a player in the bottom half
      if (player2Index < sortedPlayers.length) {
        const player2 = sortedPlayers[player2Index];
        
        // Pair them
        paired.add(player1.id);
        paired.add(player2.id);
        
        games.push({
          id: `R${roundNumber}-${player1.id}-${player2.id}`,
          roundNumber,
          whitePlayerId: player1.id,
          blackPlayerId: player2.id,
          result: null,
          sheriffUsage: {
            white: false,
            black: false,
          },
          bountyTransfer: 0,
          completed: false,
        });
      } else {
        // Odd number of players, last player gets BYE
        games.push({
          id: `R${roundNumber}-${player1.id}-BYE`,
          roundNumber,
          whitePlayerId: player1.id,
          blackPlayerId: 0,
          result: 'white',
          sheriffUsage: {
            white: false,
            black: false,
          },
          bountyTransfer: 0,
          completed: true,
        });
        paired.add(player1.id);
      }
    }
  } else {
    // Rounds 2+: Pair players with similar points
    for (let i = 0; i < sortedPlayers.length; i++) {
      const player1 = sortedPlayers[i];
      
      // Skip if already paired
      if (paired.has(player1.id)) continue;
      
      // Find best opponent (next available player they haven't played)
      let opponent: Player | null = null;
      
      for (let j = i + 1; j < sortedPlayers.length; j++) {
        const player2 = sortedPlayers[j];
        
        // Skip if already paired
        if (paired.has(player2.id)) continue;
        
        // Skip if they've played before
        if (player1.opponentIds.includes(player2.id)) continue;
        
        opponent = player2;
        break;
      }
      
      // If no valid opponent found, try to find any unpaired player they haven't faced
      if (!opponent) {
        for (const player2 of sortedPlayers) {
          if (paired.has(player2.id)) continue;
          if (player2.id === player1.id) continue;
          if (player1.opponentIds.includes(player2.id)) continue;
          
          opponent = player2;
          break;
        }
      }
      
      // If still no opponent, player gets a BYE
      if (!opponent) {
        games.push({
          id: `R${roundNumber}-${player1.id}-BYE`,
          roundNumber,
          whitePlayerId: player1.id,
          blackPlayerId: 0,
          result: 'white',
          sheriffUsage: {
            white: false,
            black: false,
          },
          bountyTransfer: 0,
          completed: true,
        });
        paired.add(player1.id);
        continue;
      }
      
      // Create game
      paired.add(player1.id);
      paired.add(opponent.id);
      
      games.push({
        id: `R${roundNumber}-${player1.id}-${opponent.id}`,
        roundNumber,
        whitePlayerId: player1.id,
        blackPlayerId: opponent.id,
        result: null,
        sheriffUsage: {
          white: false,
          black: false,
        },
        bountyTransfer: 0,
        completed: false,
      });
    }
  }
  
  return games;
}

/**
 * Validate that all pairings are legal
 */
export function validatePairings(games: Game[], players: Player[]): string[] {
  const errors: string[] = [];
  const playerMap = new Map(players.map(p => [p.id, p]));
  
  for (const game of games) {
    const white = playerMap.get(game.whitePlayerId);
    const black = playerMap.get(game.blackPlayerId);
    
    if (!white) {
      errors.push(`White player ${game.whitePlayerId} not found`);
      continue;
    }
    
    if (!black) {
      errors.push(`Black player ${game.blackPlayerId} not found`);
      continue;
    }
    
    // Check if they've played before
    if (white.opponentIds.includes(black.id)) {
      errors.push(`${white.name} and ${black.name} have already played`);
    }
  }
  
  return errors;
}

/**
 * Get player's current standing
 */
export function getPlayerStanding(player: Player): string {
  const totalGames = player.wins + player.losses + player.draws;
  return `${player.wins}-${player.losses}-${player.draws} (${totalGames} games)`;
}

