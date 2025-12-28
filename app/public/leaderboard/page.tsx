'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Button, AppBar, Toolbar, Alert } from '@mui/material';
import Leaderboard from '@/components/Leaderboard';
import { Player } from '@/types';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function PublicLeaderboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(9);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();

    // Set up real-time subscription for players
    const playersSubscription = supabase
      .channel('public-players-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      playersSubscription.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load players
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .order('bounty', { ascending: false });

      if (playersError) throw playersError;

      // Load rounds to get current round
      const { data: roundsData, error: roundsError } = await supabase
        .from('rounds')
        .select('round_number')
        .order('round_number', { ascending: false })
        .limit(1);

      if (roundsError) throw roundsError;

      const players: Player[] = (playersData || []).map((p) => ({
        id: p.id,
        name: p.name,
        surname: p.surname,
        birthdate: p.birthdate || '',
        age: p.age,
        gender: p.gender as 'M' | 'F',
        currentAddress: p.current_address || '',
        meal: p.meal || '',
        paymentProof: p.payment_proof || '',
        transferName: p.transfer_name || '',
        bounty: p.bounty,
        wins: p.wins,
        losses: p.losses,
        draws: p.draws,
        hasSheriffBadge: p.has_sheriff_badge,
        criminalStatus: p.criminal_status as 'normal' | 'angry' | 'mad',
        opponentIds: p.opponent_ids || [],
      }));

      setPlayers(players);
      setCurrentRound(roundsData?.[0]?.round_number || 0);
      setError(null);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            BOUNTY <span style={{ color: '#ffcc33' }}>CHESS</span>
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>
            Public Leaderboard
          </Typography>
          <Button
            component={Link}
            href="/login"
            variant="outlined"
            size="small"
            sx={{
              borderColor: 'secondary.main',
              color: 'secondary.main',
              '&:hover': {
                borderColor: 'secondary.main',
                bgcolor: 'rgba(255, 204, 51, 0.1)',
              },
            }}
          >
            Admin Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
        {/* Tournament Info */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            🏆 Tournament Leaderboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Round {currentRound} of {totalRounds} • {players.length} Players
          </Typography>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Leaderboard */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Loading leaderboard...
            </Typography>
          </Box>
        ) : players.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No players yet. Check back soon!
            </Typography>
          </Box>
        ) : (
          <Leaderboard
            players={players}
            isPublicView={true}
          />
        )}

        {/* Auto-refresh Notice */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="caption" color="text.secondary">
            🔄 Leaderboard updates automatically • Last updated: {new Date().toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

