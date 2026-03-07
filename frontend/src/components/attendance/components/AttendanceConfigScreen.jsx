import React from 'react';
import {
    Box, Typography, Button, CircularProgress,
    Chip, TextField, MenuItem, Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const SUB_BATCHES = [
    { label: 'Growth Morning', batch: 'Growth', subBatch: 'Growth Morning' },
    { label: 'Growth Evening', batch: 'Growth', subBatch: 'Growth Evening' },
    { label: 'Excel Morning', batch: 'Excel', subBatch: 'Excel Morning' },
    { label: 'Excel Evening', batch: 'Excel', subBatch: 'Excel Evening' },
    { label: 'Conquer Morning', batch: 'Conquer', subBatch: 'Conquer Morning' },
    { label: 'Conquer Evening', batch: 'Conquer', subBatch: 'Conquer Evening' },
];

const STREAMS = [
    { value: 'Non-Medical', label: 'JEE (Non-Medical)' },
    { value: 'Medical', label: 'NEET (Medical)' },
];

const AttendanceConfigScreen = ({
    date, setDate,
    selectedSubBatch, setSelectedSubBatch,
    stream, setStream,
    loadingStudents,
    onBack, onLoad,
}) => (
    <Box sx={{ px: 2.5, py: 3, maxWidth: 480, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack}
                sx={{ minWidth: 0, p: 0.5, color: 'text.secondary' }} />
            <Typography variant="h6" fontWeight={800}>New Attendance</Typography>
        </Box>

        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid rgba(25,118,210,0.1)', mb: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#606770' }}>SELECT CLASS</Typography>

            <TextField fullWidth type="date" label="Date" value={date}
                onChange={e => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />

            <TextField fullWidth select label="Batch" value={selectedSubBatch?.label || ''}
                onChange={e => setSelectedSubBatch(SUB_BATCHES.find(b => b.label === e.target.value))} sx={{ mb: 2 }}>
                {SUB_BATCHES.map(b => <MenuItem key={b.label} value={b.label}>{b.label}</MenuItem>)}
            </TextField>

            <Typography variant="caption" fontWeight={700} color="text.secondary"
                sx={{ display: 'block', mb: 1 }}>STREAM</Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {STREAMS.map(s => (
                    <Chip key={s.value} label={s.label} clickable onClick={() => setStream(s.value)}
                        sx={{
                            fontWeight: 700, fontSize: '0.78rem', px: 0.5,
                            bgcolor: stream === s.value ? '#1976d2' : '#f5f7fa',
                            color: stream === s.value ? 'white' : '#606770',
                            border: stream === s.value ? '1.5px solid #1976d2' : '1.5px solid #e0e0e0',
                            '&:hover': { bgcolor: stream === s.value ? '#1565c0' : '#eff0f2' },
                        }} />
                ))}
            </Box>
        </Paper>

        <Button variant="contained" fullWidth
            disabled={!selectedSubBatch || !stream || loadingStudents} onClick={onLoad}
            sx={{ py: 1.75, fontSize: '1rem', fontWeight: 800, borderRadius: 2.5 }}>
            {loadingStudents ? <CircularProgress size={22} color="inherit" /> : 'Load Students'}
        </Button>
    </Box>
);

export default AttendanceConfigScreen;
