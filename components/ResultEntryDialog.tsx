'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  TextField,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Remove as DrawIcon,
} from '@mui/icons-material';
import { Game } from '@/lib/tournament-rounds';
import { RegistrationWithPlayer } from '@/lib/registration-store';
import { submitGameResult, GameResultInput, getGameForResultEntry } from '@/lib/result-entry';
import { calculateBountyTransfer } from '@/lib/bounty';
import { Player } from '@/types';

interface ResultEntryDialogProps {
  open: boolean;
  gameId: string | null;
  tournamentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ResultEntryDialog({
  open,
  gameId,
  tournamentId,
  onClose,
  onSuccess,
}: ResultEntryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [whitePlayer, setWhitePlayer] = useState<RegistrationWithPlayer | null>(null);
  const [blackPlayer, setBlackPlayer] = useState<RegistrationWithPlayer | null>(null);
  const [result, setResult] = useState<'white_win' | 'black_win' | 'draw' | 'forfeit_white' | 'forfeit_black'>('white_win');
  const [whiteSheriffUsed, setWhiteSheriffUsed] = useState(false);
  const [blackSheriffUsed, setBlackSheriffUsed] = useState(false);
  const [notes, setNotes] = useState('');
  const [preview, setPreview] = useState<{
    bountyTransfer: number;
    whiteBountyChange: number;
    blackBountyChange: number;
    whiteCriminalStatus: string;
    blackCriminalStatus: string;
  } | null>(null);

  useEffect(() => {
    if (open && gameId) {
      loadGameData();
    } else {
      resetForm();
    }
  }, [open, gameId]);

  const loadGameData = async () => {
    if (!gameId) return;
    
    setLoading(true);
    try {
      const data = await getGameForResultEntry(gameId, tournamentId);
      if (data) {
        setGame(data.game);
        setWhitePlayer(data.whitePlayer);
        setBlackPlayer(data.blackPlayer);
        
        // Set default result if game already has one
        if (data.game.result) {
          setResult(data.game.result as any);
        }
        if (data.game.white_sheriff_used) {
          setWhiteSheriffUsed(true);
        }
        if (data.game.black_sheriff_used) {
          setBlackSheriffUsed(true);
        }
      }
    } catch (error) {
      console.error('Error loading game data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult('white_win');
    setWhiteSheriffUsed(false);
    setBlackSheriffUsed(false);
    setNotes('');
    setPreview(null);
  };

  const calculatePreview = () => {
    if (!whitePlayer || !blackPlayer || !game) return;

    const whitePlayerData = registrationToPlayer(whitePlayer);
    const blackPlayerData = registrationToPlayer(blackPlayer);

    let gameResult: 'white' | 'black' | 'draw';
    if (result === 'white_win' || result === 'forfeit_white') {
      gameResult = 'white';
    } else if (result === 'black_win' || result === 'forfeit_black') {
      gameResult = 'black';
    } else {
      gameResult = 'draw';
    }

    if (gameResult === 'draw') {
      setPreview({
        bountyTransfer: 0,
        whiteBountyChange: 0,
        blackBountyChange: 0,
        whiteCriminalStatus: whitePlayerData.criminalStatus,
        blackCriminalStatus: blackPlayerData.criminalStatus,
      });
      return;
    }

    const winner = gameResult === 'white' ? whitePlayerData : blackPlayerData;
    const loser = gameResult === 'white' ? blackPlayerData : whitePlayerData;

    const bountyCalc = calculateBountyTransfer(
      winner,
      loser,
      {
        white: whiteSheriffUsed,
        black: blackSheriffUsed,
      },
      game.round_number,
      gameResult
    );

    setPreview({
      bountyTransfer: bountyCalc.bountyTransfer,
      whiteBountyChange: gameResult === 'white' ? bountyCalc.winnerBountyChange : bountyCalc.loserBountyChange,
      blackBountyChange: gameResult === 'black' ? bountyCalc.winnerBountyChange : bountyCalc.loserBountyChange,
      whiteCriminalStatus: gameResult === 'white' ? bountyCalc.winnerCriminalStatus : bountyCalc.loserCriminalStatus,
      blackCriminalStatus: gameResult === 'black' ? bountyCalc.winnerCriminalStatus : bountyCalc.loserCriminalStatus,
    });
  };

  useEffect(() => {
    if (whitePlayer && blackPlayer && game) {
      calculatePreview();
    }
  }, [result, whiteSheriffUsed, blackSheriffUsed, whitePlayer, blackPlayer, game]);

  const handleSubmit = async () => {
    if (!gameId) return;

    setSubmitting(true);
    try {
      await submitGameResult(tournamentId, gameId, {
        result,
        whiteSheriffUsed,
        blackSheriffUsed,
        notes: notes.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error submitting result:', error);
      alert(error.message || 'Failed to submit result');
    } finally {
      setSubmitting(false);
    }
  };

  const registrationToPlayer = (reg: RegistrationWithPlayer): Player => {
    const regAny = reg as any;
    return {
      id: reg.player_id || reg.player_pool_id,
      name: reg.player.name,
      surname: reg.player.surname,
      birthdate: reg.player.birthdate || '',
      currentAddress: reg.player.phone || '',
      meal: '',
      paymentProof: '',
      transferName: '',
      age: reg.player.age || 0,
      gender: (reg.player.gender as 'M' | 'F') || 'M',
      bounty: regAny.current_bounty || 0,
      hasSheriffBadge: regAny.has_sheriff_badge || false,
      criminalStatus: (regAny.criminal_status as 'normal' | 'angry' | 'mad') || 'normal',
      wins: regAny.wins || 0,
      losses: regAny.losses || 0,
      draws: regAny.draws || 0,
      opponentIds: regAny.opponent_ids || [],
      colorHistory: (regAny.color_history as ('W' | 'B' | 'BYE')[]) || [],
    };
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!game || !whitePlayer) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Alert severity="error">Game data not found</Alert>
        </DialogContent>
      </Dialog>
    );
  }

  const whitePlayerData = registrationToPlayer(whitePlayer);
  const blackPlayerData = blackPlayer ? registrationToPlayer(blackPlayer) : null;

  // BYE game
  if (!blackPlayerData) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Enter Result - Board {game.board_number}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This is a BYE game. White player receives automatic win.
          </Alert>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {whitePlayerData.name} {whitePlayerData.surname}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current Pesos: {whitePlayerData.bounty}₱
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
          >
            {submitting ? 'Submitting...' : 'Confirm BYE'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Enter Result - Board {game.board_number} • Round {game.round_number}
      </DialogTitle>
      <DialogContent>
        {/* Players Info */}
        <Box sx={{ mb: 3 }}>
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">
                {whitePlayerData.name} {whitePlayerData.surname}
              </Typography>
              <Chip label="White" size="small" />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Wins: {whitePlayerData.wins} • 
              Status: <Chip label={whitePlayerData.criminalStatus} size="small" sx={{ ml: 0.5 }} />
            </Typography>
          </Paper>

          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">
                {blackPlayerData.name} {blackPlayerData.surname}
              </Typography>
              <Chip label="Black" size="small" />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Wins: {blackPlayerData.wins} • 
              Status: <Chip label={blackPlayerData.criminalStatus} size="small" sx={{ ml: 0.5 }} />
            </Typography>
          </Paper>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Result Selection */}
        <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
          <FormLabel component="legend">Game Result</FormLabel>
          <RadioGroup
            value={result}
            onChange={(e) => setResult(e.target.value as any)}
            row
          >
            <FormControlLabel
              value="white_win"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon color="primary" />
                  <Typography>White Wins (1-0)</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="black_win"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon color="primary" />
                  <Typography>Black Wins (0-1)</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="draw"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DrawIcon />
                  <Typography>Draw (½-½)</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="forfeit_white"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CancelIcon color="error" />
                  <Typography>White Forfeit (+/-)</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="forfeit_black"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CancelIcon color="error" />
                  <Typography>Black Forfeit (-/+)</Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>


        {/* Notes */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes about this game..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : <CheckIcon />}
        >
          {submitting ? 'Submitting...' : 'Submit Result'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

