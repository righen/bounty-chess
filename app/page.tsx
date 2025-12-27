'use client';

import { useState, useEffect, useCallback } from 'react';
import { TournamentState, Player } from '@/types';
import { 
  loadTournamentState, 
  saveTournamentState, 
  initializeTournament,
  startNewRound,
  clearTournamentData,
  exportTournamentData,
  importTournamentData,
} from '@/lib/supabase-store';
import { supabase } from '@/lib/supabase';
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
  const [syncing, setSyncing] = useState(false);

  // Load state from Supabase on mount
  useEffect(() => {
    async function loadInitialState() {
      try {
        const loaded = await loadTournamentState();
        if (loaded && loaded.players.length > 0) {
          setState(loaded);
          setView('leaderboard');
        }
      } catch (error) {
        console.error('Error loading initial state:', error);
      } finally {
        setLoading(false);
      }
    }

    loadInitialState();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to players table changes
    const playersSubscription = supabase
      .channel('players-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, async () => {
        setSyncing(true);
        const updated = await loadTournamentState();
        if (updated) setState(updated);
        setSyncing(false);
      })
      .subscribe();

    // Subscribe to tournament table changes
    const tournamentSubscription = supabase
      .channel('tournament-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament' }, async () => {
        setSyncing(true);
        const updated = await loadTournamentState();
        if (updated) setState(updated);
        setSyncing(false);
      })
      .subscribe();

    // Subscribe to games table changes
    const gamesSubscription = supabase
      .channel('games-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, async () => {
        setSyncing(true);
        const updated = await loadTournamentState();
        if (updated) setState(updated);
        setSyncing(false);
      })
      .subscribe();

    // Subscribe to rounds table changes
    const roundsSubscription = supabase
      .channel('rounds-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rounds' }, async () => {
        setSyncing(true);
        const updated = await loadTournamentState();
        if (updated) setState(updated);
        setSyncing(false);
      })
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      playersSubscription.unsubscribe();
      tournamentSubscription.unsubscribe();
      gamesSubscription.unsubscribe();
      roundsSubscription.unsubscribe();
    };
  }, []);

  const handlePlayersImported = async (players: Player[]) => {
    const newState = initializeTournament(players);
    setState(newState);
    await saveTournamentState(newState);
    setView('players');
  };

  const handlePlayersUpdate = async (players: Player[]) => {
    if (!state) {
      const newState = initializeTournament(players);
      setState(newState);
      await saveTournamentState(newState);
    } else {
      const updatedState = { ...state, players };
      setState(updatedState);
      await saveTournamentState(updatedState);
    }
  };

  const handleStartTournament = async () => {
    if (!state) return;
    
    const updatedState = {
      ...state,
      tournamentStarted: true,
    };
    setState(updatedState);
    await saveTournamentState(updatedState);
  };

  const handleGeneratePairing = async () => {
    if (!state) return;
    
    const newState = startNewRound(state);
    setState(newState);
    await saveTournamentState(newState);
    setView('round');
  };

  const handleStateUpdate = async (newState: TournamentState) => {
    setState(newState);
    await saveTournamentState(newState);
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset the entire tournament? This cannot be undone.')) {
      await clearTournamentData();
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

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const imported = importTournamentData(text);
        setState(imported);
        await saveTournamentState(imported);
        setView('leaderboard');
        alert('Tournament data imported successfully!');
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing file. Please check the file format.');
      }
    };
    
    input.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-xl">Loading tournament state...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <header className="bg-[#1a1f2e] shadow-lg border-b border-[#2a2f3e] py-5 md:py-6 sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#e2e8f0]">
                🎯 Bounty Chess
              </h1>
              {state && (
                <p className="text-base md:text-lg text-[#94a3b8] mt-2">
                  {state.players.length} Players • Round {state.currentRound}/{state.totalRounds}
                </p>
              )}
            </div>
            {syncing && (
              <div className="badge badge-success gap-2 px-4 py-3">
                <div className="animate-pulse text-lg">●</div>
                <span className="font-semibold">Syncing...</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <Navigation
        view={view}
        onViewChange={setView}
        onReset={handleReset}
        onExport={handleExport}
        onImport={handleImport}
      />

      <main className="container mx-auto px-4 py-8">
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
