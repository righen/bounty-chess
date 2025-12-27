'use client';

import { Player } from '@/types';
import { formatBounty, getAgeCategory } from '@/lib/utils';
import LeaderboardMobile from './LeaderboardMobile';

interface LeaderboardProps {
  players: Player[];
  currentRound: number;
  totalRounds: number;
  tournamentStarted: boolean;
  onStartTournament: () => void;
  onGeneratePairing: () => void;
}

export default function Leaderboard({ 
  players, 
  currentRound, 
  totalRounds, 
  tournamentStarted, 
  onStartTournament, 
  onGeneratePairing 
}: LeaderboardProps) {
  // Sort players by bounty (highest first)
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.bounty !== a.bounty) return b.bounty - a.bounty;
    return b.wins - a.wins;
  });

  const canGenerateNextRound = currentRound < totalRounds && tournamentStarted;

  return (
    <div className="container-custom max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#e2e8f0]">
            🏆 Leaderboard
          </h2>
          <div className="mt-2">
            {tournamentStarted ? (
              <span className="badge badge-success">✓ Tournament Started</span>
            ) : (
              <span className="badge badge-warning">⏸️ Not Started</span>
            )}
          </div>
        </div>
        
        {/* Action Button */}
        <div className="w-full md:w-auto">
          {!tournamentStarted && (
            <button
              onClick={onStartTournament}
              className="bg-[#ffcc33] hover:bg-[#e6b82e] text-[#373542] font-bold px-8 py-4 rounded-lg text-lg transition-colors w-full md:w-auto"
            >
              <span className="text-2xl mr-2">🚀</span>
              Start Tournament
            </button>
          )}
          {tournamentStarted && canGenerateNextRound && (
            <button
              onClick={onGeneratePairing}
              className="bg-[#ffcc33] hover:bg-[#e6b82e] text-[#373542] font-bold px-8 py-4 rounded-lg text-lg transition-colors w-full md:w-auto"
            >
              <span className="text-xl mr-2">▶️</span>
              Generate Round {currentRound + 1}
            </button>
          )}
          {tournamentStarted && !canGenerateNextRound && (
            <div className="text-2xl font-bold text-[#f59e0b] text-center">
              🎉 Tournament Complete!
            </div>
          )}
        </div>
      </div>

      {/* Mobile View (Cards) */}
      <div className="block lg:hidden">
        <LeaderboardMobile players={sortedPlayers} />
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase text-xs tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase text-xs tracking-wider">
                  Player
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 uppercase text-xs tracking-wider">
                  Age
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 uppercase text-xs tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 uppercase text-xs tracking-wider">
                  Bounty
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 uppercase text-xs tracking-wider">
                  Record
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 uppercase text-xs tracking-wider">
                  Sheriff
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 uppercase text-xs tracking-wider">
                  Status
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {sortedPlayers.map((player, index) => {
                const ageCategory = player.age > 0 ? getAgeCategory(player.age) : null;
                const isTop3 = index < 3;
                
                return (
                  <tr
                    key={player.id}
                    className={`
                      border-b border-gray-200 transition-colors hover:bg-gray-50
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    `}
                  >
                    {/* Rank */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {isTop3 ? (
                          <span className="text-2xl font-bold text-[#f59e0b]">
                            #{index + 1}
                          </span>
                        ) : (
                          <span className="text-lg font-semibold text-[#94a3b8]">
                            #{index + 1}
                          </span>
                        )}
                        {isTop3 && <span className="text-xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>}
                      </div>
                    </td>

                    {/* Player Name */}
                    <td className="px-6 py-5">
                      <div>
                        <div className="font-semibold text-lg text-gray-900">
                          {player.name} {player.surname}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          ID: {player.id} • {player.currentAddress || 'No address'}
                        </div>
                      </div>
                    </td>

                    {/* Age */}
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-base font-medium text-gray-900">
                          {player.age > 0 ? player.age : '-'}
                        </span>
                        {ageCategory && (
                          <span className={`badge ${ageCategory.badgeClass || 'badge-accent'} text-xs`}>
                            {ageCategory.label}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Gender */}
                    <td className="px-6 py-5 text-center">
                      <span className={`badge ${player.gender === 'F' ? 'badge-danger' : 'badge-accent'}`}>
                        {player.gender === 'F' ? '♀ Female' : '♂ Male'}
                      </span>
                    </td>

                    {/* BOUNTY - THE FOCUS */}
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <div className="text-3xl font-bold text-[#f59e0b] tracking-tight">
                          {player.bounty}₱
                        </div>
                      </div>
                    </td>

                    {/* Record */}
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-3 text-sm">
                        <span className="text-[#10b981] font-semibold">{player.wins}W</span>
                        <span className="text-[#ef4444] font-semibold">{player.losses}L</span>
                        <span className="text-[#94a3b8] font-semibold">{player.draws}D</span>
                      </div>
                    </td>

                    {/* Sheriff Badge */}
                    <td className="px-6 py-5 text-center">
                      {player.hasSheriffBadge ? (
                        <span className="text-3xl" title="Has Sheriff Badge">🛡️</span>
                      ) : (
                        <span className="text-2xl text-[#2a2f3e]" title="No Sheriff Badge">✗</span>
                      )}
                    </td>

                    {/* Criminal Status - ONLY SHOW IF NOT NORMAL */}
                    <td className="px-6 py-5 text-center">
                      {player.criminalStatus !== 'normal' && (
                        <span className={`badge ${
                          player.criminalStatus === 'angry' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {player.criminalStatus === 'angry' ? '😠 Angry' : '😡 Mad'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tournament Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">
            Tournament Progress
          </div>
          <div className="text-2xl font-bold text-gray-900">
            Round {currentRound} / {totalRounds}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {Math.max(0, totalRounds - currentRound)} rounds remaining
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">
            Total Players
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {players.length}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {players.filter(p => p.hasSheriffBadge).length} with Sheriff Badge
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">
            Criminal Status
          </div>
          <div className="flex gap-3 mt-2">
            <span className="badge badge-success">
              {players.filter(p => p.criminalStatus === 'normal').length} Normal
            </span>
            <span className="badge badge-warning">
              {players.filter(p => p.criminalStatus === 'angry').length} Angry
            </span>
            <span className="badge badge-danger">
              {players.filter(p => p.criminalStatus === 'mad').length} Mad
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
