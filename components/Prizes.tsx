'use client';

import { Player } from '@/types';
import { formatBounty } from '@/lib/utils';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  WorkspacePremium as MedalIcon,
} from '@mui/icons-material';

interface PrizesProps {
  players: Player[];
  currentRound: number;
  totalRounds: number;
}

export default function Prizes({ players, currentRound, totalRounds }: PrizesProps) {
  // Sort by bounty (highest first)
  const sortedByBounty = [...players].sort((a, b) => {
    if (b.bounty !== a.bounty) return b.bounty - a.bounty;
    return b.wins - a.wins;
  });

  // Greatest Criminals (Top 5 by bounty)
  const greatestCriminal = sortedByBounty[0];
  const secondGreatest = sortedByBounty[1];
  const thirdGreatest = sortedByBounty[2];
  const fourthGreatest = sortedByBounty[3];
  const fifthGreatest = sortedByBounty[4];

  // Most Dangerous Lady (Highest bounty female)
  const mostDangerousLady = sortedByBounty.find(p => p.gender === 'F');

  // Youngest player
  const youngestPlayer = [...players].sort((a, b) => {
    if (!a.birthdate || !b.birthdate) return 0;
    return b.birthdate.localeCompare(a.birthdate);
  })[0];

  // Most draws
  const mostDraws = [...players].sort((a, b) => b.draws - a.draws)[0];

  // Fastest shooter (most wins)
  const fastestShooter = [...players].sort((a, b) => b.wins - a.wins)[0];

  // Perfect balance (closest to 20 pesos)
  const perfectBalance = [...players].sort((a, b) => {
    return Math.abs(a.bounty - 20) - Math.abs(b.bounty - 20);
  })[0];

  // U12 challenges
  const u12Boys = players.filter(p => p.age < 12 && p.gender === 'M');
  const bornKillerBoy = u12Boys.sort((a, b) => {
    if (b.bounty !== a.bounty) return b.bounty - a.bounty;
    return b.wins - a.wins;
  })[0];

  const u12Girls = players.filter(p => p.age < 12 && p.gender === 'F');
  const bornKillerGirl = u12Girls.sort((a, b) => {
    if (b.bounty !== a.bounty) return b.bounty - a.bounty;
    return b.wins - a.wins;
  })[0];

  // U16 challenge
  const u16Players = players.filter(p => p.age < 16);
  const futureAssassin = u16Players.sort((a, b) => {
    if (b.bounty !== a.bounty) return b.bounty - a.bounty;
    return b.wins - a.wins;
  })[0];

  // U18 challenge
  const u18Players = players.filter(p => p.age < 18);
  const youngKiller = u18Players.sort((a, b) => {
    if (b.bounty !== a.bounty) return b.bounty - a.bounty;
    return b.wins - a.wins;
  })[0];

  // Untouchable (least defeats)
  const untouchable = [...players].sort((a, b) => {
    if (a.losses !== b.losses) return a.losses - b.losses;
    return a.bounty - b.bounty;
  })[0];

  // Best unknown player
  const unknownPlayers = sortedByBounty.slice(10, 20);
  const bestUnknown = unknownPlayers[0];

  const renderPlayerCard = (player: Player | undefined, label: string, prize: string, color: 'primary' | 'secondary' | 'warning' | 'error' | 'info' = 'secondary') => {
    if (!player) return (
      <Card elevation={1} sx={{ height: '100%' }}>
        <CardContent>
          <Chip label={prize} color={color} size="small" sx={{ mb: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">-</Typography>
        </CardContent>
      </Card>
    );

    return (
      <Card elevation={2} sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
        <CardContent>
          <Chip label={prize} color={color} size="small" sx={{ mb: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            {label}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {player.name} {player.surname}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: {player.id} • Age: {player.age} {player.gender}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
                {formatBounty(player.bounty)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {player.wins}W-{player.losses}L-{player.draws}D
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TrophyIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Trophies & Medals
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {currentRound === totalRounds ? 'Final Results' : `Preview (Tournament in progress - Round ${currentRound}/${totalRounds})`}
          </Typography>

          {/* Main Trophies */}
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, mt: 3 }}>
            🏆 Main Trophies
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mb: 4 }}>
            {renderPlayerCard(greatestCriminal, 'Greatest Criminal', '🥇 Trophy Winner', 'secondary')}
            {renderPlayerCard(secondGreatest, 'Greatest Criminal', '🥈 Trophy 2nd Winner', 'secondary')}
          </Box>

          {/* Bronze Medals */}
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            🥉 Bronze Medals
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
            {renderPlayerCard(thirdGreatest, 'Great Criminal 1', '🥉 Bronze', 'warning')}
            {renderPlayerCard(fourthGreatest, 'Great Criminal 2', '🥉 Bronze', 'warning')}
            {renderPlayerCard(fifthGreatest, 'Great Criminal 3', '🥉 Bronze', 'warning')}
          </Box>

          {/* Special Categories */}
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            👑 Special Categories
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mb: 4 }}>
            {renderPlayerCard(mostDangerousLady, 'Most Dangerous Lady', '🏆 Trophy', 'error')}
            {renderPlayerCard(youngestPlayer, 'Too young to be a criminal', '📌 Pins', 'info')}
            {renderPlayerCard(mostDraws, 'Dancing between bullets (Most draws)', '📌 Pins', 'info')}
            {renderPlayerCard(fastestShooter, 'Fastest Shooter of the east', '📌 Pins', 'info')}
            {renderPlayerCard(perfectBalance, 'Perfect balance (Closest to 20₱)', '📌 Pins', 'info')}
            {renderPlayerCard(untouchable, 'Untouchable (Least defeats)', '📌 Pins', 'info')}
            {renderPlayerCard(bestUnknown, 'Who are you? (Best unknown player)', '📌 Pins', 'info')}
          </Box>

          {/* Gold Medals (Age Categories) */}
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            🥇 Gold Medals (Age Categories)
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mb: 4 }}>
            {renderPlayerCard(bornKillerBoy, 'Born killer (U12 Boy challenge)', '🥇 Gold Medal', 'primary')}
            {renderPlayerCard(bornKillerGirl, 'Born killer (U12 Girl challenge)', '🥇 Gold Medal', 'primary')}
            {renderPlayerCard(futureAssassin, 'Future assassins (U16 challenge)', '🥇 Gold Medal', 'primary')}
            {renderPlayerCard(youngKiller, 'Old enough to kill (U18 challenge)', '🥇 Gold Medal', 'primary')}
          </Box>

          {/* Participation */}
          <Alert severity="info" icon={<MedalIcon />}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              🎖️ Participation Pin: All {players.length} players receive 70 pins
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}
