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
        <div className="bg-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">No Active Round</h2>
          <button
            onClick={onBackToLeaderboard}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
          >
            Back to Leaderboard
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
          <h2 className="text-2xl font-bold">Round {currentRound.number}</h2>
          <p className="text-gray-400">
            {completedGames} of {totalGames} games completed
          </p>
        </div>
        <button
          onClick={onBackToLeaderboard}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
        >
          Back to Leaderboard
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-6 bg-gray-700 rounded-full h-4 overflow-hidden">
        <div
          className="bg-green-600 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {currentRound.completed && (
        <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded text-green-200 text-center">
          ✓ Round {currentRound.number} Complete! Go back to leaderboard to start the next round.
        </div>
      )}

      {/* Bye notification */}
      {byeGames.length > 0 && (
        <div className="mb-6 p-4 bg-blue-900/50 border border-blue-700 rounded">
          <h3 className="font-semibold text-blue-200 mb-2">🎯 Players with BYE (automatic win, no bounty gain):</h3>
          <div className="flex flex-wrap gap-2">
            {byeGames.map(game => {
              const player = state.players.find(p => p.id === game.whitePlayerId);
              if (!player) return null;
              return (
                <div key={game.id} className="bg-blue-800 px-3 py-1 rounded text-blue-100">
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
      <div className="mt-8 bg-gray-800 rounded-lg p-6 print:bg-white print:text-black print:p-8">
        <div className="flex justify-between items-center mb-6 print:mb-8">
          <div>
            <h3 className="text-2xl font-bold print:text-3xl print:text-black">Round {currentRound.number} - Pairings</h3>
            <p className="text-gray-400 print:text-gray-700 mt-1">Total Games: {regularGames.length} • BYEs: {byeGames.length}</p>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-semibold print:hidden"
          >
            🖨️ Print Pairings
          </button>
        </div>
        
        {/* Table format for easy reading */}
        <table className="w-full border-collapse print:text-lg">
          <thead>
            <tr className="bg-gray-700 print:bg-gray-200">
              <th className="border border-gray-600 print:border-black px-4 py-3 text-left print:text-black font-bold">Board</th>
              <th className="border border-gray-600 print:border-black px-4 py-3 text-left print:text-black font-bold">⬜ White Player</th>
              <th className="border border-gray-600 print:border-black px-4 py-3 text-left print:text-black font-bold">⬛ Black Player</th>
            </tr>
          </thead>
          <tbody>
            {regularGames.map((game, index) => {
              const whitePlayer = state.players.find(p => p.id === game.whitePlayerId);
              const blackPlayer = state.players.find(p => p.id === game.blackPlayerId);

              if (!whitePlayer || !blackPlayer) return null;

              return (
                <tr key={game.id} className="hover:bg-gray-750 print:hover:bg-white">
                  <td className="border border-gray-600 print:border-black px-4 py-3 font-bold text-center print:text-black text-xl">
                    {index + 1}
                  </td>
                  <td className="border border-gray-600 print:border-black px-4 py-3 print:text-black">
                    <div className="font-semibold text-lg">
                      {whitePlayer.name} {whitePlayer.surname}
                    </div>
                    <div className="text-sm text-gray-400 print:text-gray-600">
                      ID: {whitePlayer.id} • Bounty: {whitePlayer.bounty}₱
                    </div>
                  </td>
                  <td className="border border-gray-600 print:border-black px-4 py-3 print:text-black">
                    <div className="font-semibold text-lg">
                      {blackPlayer.name} {blackPlayer.surname}
                    </div>
                    <div className="text-sm text-gray-400 print:text-gray-600">
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
            <h4 className="text-xl font-bold mb-3 text-blue-300 print:text-black">🎯 BYE (Automatic Win - No bounty gain)</h4>
            <table className="w-full border-collapse print:text-lg">
              <thead>
                <tr className="bg-blue-900/50 print:bg-gray-200">
                  <th className="border border-blue-700 print:border-black px-4 py-3 text-left print:text-black font-bold">Player</th>
                  <th className="border border-blue-700 print:border-black px-4 py-3 text-left print:text-black font-bold">Result</th>
                </tr>
              </thead>
              <tbody>
                {byeGames.map(game => {
                  const player = state.players.find(p => p.id === game.whitePlayerId);
                  if (!player) return null;
                  return (
                    <tr key={game.id} className="bg-blue-900/30 print:bg-white">
                      <td className="border border-blue-700 print:border-black px-4 py-3 print:text-black">
                        <div className="font-semibold text-lg">
                          {player.name} {player.surname}
                        </div>
                        <div className="text-sm text-gray-400 print:text-gray-600">
                          ID: {player.id} • Bounty: {player.bounty}₱
                        </div>
                      </td>
                      <td className="border border-blue-700 print:border-black px-4 py-3 font-semibold text-green-400 print:text-green-700">
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

