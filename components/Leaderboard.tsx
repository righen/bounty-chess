'use client';

import { Player } from '@/types';
import { formatBounty, getCriminalStatusColor, getAgeCategory } from '@/lib/utils';

interface LeaderboardProps {
  players: Player[];
  currentRound: number;
  totalRounds: number;
  tournamentStarted: boolean;
  onStartTournament: () => void;
  onGeneratePairing: () => void;
}

export default function Leaderboard({ players, currentRound, totalRounds, tournamentStarted, onStartTournament, onGeneratePairing }: LeaderboardProps) {
  // Sort players by bounty (highest first)
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.bounty !== a.bounty) {
      return b.bounty - a.bounty;
    }
    return b.wins - a.wins;
  });

  const canGenerateNextRound = currentRound < totalRounds && tournamentStarted;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Criminal Leaderboard</h2>
          <p className="text-sm text-gray-400 mt-1">
            Status: <span className={`font-semibold ${tournamentStarted ? 'text-green-400' : 'text-yellow-400'}`}>
              {tournamentStarted ? 'Tournament Started' : 'Not Started Yet'}
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          {!tournamentStarted && (
            <button
              onClick={onStartTournament}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded
                transition-colors text-lg shadow-lg"
            >
              🚀 Start Tournament
            </button>
          )}
          {tournamentStarted && canGenerateNextRound && (
            <button
              onClick={onGeneratePairing}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded
                transition-colors shadow-lg"
            >
              Generate Round {currentRound + 1} Pairing
            </button>
          )}
          {tournamentStarted && !canGenerateNextRound && (
            <div className="text-xl font-bold text-yellow-400">
              Tournament Complete!
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-center">Age</th>
                <th className="px-4 py-3 text-center">Gender</th>
                <th className="px-4 py-3 text-center">Bounty</th>
                <th className="px-4 py-3 text-center">Record</th>
                <th className="px-4 py-3 text-center">Sheriff Badge</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => (
                <tr
                  key={player.id}
                  className={`border-t border-gray-700 ${
                    index < 2 ? 'bg-yellow-900/20' : ''
                  } hover:bg-gray-700/50`}
                >
                  <td className="px-4 py-3">
                    <span className={`font-bold ${index < 2 ? 'text-yellow-400' : ''}`}>
                      #{index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{player.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{player.name} {player.surname}</div>
                    <div className="text-sm text-gray-400">{player.currentAddress}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-sm font-semibold ${
                        player.age < 10 ? 'text-blue-400' :
                        player.age < 16 ? 'text-green-400' :
                        'text-gray-400'
                      }`}>
                        {player.age}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold ${getAgeCategory(player.age).color}`}>
                        {getAgeCategory(player.age).label}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-semibold ${
                      player.gender === 'F' ? 'text-pink-400' : 'text-blue-400'
                    }`}>
                      {player.gender === 'F' ? 'Female' : 'Male'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xl font-bold text-yellow-400">
                      {formatBounty(player.bounty)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-sm">
                      <span className="text-green-400">{player.wins}W</span>
                      {' - '}
                      <span className="text-red-400">{player.losses}L</span>
                      {' - '}
                      <span className="text-gray-400">{player.draws}D</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {player.hasSheriffBadge ? (
                      <span className="text-2xl">🛡️</span>
                    ) : (
                      <span className="text-gray-600">✗</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold uppercase ${getCriminalStatusColor(
                        player.criminalStatus
                      )} text-white`}
                    >
                      {player.criminalStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Tournament Stats</h3>
          <div className="space-y-1 text-sm">
            <div>Total Players: <span className="font-bold">{players.length}</span></div>
            <div>Rounds Completed: <span className="font-bold">{currentRound}</span></div>
            <div>Rounds Remaining: <span className="font-bold">{Math.max(0, (totalRounds || 9) - currentRound)}</span></div>
            <div>Active Sheriff Badges: <span className="font-bold">{players.filter(p => p.hasSheriffBadge).length}</span></div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Protection Legend</h3>
          <div className="space-y-1 text-sm">
            <div><span className="text-blue-400">Blue</span>: U10 (lose 1/4)</div>
            <div><span className="text-green-400">Green</span>: U16 (lose 1/3)</div>
            <div><span className="text-pink-400">Pink</span>: Women (lose 1/3)</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Criminal Status</h3>
          <div className="space-y-1 text-sm">
            <div><span className="text-green-400">●</span> Normal</div>
            <div><span className="text-orange-400">●</span> Angry (1 sheriff used)</div>
            <div><span className="text-red-400">●</span> Mad (2+ sheriffs, immune)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

