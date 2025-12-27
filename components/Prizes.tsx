'use client';

import { Player } from '@/types';
import { formatBounty } from '@/lib/utils';

interface PrizesProps {
  players: Player[];
  currentRound: number;
  totalRounds: number;
}

export default function Prizes({ players, currentRound, totalRounds }: PrizesProps) {
  // Sort by bounty (highest first)
  const sortedByBounty = [...players].sort((a, b) => {
    if (b.bounty !== a.bounty) return b.bounty - a.bounty;
    return b.wins - a.wins;
  });

  // Greatest Criminals (Top 3 by bounty)
  const greatestCriminal = sortedByBounty[0];
  const secondGreatest = sortedByBounty[1];
  const thirdGreatest = sortedByBounty[2];
  const fourthGreatest = sortedByBounty[3];
  const fifthGreatest = sortedByBounty[4];

  // Most Dangerous Lady (Highest bounty female)
  const mostDangerousLady = sortedByBounty.find(p => p.gender === 'F');

  // Youngest player
  const youngestPlayer = [...players].sort((a, b) => {
    if (!a.birthdate || !b.birthdate) return 0;
    return b.birthdate.localeCompare(a.birthdate); // Most recent birthdate
  })[0];

  // Most draws
  const mostDraws = [...players].sort((a, b) => b.draws - a.draws)[0];

  // Most consecutive wins (simplified: most wins)
  const fastestShooter = [...players].sort((a, b) => b.wins - a.wins)[0];

  // Perfect balance (closest to 20 pesos)
  const perfectBalance = [...players].sort((a, b) => {
    return Math.abs(a.bounty - 20) - Math.abs(b.bounty - 20);
  })[0];

  // U12 Boy challenge (highest bounty under 12, male)
  const u12Boys = players.filter(p => p.age < 12 && p.gender === 'M');
  const bornKillerBoy = u12Boys.sort((a, b) => {
    if (b.bounty !== a.bounty) return b.bounty - a.bounty;
    return b.wins - a.wins;
  })[0];

  // U12 Girl challenge (highest bounty under 12, female)
  const u12Girls = players.filter(p => p.age < 12 && p.gender === 'F');
  const bornKillerGirl = u12Girls.sort((a, b) => {
    if (b.bounty !== a.bounty) return b.bounty - a.bounty;
    return b.wins - a.wins;
  })[0];

  // U16 challenge (highest bounty under 16)
  const u16Players = players.filter(p => p.age < 16);
  const futureAssassin = u16Players.sort((a, b) => {
    if (b.bounty !== a.bounty) return b.bounty - a.bounty;
    return b.wins - a.wins;
  })[0];

  // U18 challenge (highest bounty under 18)
  const u18Players = players.filter(p => p.age < 18);
  const youngKiller = u18Players.sort((a, b) => {
    if (b.bounty !== a.bounty) return b.bounty - a.bounty;
    return b.wins - a.wins;
  })[0];

  // Untouchable (least defeats, then lowest bounty)
  const untouchable = [...players].sort((a, b) => {
    if (a.losses !== b.losses) return a.losses - b.losses;
    return a.bounty - b.bounty;
  })[0];

  // Best unknown player (highest bounty with no previous tournament experience - simplified as random mid-ranking)
  const unknownPlayers = sortedByBounty.slice(10, 20);
  const bestUnknown = unknownPlayers[0];

  const renderPlayerCard = (player: Player | undefined, label: string, prize: string) => {
    if (!player) return (
      <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
        <div className="text-sm text-gray-400 mb-2">{prize}</div>
        <div className="font-bold text-lg mb-1">{label}</div>
        <div className="text-gray-500">-</div>
      </div>
    );

    return (
      <div className="bg-gray-800 rounded-lg p-4 border-2 border-yellow-600 hover:border-yellow-500 transition-colors">
        <div className="text-sm text-yellow-400 mb-2 font-semibold">{prize}</div>
        <div className="font-bold text-lg mb-1">{label}</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-semibold">{player.name} {player.surname}</div>
            <div className="text-sm text-gray-400">ID: {player.id} • Age: {player.age} {player.gender}</div>
          </div>
          <div className="text-right">
            <div className="text-yellow-400 font-bold text-xl">{formatBounty(player.bounty)}</div>
            <div className="text-sm text-gray-400">{player.wins}W-{player.losses}L-{player.draws}D</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl mb-6">
        <h2 className="text-3xl font-bold mb-2 text-center">🏆 Trophies & Medals</h2>
        <p className="text-center text-gray-400 mb-6">
          {currentRound === totalRounds ? 'Final Results' : `Preview (Tournament in progress - Round ${currentRound}/${totalRounds})`}
        </p>

        {/* Top Trophies */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-yellow-400">🏆 Main Trophies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderPlayerCard(greatestCriminal, 'Greatest Criminals', '🥇 Trophy Winner')}
            {renderPlayerCard(secondGreatest, 'Greatest Criminals', '🥈 Trophy 2nd Winner')}
          </div>
        </div>

        {/* Bronze Medals */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-orange-400">🥉 Bronze Medals</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderPlayerCard(thirdGreatest, 'Great Criminal 1', '🥉 Bronze')}
            {renderPlayerCard(fourthGreatest, 'Great Criminal 2', '🥉 Bronze')}
            {renderPlayerCard(fifthGreatest, 'Great Criminal 3', '🥉 Bronze')}
          </div>
        </div>

        {/* Special Trophies */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-pink-400">👑 Special Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderPlayerCard(mostDangerousLady, 'Most Dangerous Lady', '🏆 Trophy')}
            {renderPlayerCard(youngestPlayer, 'Too young to be a criminal', '📌 Pins')}
            {renderPlayerCard(mostDraws, 'Dancing between bullets (Most draws)', '📌 Pins')}
            {renderPlayerCard(fastestShooter, 'Fastest Shooter of the east', '📌 Pins')}
            {renderPlayerCard(perfectBalance, 'Perfect balance (Closest to 20₱)', '📌 Pins')}
            {renderPlayerCard(untouchable, 'Untouchable (Least defeats)', '📌 Pins')}
            {renderPlayerCard(bestUnknown, 'Who are you? (Best unknown player)', '📌 Pins')}
          </div>
        </div>

        {/* Gold Medals (Age Categories) */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-yellow-300">🥇 Gold Medals (Age Categories)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderPlayerCard(bornKillerBoy, 'Born killer (U12 Boy challenge)', '🥇 Gold Medal')}
            {renderPlayerCard(bornKillerGirl, 'Born killer (U12 Girl challenge)', '🥇 Gold Medal')}
            {renderPlayerCard(futureAssassin, 'Future assassins (U16 challenge)', '🥇 Gold Medal')}
            {renderPlayerCard(youngKiller, 'Old enough to kill (U18 challenge)', '🥇 Gold Medal')}
          </div>
        </div>

        {/* Participation */}
        <div className="bg-blue-900/30 border-2 border-blue-700 rounded-lg p-4 text-center">
          <div className="text-blue-200 font-semibold text-lg">
            🎖️ Participation Pin: All {players.length} players receive 70 pins
          </div>
        </div>
      </div>
    </div>
  );
}

