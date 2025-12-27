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
import Sidebar from '@/components/Sidebar';
import Prizes from '@/components/Prizes';

export default function Home() {
  const [state, setState] = useState<TournamentState | null>(null);
  const [view, setView] = useState<'setup' | 'leaderboard' | 'round' | 'players' | 'prizes'>('setup');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-900">Loading tournament state...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        view={view}
        onViewChange={setView}
        onReset={handleReset}
        onExport={handleExport}
        onImport={handleImport}
        tournamentStarted={state?.tournamentStarted || false}
        playersCount={state?.players.length || 0}
        currentRound={state?.currentRound || 0}
        totalRounds={state?.totalRounds || 9}
      />

      {/* Main Content */}
      <main className={`w-full transition-all duration-300 ease-in-out ${sidebarOpen ? "lg:pl-[290px]" : ""}`}>
        {/* Header */}
        <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 border-b print:hidden">
          <div className="flex items-center justify-between grow p-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4 lg:justify-normal lg:border-b-0">
              {/* Hamburger Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center justify-center w-11 h-11 text-gray-500 border border-gray-200 rounded-lg z-99999 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Page Title */}
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                {view === 'players' && 'Manage Players'}
                {view === 'leaderboard' && 'Leaderboard'}
                {view === 'round' && 'Current Round'}
                {view === 'prizes' && 'Prizes'}
                {view === 'setup' && 'Import Players'}
              </h1>
            </div>
            
            <div className="items-center gap-4 flex justify-end relative overflow-hidden">
              {syncing && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm">
                  <div className="animate-pulse">●</div>
                  <span className="font-semibold hidden sm:inline">Syncing...</span>
                </div>
              )}
              
              {state && (
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{state.players.length}</span>
                  <span>Players •</span>
                  <span className="font-semibold text-gray-900">Round {state.currentRound}/{state.totalRounds}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-2 lg:p-4">
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
        </div>
      </main>
    </div>
  );
}
