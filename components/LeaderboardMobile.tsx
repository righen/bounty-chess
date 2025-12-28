'use client';

import { Player } from '@/types';
import { formatBounty, getAgeCategory } from '@/lib/utils';
import { 
  Box,
  Card,
  Typography,
  Chip,
  Stack,
} from '@mui/material';

interface LeaderboardMobileProps {
  players: Player[];
}

export default function LeaderboardMobile({ players }: LeaderboardMobileProps) {
  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <Stack spacing={1.5}>
      {players.map((player, index) => (
        <Card 
          key={player.id}
          elevation={1}
          sx={{ 
            p: 1.5,
            border: index < 3 ? 2 : 0,
            borderColor: index < 3 ? 'secondary.main' : 'transparent',
          }}
        >
          {/* Header Row: Rank + Name + Bounty */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: index < 3 ? 'secondary.main' : 'text.primary' }}>
                  {getRankIcon(index)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {player.id}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {player.name} {player.surname}
              </Typography>
            </Box>
            
            {/* Compact Pesos Badge */}
            <Box sx={{ 
              bgcolor: 'secondary.main', 
              color: 'white', 
              px: 1.5, 
              py: 0.5, 
              borderRadius: 1,
              textAlign: 'center',
              minWidth: 60,
            }}>
              <Typography variant="caption" sx={{ fontSize: '0.65rem', display: 'block', lineHeight: 1 }}>
                Pesos
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                {player.bounty}₱
              </Typography>
            </Box>
          </Box>

          {/* Compact Stats Grid - 2x2 */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75, mb: 1 }}>
            {/* Age */}
            <Box sx={{ bgcolor: 'grey.100', borderRadius: 1, p: 0.75 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
                Age
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                {player.age > 0 ? (
                  <>
                    {player.age}
                    {' '}
                    {player.age < 12 && <Chip label="Adult" size="small" sx={{ height: 14, fontSize: '0.6rem' }} />}
                  </>
                ) : '-'}
              </Typography>
            </Box>

            {/* Gender */}
            <Box sx={{ bgcolor: 'grey.100', borderRadius: 1, p: 0.75 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
                Gender
              </Typography>
              <Chip 
                label={player.gender === 'F' ? 'Female' : 'Male'}
                size="small"
                color={player.gender === 'F' ? 'error' : 'primary'}
                sx={{ height: 18, fontSize: '0.7rem', mt: 0.25 }}
              />
            </Box>

            {/* Record */}
            <Box sx={{ bgcolor: 'grey.100', borderRadius: 1, p: 0.75 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
                Record
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
                <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>{player.wins}W</Box>
                {' '}
                <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>{player.losses}L</Box>
                {' '}
                <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}>{player.draws}D</Box>
              </Typography>
            </Box>

            {/* Sheriff */}
            <Box sx={{ bgcolor: 'grey.100', borderRadius: 1, p: 0.75, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
                Sheriff
              </Typography>
              <Typography sx={{ fontSize: '1.2rem', lineHeight: 1 }}>
                {player.hasSheriffBadge ? '🛡️' : '✗'}
              </Typography>
            </Box>
          </Box>

          {/* Criminal Status - Only show if not normal */}
          {player.criminalStatus !== 'normal' && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                Criminal Status:
              </Typography>
              <Chip 
                label={player.criminalStatus.toUpperCase()}
                size="small"
                color={player.criminalStatus === 'angry' ? 'warning' : 'error'}
                sx={{ height: 18, fontSize: '0.7rem', fontWeight: 'bold' }}
              />
            </Box>
          )}
        </Card>
      ))}
    </Stack>
  );
}

