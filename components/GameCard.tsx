'use client';

import { useState } from 'react';
import { Game, Player } from '@/types';
import { formatBounty, getCriminalStatusColor } from '@/lib/utils';
import { canUseSheriffBadge } from '@/lib/bounty';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';

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
      <Card elevation={3} sx={{ borderLeft: 4, borderColor: 'success.main' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Chip label="Game Complete" color="success" icon={<TrophyIcon />} />
          </Box>

          <Stack spacing={2}>
            {/* White Player */}
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: game.result === 'white' ? 'success.light' : 'grey.100',
                border: 1,
                borderColor: game.result === 'white' ? 'success.main' : 'grey.300',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {whitePlayer.name} {whitePlayer.surname}
                    {game.sheriffUsage.white && <ShieldIcon sx={{ ml: 1, fontSize: 18, color: 'warning.main' }} />}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    White • {formatBounty(whitePlayer.bounty)}
                  </Typography>
                </Box>
                {game.result === 'white' && <TrophyIcon sx={{ fontSize: 32, color: 'warning.main' }} />}
              </Box>
            </Box>

            {/* Black Player */}
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: game.result === 'black' ? 'success.light' : 'grey.100',
                border: 1,
                borderColor: game.result === 'black' ? 'success.main' : 'grey.300',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {blackPlayer.name} {blackPlayer.surname}
                    {game.sheriffUsage.black && <ShieldIcon sx={{ ml: 1, fontSize: 18, color: 'warning.main' }} />}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Black • {formatBounty(blackPlayer.bounty)}
                  </Typography>
                </Box>
                {game.result === 'black' && <TrophyIcon sx={{ fontSize: 32, color: 'warning.main' }} />}
              </Box>
            </Box>

            {game.result === 'draw' && (
              <Typography variant="body2" align="center" color="text.secondary" sx={{ fontWeight: 600 }}>
                Draw - No pesos transfer
              </Typography>
            )}

            {game.bountyTransfer > 0 && (
              <Typography variant="h6" align="center" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
                Pesos Transfer: {formatBounty(game.bountyTransfer)}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
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
    <Card elevation={2} sx={{ '&:hover': { boxShadow: 4 } }}>
      <CardContent>
        <Stack spacing={2}>
          {/* White Player */}
          <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'grey.50', border: 1, borderColor: 'grey.300' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              {whitePlayer.name} {whitePlayer.surname}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              White • {formatBounty(whitePlayer.bounty)} • Age {whitePlayer.age} {whitePlayer.gender}
            </Typography>
            <Chip 
              label={whitePlayer.criminalStatus.toUpperCase()} 
              size="small"
              color={whitePlayer.criminalStatus === 'angry' ? 'warning' : whitePlayer.criminalStatus === 'mad' ? 'error' : 'default'}
              sx={{ fontSize: '0.7rem' }}
            />

            {canWhiteUseSheriff && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sheriffWhite}
                    onChange={(e) => setSheriffWhite(e.target.checked)}
                    color="warning"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ShieldIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2">Use Sheriff Badge</Typography>
                  </Box>
                }
                sx={{ mt: 1 }}
              />
            )}
            {!canWhiteUseSheriff && whitePlayer.hasSheriffBadge && roundNumber > 9 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Badge expired (Round 9+)
              </Typography>
            )}
          </Box>

          {/* Black Player */}
          <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'grey.50', border: 1, borderColor: 'grey.300' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              {blackPlayer.name} {blackPlayer.surname}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Black • {formatBounty(blackPlayer.bounty)} • Age {blackPlayer.age} {blackPlayer.gender}
            </Typography>
            <Chip 
              label={blackPlayer.criminalStatus.toUpperCase()} 
              size="small"
              color={blackPlayer.criminalStatus === 'angry' ? 'warning' : blackPlayer.criminalStatus === 'mad' ? 'error' : 'default'}
              sx={{ fontSize: '0.7rem' }}
            />

            {canBlackUseSheriff && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sheriffBlack}
                    onChange={(e) => setSheriffBlack(e.target.checked)}
                    color="warning"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ShieldIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2">Use Sheriff Badge</Typography>
                  </Box>
                }
                sx={{ mt: 1 }}
              />
            )}
            {!canBlackUseSheriff && blackPlayer.hasSheriffBadge && roundNumber > 9 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Badge expired (Round 9+)
              </Typography>
            )}
          </Box>

          <Divider />

          {/* Result buttons */}
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleSubmit('white')}
              fullWidth
              sx={{ py: 1.5 }}
            >
              White Wins
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleSubmit('draw')}
              fullWidth
              sx={{ py: 1.5 }}
            >
              Draw
            </Button>
            <Button
              variant="contained"
              color="info"
              onClick={() => handleSubmit('black')}
              fullWidth
              sx={{ py: 1.5 }}
            >
              Black Wins
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
