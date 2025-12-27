'use client';

import { useState } from 'react';
import { Game, Player } from '@/types';
import { formatBounty, getCriminalStatusColor } from '@/lib/utils';
import { canUseSheriffBadge } from '@/lib/bounty';

interface GameCardProps {
  game: Game;
  whitePlayer: Player;
  blackPlayer: Player;
  roundNumber: number;
  onSubmitResult: (game: Game, result: 'white' | 'black' | 'draw', sheriffWhite: boolean, sheriffBlack: boolean) => void;
}

export default function GameCard({ game, whitePlayer, blackPlayer, roundNumber, onSubmitResult }: GameCardProps) {
  const [sheriffWhite, setSheriffWhite] = useState(false);
  const [sheriffBlack, setSheriffBlack] = useState(false);

  if (game.completed) {
    return (
      <div className="bg-white rounded-lg p-4 border-2 border-green-500 shadow-md">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600 font-semibold">Game Complete</span>
          <span className="text-green-600 font-bold text-lg">✓</span>
        </div>

        <div className="space-y-3">
          {/* White Player */}
          <div className={`p-3 rounded ${game.result === 'white' ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-gray-800">
                  {whitePlayer.name} {whitePlayer.surname}
                  {game.sheriffUsage.white && <span className="ml-2">🛡️</span>}
                </div>
                <div className="text-sm text-gray-600">White • {formatBounty(whitePlayer.bounty)}</div>
              </div>
              {game.result === 'white' && <span className="text-2xl">👑</span>}
            </div>
          </div>

          {/* Black Player */}
          <div className={`p-3 rounded ${game.result === 'black' ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-gray-800">
                  {blackPlayer.name} {blackPlayer.surname}
                  {game.sheriffUsage.black && <span className="ml-2">🛡️</span>}
                </div>
                <div className="text-sm text-gray-600">Black • {formatBounty(blackPlayer.bounty)}</div>
              </div>
              {game.result === 'black' && <span className="text-2xl">👑</span>}
            </div>
          </div>

          {game.result === 'draw' && (
            <div className="text-center text-gray-600 text-sm font-semibold">Draw - No bounty transfer</div>
          )}

          {game.bountyTransfer > 0 && (
            <div className="text-center text-brand-secondary font-bold text-lg">
              Bounty Transfer: {formatBounty(game.bountyTransfer)}
            </div>
          )}
        </div>
      </div>
    );
  }

  const canWhiteUseSheriff = canUseSheriffBadge(whitePlayer, roundNumber);
  const canBlackUseSheriff = canUseSheriffBadge(blackPlayer, roundNumber);

  const handleSubmit = (result: 'white' | 'black' | 'draw') => {
    if (confirm(`Confirm result: ${result === 'draw' ? 'Draw' : result === 'white' ? `${whitePlayer.name} wins` : `${blackPlayer.name} wins`}?`)) {
      onSubmitResult(game, result, sheriffWhite, sheriffBlack);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-brand-secondary transition-colors shadow-md">
      <div className="space-y-3">
        {/* White Player */}
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-semibold text-gray-800">{whitePlayer.name} {whitePlayer.surname}</div>
              <div className="text-sm text-gray-600">
                White • {formatBounty(whitePlayer.bounty)} • Age {whitePlayer.age} {whitePlayer.gender}
              </div>
              <div className="text-xs mt-1">
                <span className={`px-2 py-0.5 rounded ${getCriminalStatusColor(whitePlayer.criminalStatus)} text-white`}>
                  {whitePlayer.criminalStatus}
                </span>
              </div>
            </div>
          </div>
          
          {canWhiteUseSheriff && (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sheriffWhite}
                onChange={(e) => setSheriffWhite(e.target.checked)}
                className="w-5 h-5 accent-brand-secondary"
              />
              <span className="text-sm font-semibold text-gray-700">Use Sheriff Badge 🛡️</span>
            </label>
          )}
          {!canWhiteUseSheriff && whitePlayer.hasSheriffBadge && roundNumber > 9 && (
            <div className="text-xs text-gray-500 font-semibold">Badge expired (Round 9+)</div>
          )}
        </div>

        {/* Black Player */}
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-semibold text-gray-800">{blackPlayer.name} {blackPlayer.surname}</div>
              <div className="text-sm text-gray-600">
                Black • {formatBounty(blackPlayer.bounty)} • Age {blackPlayer.age} {blackPlayer.gender}
              </div>
              <div className="text-xs mt-1">
                <span className={`px-2 py-0.5 rounded ${getCriminalStatusColor(blackPlayer.criminalStatus)} text-white`}>
                  {blackPlayer.criminalStatus}
                </span>
              </div>
            </div>
          </div>
          
          {canBlackUseSheriff && (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sheriffBlack}
                onChange={(e) => setSheriffBlack(e.target.checked)}
                className="w-5 h-5 accent-brand-secondary"
              />
              <span className="text-sm font-semibold text-gray-700">Use Sheriff Badge 🛡️</span>
            </label>
          )}
          {!canBlackUseSheriff && blackPlayer.hasSheriffBadge && roundNumber > 9 && (
            <div className="text-xs text-gray-500 font-semibold">Badge expired (Round 9+)</div>
          )}
        </div>

        {/* Result buttons */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            onClick={() => handleSubmit('white')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-3 rounded-lg text-sm
              transition-all active:scale-95 shadow-md"
          >
            White Wins
          </button>
          <button
            onClick={() => handleSubmit('draw')}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-3 rounded-lg text-sm
              transition-all active:scale-95 shadow-md"
          >
            Draw
          </button>
          <button
            onClick={() => handleSubmit('black')}
            className="bg-brand-quinary hover:bg-purple-700 text-white font-bold py-3 px-3 rounded-lg text-sm
              transition-all active:scale-95 shadow-md"
          >
            Black Wins
          </button>
        </div>
      </div>
    </div>
  );
}
