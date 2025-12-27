'use client';

import { useState, useEffect } from 'react';
import { TournamentState, Player } from '@/types';
import { initializePlayers, parseCSV } from '@/lib/utils';
import { 
  loadTournamentState, 
  saveTournamentState, 
  initializeTournament,
  startNewRound,
  clearTournamentData,
  exportTournamentData,
} from '@/lib/store';
import PlayerImport from '@/components/PlayerImport';
import PlayerManager from '@/components/PlayerManager';
import Leaderboard from '@/components/Leaderboard';
import RoundManager from '@/components/RoundManager';
import Navigation from '@/components/Navigation';
import Prizes from '@/components/Prizes';

export default function Home() {
  const [state, setState] = useState<TournamentState | null>(null);
  const [view, setView] = useState<'setup' | 'leaderboard' | 'round' | 'players' | 'prizes'>('setup');
  const [loading, setLoading] = useState(true);

  // Load state on mount
  useEffect(() => {
    const loaded = loadTournamentState();
    if (loaded) {
      // Migrate old states that don't have totalRounds or tournamentStarted
      const migratedState = {
        ...loaded,
        totalRounds: loaded.totalRounds || 9,
        tournamentStarted: loaded.tournamentStarted ?? (loaded.currentRound > 0),
      };
      setState(migratedState);
      saveTournamentState(migratedState);
      setView('leaderboard');
    }
    setLoading(false);
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (state) {
      saveTournamentState(state);
    }
  }, [state]);

  const handlePlayersImported = (players: Player[]) => {
    const newState = initializeTournament(players);
    setState(newState);
    setView('players');
  };

  const handlePlayersUpdate = (players: Player[]) => {
    if (!state) {
      const newState = initializeTournament(players);
      setState(newState);
    } else {
      const updatedState = { ...state, players };
      setState(updatedState);
      saveTournamentState(updatedState);
    }
  };

  const handleStartTournament = () => {
    if (!state) return;
    
    const updatedState = {
      ...state,
      tournamentStarted: true,
    };
    setState(updatedState);
    saveTournamentState(updatedState);
  };

  const handleGeneratePairing = () => {
    if (!state) return;
    
    const newState = startNewRound(state);
    setState(newState);
    setView('round');
  };

  const handleStateUpdate = (newState: TournamentState) => {
    setState(newState);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the tournament? This cannot be undone.')) {
      clearTournamentData();
      setState(null);
      setView('setup');
    }
  };

  const handleExport = () => {
    if (!state) return;
    
    const data = exportTournamentData(state);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bounty-tournament-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-center">
            🎯 Bounty Chess Tournament
          </h1>
          {state && (
            <p className="text-center text-gray-400 mt-2">
              {state.players.length} Players • Round {state.currentRound} of {state.totalRounds}
            </p>
          )}
        </div>
      </header>

      {state && (
        <Navigation
          view={view}
          onViewChange={setView}
          onReset={handleReset}
          onExport={handleExport}
        />
      )}

      <main className="container mx-auto p-4">
        {!state && view === 'setup' && (
          <PlayerImport onPlayersImported={handlePlayersImported} />
        )}

        {state && view === 'players' && (
          <PlayerManager
            players={state.players}
            onPlayersUpdate={handlePlayersUpdate}
            tournamentStarted={state.tournamentStarted}
          />
        )}

        {state && view === 'leaderboard' && (
          <Leaderboard
            players={state.players}
            currentRound={state.currentRound}
            totalRounds={state.totalRounds}
            tournamentStarted={state.tournamentStarted}
            onStartTournament={handleStartTournament}
            onGeneratePairing={handleGeneratePairing}
          />
        )}

        {state && view === 'round' && (
          <RoundManager
            state={state}
            onStateUpdate={handleStateUpdate}
            onBackToLeaderboard={() => setView('leaderboard')}
          />
        )}

        {state && view === 'prizes' && (
          <Prizes
            players={state.players}
            currentRound={state.currentRound}
            totalRounds={state.totalRounds}
          />
        )}
      </main>
    </div>
  );
}
