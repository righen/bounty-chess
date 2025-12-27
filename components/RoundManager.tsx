'use client';

import { TournamentState, Game } from '@/types';
import { submitGameResult } from '@/lib/store';
import GameCard from './GameCard';

interface RoundManagerProps {
  state: TournamentState;
  onStateUpdate: (state: TournamentState) => void;
  onBackToLeaderboard: () => void;
}

export default function RoundManager({ state, onStateUpdate, onBackToLeaderboard }: RoundManagerProps) {
  const currentRound = state.rounds[state.currentRound - 1];

  if (!currentRound) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-lg p-8 shadow-xl border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-brand-primary">No Active Round</h2>
          <button
            onClick={onBackToLeaderboard}
            className="bg-brand-secondary hover:bg-yellow-500 text-brand-primary font-bold py-3 px-6 rounded-lg transition-all active:scale-95 shadow-md"
          >
            ← Back to Leaderboard
          </button>
        </div>
      </div>
    );
  }

  const handleGameResult = (game: Game, result: 'white' | 'black' | 'draw', sheriffWhite: boolean, sheriffBlack: boolean) => {
    const newState = submitGameResult(state, game.id, result, {
      white: sheriffWhite,
      black: sheriffBlack,
    });
    onStateUpdate(newState);
  };

  const completedGames = currentRound.games.filter(g => g.completed).length;
  const totalGames = currentRound.games.length;
  const progress = (completedGames / totalGames) * 100;
  const byeGames = currentRound.games.filter(g => g.blackPlayerId === 0);
  const regularGames = currentRound.games.filter(g => g.blackPlayerId !== 0);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-brand-primary">♟️ Round {currentRound.number}</h2>
          <p className="text-gray-600 text-lg">
            {completedGames} of {totalGames} games completed
          </p>
        </div>
        <button
          onClick={onBackToLeaderboard}
          className="bg-brand-quinary hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all active:scale-95 shadow-md"
        >
          ← Back to Leaderboard
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-6 bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
        <div
          className="bg-brand-secondary h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {currentRound.completed && (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg text-green-800 text-center font-semibold text-lg">
          ✓ Round {currentRound.number} Complete! Go back to leaderboard to start the next round.
        </div>
      )}

      {/* Bye notification */}
      {byeGames.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2 text-lg">🎯 Players with BYE (automatic win, no bounty gain):</h3>
          <div className="flex flex-wrap gap-2">
            {byeGames.map(game => {
              const player = state.players.find(p => p.id === game.whitePlayerId);
              if (!player) return null;
              return (
                <div key={game.id} className="bg-blue-100 px-3 py-1 rounded text-blue-900 font-semibold">
                  {player.name} {player.surname} (ID: {player.id})
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Games grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {regularGames.map(game => {
          const whitePlayer = state.players.find(p => p.id === game.whitePlayerId);
          const blackPlayer = state.players.find(p => p.id === game.blackPlayerId);

          if (!whitePlayer || !blackPlayer) return null;

          return (
            <GameCard
              key={game.id}
              game={game}
              whitePlayer={whitePlayer}
              blackPlayer={blackPlayer}
              roundNumber={currentRound.number}
              onSubmitResult={handleGameResult}
            />
          );
        })}
      </div>

      {/* Printable pairings */}
      <div className="mt-8 bg-white rounded-lg p-6 shadow-xl border border-gray-200 print:shadow-none print:border-none">
        <div className="flex justify-between items-center mb-6 print:mb-8">
          <div>
            <h3 className="text-2xl font-bold text-brand-primary print:text-3xl">Round {currentRound.number} - Pairings</h3>
            <p className="text-gray-600 mt-1 print:text-gray-700">Total Games: {regularGames.length} • BYEs: {byeGames.length}</p>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-brand-secondary hover:bg-yellow-500 text-brand-primary px-6 py-3 rounded-lg font-bold transition-all active:scale-95 shadow-md print:hidden"
          >
            🖨️ Print Pairings
          </button>
        </div>
        
        {/* Table format for easy reading */}
        <table className="w-full border-collapse print:text-lg">
          <thead>
            <tr className="bg-gray-100 print:bg-gray-200">
              <th className="border-2 border-gray-300 print:border-black px-4 py-3 text-left text-gray-800 font-bold">Board</th>
              <th className="border-2 border-gray-300 print:border-black px-4 py-3 text-left text-gray-800 font-bold">⬜ White Player</th>
              <th className="border-2 border-gray-300 print:border-black px-4 py-3 text-left text-gray-800 font-bold">⬛ Black Player</th>
            </tr>
          </thead>
          <tbody>
            {regularGames.map((game, index) => {
              const whitePlayer = state.players.find(p => p.id === game.whitePlayerId);
              const blackPlayer = state.players.find(p => p.id === game.blackPlayerId);

              if (!whitePlayer || !blackPlayer) return null;

              return (
                <tr key={game.id} className="hover:bg-gray-50">
                  <td className="border-2 border-gray-300 print:border-black px-4 py-3 font-bold text-center text-brand-primary text-xl">
                    {index + 1}
                  </td>
                  <td className="border-2 border-gray-300 print:border-black px-4 py-3">
                    <div className="font-semibold text-lg text-gray-800">
                      {whitePlayer.name} {whitePlayer.surname}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {whitePlayer.id} • Bounty: {whitePlayer.bounty}₱
                    </div>
                  </td>
                  <td className="border-2 border-gray-300 print:border-black px-4 py-3">
                    <div className="font-semibold text-lg text-gray-800">
                      {blackPlayer.name} {blackPlayer.surname}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {blackPlayer.id} • Bounty: {blackPlayer.bounty}₱
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* BYE section */}
        {byeGames.length > 0 && (
          <div className="mt-6 print:mt-8 print:border-t-2 print:border-black print:pt-6">
            <h4 className="text-xl font-bold mb-3 text-blue-900">🎯 BYE (Automatic Win - No bounty gain)</h4>
            <table className="w-full border-collapse print:text-lg">
              <thead>
                <tr className="bg-blue-100 print:bg-gray-200">
                  <th className="border-2 border-blue-300 print:border-black px-4 py-3 text-left text-gray-800 font-bold">Player</th>
                  <th className="border-2 border-blue-300 print:border-black px-4 py-3 text-left text-gray-800 font-bold">Result</th>
                </tr>
              </thead>
              <tbody>
                {byeGames.map(game => {
                  const player = state.players.find(p => p.id === game.whitePlayerId);
                  if (!player) return null;
                  return (
                    <tr key={game.id} className="bg-white">
                      <td className="border-2 border-blue-300 print:border-black px-4 py-3">
                        <div className="font-semibold text-lg text-gray-800">
                          {player.name} {player.surname}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {player.id} • Bounty: {player.bounty}₱
                        </div>
                      </td>
                      <td className="border-2 border-blue-300 print:border-black px-4 py-3 font-semibold text-green-700">
                        Automatic Win (+1 Win, +0 Bounty)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
