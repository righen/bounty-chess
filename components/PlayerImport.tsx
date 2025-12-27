'use client';

import { useState } from 'react';
import { Player } from '@/types';
import { parseCSV, initializePlayers } from '@/lib/utils';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Divider,
  Stack,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Check as CheckIcon,
  ContentPaste as PasteIcon,
} from '@mui/icons-material';

interface PlayerImportProps {
  onPlayersImported: (players: Player[]) => void;
}

export default function PlayerImport({ onPlayersImported }: PlayerImportProps) {
  const [csvText, setCsvText] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    try {
      setError('');
      
      if (!csvText.trim()) {
        setError('Please paste or upload CSV data');
        return;
      }

      const rawPlayers = parseCSV(csvText);
      
      if (rawPlayers.length === 0) {
        setError('No players found in CSV');
        return;
      }

      const players = initializePlayers(rawPlayers);
      onPlayersImported(players);
    } catch (err) {
      setError(`Error parsing CSV: ${err}`);
    }
  };

  const handleLoadSample = async () => {
    try {
      const response = await fetch('/tournament-players.csv');
      const text = await response.text();
      setCsvText(text);
    } catch (err) {
      setError('Could not load sample data');
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            📥 Import Players
          </Typography>

          {/* Upload Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              📁 Upload CSV File
            </Typography>
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              fullWidth
              sx={{ py: 2, fontSize: '1rem' }}
            >
              Choose File
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                hidden
              />
            </Button>
          </Box>

          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">OR</Typography>
          </Divider>

          {/* Paste Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              📝 Paste CSV Data
            </Typography>
            <TextField
              multiline
              rows={12}
              fullWidth
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Paste your CSV data here..."
              variant="outlined"
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                },
              }}
            />
          </Box>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Action Buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="contained"
              color="info"
              startIcon={<PasteIcon />}
              onClick={handleLoadSample}
              fullWidth
              sx={{ py: 2 }}
            >
              Load Sample (37 Players)
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CheckIcon />}
              onClick={handleImport}
              fullWidth
              sx={{ py: 2 }}
            >
              Import Players
            </Button>
          </Stack>

          {/* Info Box */}
          <Alert severity="info" icon="ℹ️">
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              CSV Format Guide
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Expected columns:</strong> Player N°, Name, Surname, Birth date (DD/MM/YYYY), 
              Current address, Meal, Payment proof, Transfer Name
            </Typography>
            <Typography variant="body2" sx={{ color: 'info.dark', fontWeight: 600 }}>
              💡 <strong>Tip:</strong> Birth date is optional! You can add it later using "Manage Players" - 
              perfect for last-minute registrations!
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}
