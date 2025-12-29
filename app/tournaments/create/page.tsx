'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Alert,
  Snackbar,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackStepIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { createTournament } from '@/lib/tournament-store';

interface TournamentFormData {
  name: string;
  location: string;
  start_date: string;
  end_date: string;
  format: 'swiss' | 'round_robin' | 'knockout';
  total_rounds: number;
  time_control: string;
  default_time_minutes: number;
  grace_period_minutes: number;
  bye_points: number;
  initial_bounty: number;
  entry_fee: number;
  prize_fund: number;
  allow_late_entries: boolean;
  late_entry_deadline_round: number | null;
}

const steps = ['Basic Info', 'Tournament Settings', 'Rules & Prizes'];

function CreateTournamentPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [formData, setFormData] = useState<TournamentFormData>({
    name: '',
    location: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    format: 'swiss',
    total_rounds: 9,
    time_control: '30+0',
    default_time_minutes: 30,
    grace_period_minutes: 0,
    bye_points: 1.0,
    initial_bounty: 20,
    entry_fee: 0,
    prize_fund: 0,
    allow_late_entries: true,
    late_entry_deadline_round: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.name.trim()) {
        newErrors.name = 'Tournament name is required';
      }
      if (!formData.start_date) {
        newErrors.start_date = 'Start date is required';
      }
      if (formData.end_date && formData.end_date < formData.start_date) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    if (step === 1) {
      if (formData.total_rounds < 1 || formData.total_rounds > 20) {
        newErrors.total_rounds = 'Rounds must be between 1 and 20';
      }
      if (formData.default_time_minutes < 0) {
        newErrors.default_time_minutes = 'Default time must be positive';
      }
    }

    if (step === 2) {
      if (formData.initial_bounty < 0) {
        newErrors.initial_bounty = 'Initial bounty must be positive';
      }
      if (formData.bye_points < 0 || formData.bye_points > 1) {
        newErrors.bye_points = 'BYE points must be between 0 and 1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    try {
      setLoading(true);
      await createTournament(formData);
      showSnackbar('Tournament created successfully!', 'success');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error creating tournament:', error);
      showSnackbar('Failed to create tournament', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Tournament Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name}
              sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}
            />
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Chess Club, Online"
            />
            <TextField
              fullWidth
              select
              label="Format *"
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
            >
              <MenuItem value="swiss">Swiss System</MenuItem>
              <MenuItem value="round_robin">Round Robin</MenuItem>
              <MenuItem value="knockout">Knockout</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Start Date *"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              error={!!errors.start_date}
              helperText={errors.start_date}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              error={!!errors.end_date}
              helperText={errors.end_date || 'Optional - for multi-day tournaments'}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Total Rounds *"
              type="number"
              value={formData.total_rounds}
              onChange={(e) => setFormData({ ...formData, total_rounds: parseInt(e.target.value) || 0 })}
              error={!!errors.total_rounds}
              helperText={errors.total_rounds || 'Number of rounds in the tournament'}
              inputProps={{ min: 1, max: 20 }}
            />
            <TextField
              fullWidth
              label="Time Control"
              value={formData.time_control}
              onChange={(e) => setFormData({ ...formData, time_control: e.target.value })}
              placeholder="e.g., 30+0, 15+10"
              helperText="Format: minutes+increment"
            />
            <TextField
              fullWidth
              label="Default Time (minutes) *"
              type="number"
              value={formData.default_time_minutes}
              onChange={(e) => setFormData({ ...formData, default_time_minutes: parseInt(e.target.value) || 0 })}
              error={!!errors.default_time_minutes}
              helperText="Time before forfeit for no-show (FIDE 6.7)"
              inputProps={{ min: 0 }}
            />
            <TextField
              fullWidth
              label="Grace Period (minutes)"
              type="number"
              value={formData.grace_period_minutes}
              onChange={(e) => setFormData({ ...formData, grace_period_minutes: parseInt(e.target.value) || 0 })}
              helperText="Optional grace period before default time"
              inputProps={{ min: 0 }}
            />
            <TextField
              fullWidth
              select
              label="Allow Late Entries"
              value={formData.allow_late_entries ? 'yes' : 'no'}
              onChange={(e) => setFormData({ ...formData, allow_late_entries: e.target.value === 'yes' })}
            >
              <MenuItem value="yes">Yes</MenuItem>
              <MenuItem value="no">No</MenuItem>
            </TextField>
            {formData.allow_late_entries && (
              <TextField
                fullWidth
                label="Late Entry Deadline Round"
                type="number"
                value={formData.late_entry_deadline_round || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  late_entry_deadline_round: e.target.value ? parseInt(e.target.value) : null 
                })}
                helperText="Leave empty for no deadline"
                inputProps={{ min: 1, max: formData.total_rounds }}
              />
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Initial Bounty (Pesos) *"
              type="number"
              value={formData.initial_bounty}
              onChange={(e) => setFormData({ ...formData, initial_bounty: parseInt(e.target.value) || 0 })}
              error={!!errors.initial_bounty}
              helperText="Starting bounty for each player"
              inputProps={{ min: 0 }}
            />
            <TextField
              fullWidth
              label="BYE Points *"
              type="number"
              value={formData.bye_points}
              onChange={(e) => setFormData({ ...formData, bye_points: parseFloat(e.target.value) || 0 })}
              error={!!errors.bye_points}
              helperText="Points awarded for BYE (usually 1.0)"
              inputProps={{ min: 0, max: 1, step: 0.5 }}
            />
            <TextField
              fullWidth
              label="Entry Fee"
              type="number"
              value={formData.entry_fee}
              onChange={(e) => setFormData({ ...formData, entry_fee: parseFloat(e.target.value) || 0 })}
              helperText="Optional entry fee per player"
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              fullWidth
              label="Prize Fund"
              type="number"
              value={formData.prize_fund}
              onChange={(e) => setFormData({ ...formData, prize_fund: parseFloat(e.target.value) || 0 })}
              helperText="Total prize pool (optional)"
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => router.push('/dashboard')}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Create New Tournament
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ minHeight: 300 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<BackStepIcon />}
          >
            Back
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={<SaveIcon />}
              >
                {loading ? 'Creating...' : 'Create Tournament'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<NextIcon />}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Summary Preview */}
      {activeStep === steps.length - 1 && (
        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Tournament Summary
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Name</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.name || '-'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Format</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formData.format.charAt(0).toUpperCase() + formData.format.slice(1).replace('_', ' ')}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Start Date</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {new Date(formData.start_date).toLocaleDateString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Total Rounds</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.total_rounds}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Time Control</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.time_control || '-'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Initial Bounty</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.initial_bounty} Pesos</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Entry Fee</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formData.entry_fee > 0 ? `$${formData.entry_fee}` : 'Free'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Late Entries</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formData.allow_late_entries ? 'Allowed' : 'Not Allowed'}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default function CreateTournamentPageWithAuth() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <CreateTournamentPage />
    </ProtectedRoute>
  );
}

