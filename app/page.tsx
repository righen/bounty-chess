'use client';

import { useState, useEffect, useCallback } from 'react';
import { TournamentState, Player } from '@/types';
import { Box, AppBar, Toolbar, IconButton, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import WarningIcon from '@mui/icons-material/Warning';
import { 
  loadTournamentState, 
  saveTournamentState, 
  initializeTournament,
  startNewRound,
  clearTournamentData,
  resetTournamentKeepPlayers,
  exportTournamentData,
  importTournamentData,
} from '@/lib/supabase-store';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import PlayerImport from '@/components/PlayerImport';
import PlayerManager from '@/components/PlayerManager';
import Leaderboard from '@/components/Leaderboard';
import RoundManager from '@/components/RoundManager';
import Sidebar from '@/components/Sidebar';
import Prizes from '@/components/Prizes';

export default function Home() {
  const { profile } = useAuth();
  const [state, setState] = useState<TournamentState | null>(null);
  const [view, setView] = useState<'setup' | 'leaderboard' | 'round' | 'players' | 'prizes'>('setup');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

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
    // Reset tournament but KEEP players (reset their stats to initial state)
    if (confirm('Reset tournament but keep all players?\n\n✅ Players will be kept\n✅ Stats reset to 0-0-0\n✅ Bounty reset to 20\n✅ Sheriff badges restored\n\n(To delete players too, export data first then use full reset)')) {
      try {
        await resetTournamentKeepPlayers();
        // Reload state to show players with reset stats
        const reloaded = await loadTournamentState();
        setState(reloaded);
        setView('players');
      } catch (error) {
        console.error('Error resetting tournament:', error);
        alert('Error resetting tournament. Check console for details.');
      }
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

  const getPageTitle = () => {
    switch(view) {
      case 'players': return '👥 Manage Players';
      case 'leaderboard': return '🏆 Leaderboard';
      case 'round': return '♟️ Current Round';
      case 'prizes': return '🎖️ Prizes';
      case 'setup': return '📥 Import Players';
      default: return 'Bounty Chess';
    }
  };

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
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
          userRole={profile?.role || null}
        />

        {/* Main Content */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            width: '100%',
            minHeight: '100vh',
            bgcolor: 'grey.50',
          }}
        >
          {/* Header */}
          <AppBar 
            position="sticky" 
            color="inherit" 
            elevation={1}
            sx={{ 
              bgcolor: 'background.paper',
              '@media print': { display: 'none' },
            }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>

              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                {getPageTitle()}
              </Typography>

              {syncing && (
                <Chip 
                  label="Syncing..." 
                  color="success" 
                  size="small" 
                  sx={{ mr: 2, display: { xs: 'none', sm: 'flex' } }}
                />
              )}

              {state && (
                <Typography 
                  variant="body2" 
                  sx={{ display: { xs: 'none', md: 'block' }, color: 'text.secondary' }}
                >
                  <strong>{state.players.length}</strong> Players • <strong>Round {state.currentRound}/{state.totalRounds}</strong>
                </Typography>
              )}
            </Toolbar>
          </AppBar>

          {/* Content */}
          <Box sx={{ p: { xs: 2, sm: 3, lg: 4 }, maxWidth: '100%' }}>
            {!state && view === 'setup' && profile?.role === 'admin' && (
              <PlayerImport onPlayersImported={handlePlayersImported} />
            )}

            {state && view === 'players' && profile?.role === 'admin' && (
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
                onStartTournament={profile?.role === 'admin' ? handleStartTournament : undefined}
                onGeneratePairing={profile?.role === 'admin' ? handleGeneratePairing : undefined}
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
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
