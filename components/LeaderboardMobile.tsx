'use client';

import { Player } from '@/types';
import { formatBounty, getCriminalStatusColor, getAgeCategory } from '@/lib/utils';

interface LeaderboardMobileProps {
  players: Player[];
}

export default function LeaderboardMobile({ players }: LeaderboardMobileProps) {
  return (
    <div className="space-y-3">
      {players.map((player, index) => {
        const ageCategory = player.age > 0 ? getAgeCategory(player.age) : null;
        
        return (
          <div
            key={player.id}
            className={`bg-gray-800 rounded-lg p-4 border-2 ${
              index < 2 ? 'border-yellow-500 bg-yellow-900/10' : 'border-gray-700'
            }`}
          >
            {/* Header: Rank and Name */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-2xl font-bold ${
                    index < 2 ? 'text-yellow-400' : 'text-gray-300'
                  }`}>
                    #{index + 1}
                  </span>
                  <span className="text-xs text-gray-500">ID: {player.id}</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {player.name} {player.surname}
                </h3>
                {player.currentAddress && (
                  <p className="text-sm text-gray-400">{player.currentAddress}</p>
                )}
              </div>
              
              {/* Bounty Badge */}
              <div className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-center min-w-[80px]">
                <div className="text-xs font-semibold">Bounty</div>
                <div className="text-xl font-bold">{player.bounty}₱</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Age & Category */}
              <div className="bg-gray-700 rounded p-2">
                <div className="text-xs text-gray-400 mb-1">Age</div>
                <div className="flex items-center gap-2">
                  {player.age > 0 ? (
                    <>
                      <span className="text-lg font-bold">{player.age}</span>
                      {ageCategory && (
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${ageCategory.color}`}>
                          {ageCategory.label}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>
              </div>

              {/* Gender */}
              <div className="bg-gray-700 rounded p-2">
                <div className="text-xs text-gray-400 mb-1">Gender</div>
                <span className={`text-lg font-bold ${
                  player.gender === 'F' ? 'text-pink-400' : 'text-blue-400'
                }`}>
                  {player.gender === 'F' ? 'Female' : 'Male'}
                </span>
              </div>

              {/* Record */}
              <div className="bg-gray-700 rounded p-2">
                <div className="text-xs text-gray-400 mb-1">Record</div>
                <div className="text-sm">
                  <span className="text-green-400 font-bold">{player.wins}W</span>
                  {' '}-{' '}
                  <span className="text-red-400 font-bold">{player.losses}L</span>
                  {' '}-{' '}
                  <span className="text-blue-400 font-bold">{player.draws}D</span>
                </div>
              </div>

              {/* Sheriff Badge */}
              <div className="bg-gray-700 rounded p-2">
                <div className="text-xs text-gray-400 mb-1">Sheriff</div>
                <div className="text-2xl">
                  {player.hasSheriffBadge ? '🛡️' : '❌'}
                </div>
              </div>
            </div>

            {/* Criminal Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Criminal Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${getCriminalStatusColor(player.criminalStatus)} text-white uppercase`}>
                {player.criminalStatus}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

