import { Player, SheriffUsage, GameResult } from '@/types';

export interface BountyCalculationResult {
  bountyTransfer: number;
  winnerBountyChange: number;
  loserBountyChange: number;
  winnerCriminalStatus: 'normal' | 'angry' | 'mad';
  loserCriminalStatus: 'normal' | 'angry' | 'mad';
}

/**
 * Calculate bounty transfer based on game result and all tournament rules
 */
export function calculateBountyTransfer(
  winner: Player,
  loser: Player,
  sheriffUsage: SheriffUsage,
  roundNumber: number,
  result: GameResult
): BountyCalculationResult {
  // Handle draw - no bounty transfer
  if (result === 'draw') {
    return {
      bountyTransfer: 0,
      winnerBountyChange: 0,
      loserBountyChange: 0,
      winnerCriminalStatus: winner.criminalStatus,
      loserCriminalStatus: loser.criminalStatus,
    };
  }

  const winnerUsedSheriff = 
    (result === 'white' && sheriffUsage.white) || 
    (result === 'black' && sheriffUsage.black);
  
  const loserUsedSheriff = 
    (result === 'white' && sheriffUsage.black) || 
    (result === 'black' && sheriffUsage.white);

  // Both used sheriff - they cancel out, normal game
  if (winnerUsedSheriff && loserUsedSheriff) {
    const normalTransfer = calculateNormalBountyLoss(loser, roundNumber);
    return {
      bountyTransfer: normalTransfer,
      winnerBountyChange: normalTransfer,
      loserBountyChange: -normalTransfer,
      winnerCriminalStatus: winner.criminalStatus,
      loserCriminalStatus: loser.criminalStatus,
    };
  }

  // Loser used sheriff - protection (unless winner is mad)
  if (loserUsedSheriff) {
    // Mad criminals are immune to opponent's sheriff protection
    if (winner.criminalStatus === 'mad') {
      // Sheriff doesn't work against mad criminals - normal game
      const normalTransfer = calculateNormalBountyLoss(loser, roundNumber);
      return {
        bountyTransfer: normalTransfer,
        winnerBountyChange: normalTransfer,
        loserBountyChange: -normalTransfer,
        winnerCriminalStatus: winner.criminalStatus,
        loserCriminalStatus: loser.criminalStatus,
      };
    }
    
    // Sheriff works - loser is protected, no bounty lost
    // Update winner's criminal status (sheriff was used against them)
    const newWinnerStatus = updateCriminalStatus(winner.criminalStatus);
    
    return {
      bountyTransfer: 0,
      winnerBountyChange: 0,
      loserBountyChange: 0,
      winnerCriminalStatus: newWinnerStatus,
      loserCriminalStatus: loser.criminalStatus,
    };
  }

  // Calculate base bounty loss for loser
  let bountyLoss = calculateNormalBountyLoss(loser, roundNumber);

  // Winner used sheriff - steal 1.5x (unless loser is mad)
  if (winnerUsedSheriff) {
    // Mad criminals are immune to opponent's sheriff effects
    if (loser.criminalStatus === 'mad') {
      // Sheriff doesn't boost against mad criminals - normal steal
      // But sheriff is still used (lost)
      const newLoserStatus = updateCriminalStatus(loser.criminalStatus);
      return {
        bountyTransfer: bountyLoss,
        winnerBountyChange: bountyLoss,
        loserBountyChange: -bountyLoss,
        winnerCriminalStatus: winner.criminalStatus,
        loserCriminalStatus: newLoserStatus,
      };
    }
    
    // Sheriff works - steal 1.5x
    const boostedLoss = Math.floor(bountyLoss * 1.5);
    
    // Update loser's criminal status (sheriff was used against them)
    const newLoserStatus = updateCriminalStatus(loser.criminalStatus);
    
    return {
      bountyTransfer: boostedLoss,
      winnerBountyChange: boostedLoss,
      loserBountyChange: -boostedLoss,
      winnerCriminalStatus: winner.criminalStatus,
      loserCriminalStatus: newLoserStatus,
    };
  }

  // Normal game - no sheriff used
  return {
    bountyTransfer: bountyLoss,
    winnerBountyChange: bountyLoss,
    loserBountyChange: -bountyLoss,
    winnerCriminalStatus: winner.criminalStatus,
    loserCriminalStatus: loser.criminalStatus,
  };
}

/**
 * Calculate normal bounty loss (without sheriff effects)
 */
function calculateNormalBountyLoss(loser: Player, roundNumber: number): number {
  // If bounty is 2 or less, lose everything
  if (loser.bounty <= 2) {
    return loser.bounty;
  }

  // Base loss is half of bounty
  let lossMultiplier = 0.5;

  // Apply protection rules for first 5 rounds only
  if (roundNumber <= 5) {
    // U10 protection - lose only 1/4 (first 5 rounds)
    if (loser.age < 10) {
      lossMultiplier = 0.25;
    }
    // Women and U16 protection - lose only 1/3 (first 5 rounds)
    else if (loser.gender === 'F' || loser.age < 16) {
      lossMultiplier = 1/3;
    }
  }
  // After round 5, everyone loses normal amount (1/2)

  const bountyLoss = loser.bounty * lossMultiplier;
  
  // Round down the amount transferred to lowest whole number
  return Math.floor(bountyLoss);
}

/**
 * Update criminal status when sheriff is used against them
 */
function updateCriminalStatus(currentStatus: 'normal' | 'angry' | 'mad'): 'normal' | 'angry' | 'mad' {
  switch (currentStatus) {
    case 'normal':
      return 'angry';
    case 'angry':
      return 'mad';
    case 'mad':
      return 'mad'; // Stays mad
    default:
      return 'normal';
  }
}

/**
 * Check if a player can use sheriff badge
 */
export function canUseSheriffBadge(player: Player, roundNumber: number): boolean {
  // Sheriff badges are worthless after round 9
  if (roundNumber > 9) {
    return false;
  }
  
  return player.hasSheriffBadge;
}

