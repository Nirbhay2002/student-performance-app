import React from 'react';
import { Box, Typography, Button, Chip, TextField, Collapse, MenuItem } from '@mui/material';
import { SUB_BATCHES } from './AttendanceConfigScreen';

const PRESETS = [
    { label: 'This Week', days: 7 },
    { label: 'This Month', days: 30 },
    { label: 'Last 3 Months', days: 90 },
];

const HistoryFilterPanel = ({ open, startDate, endDate, setStartDate, setEndDate, selectedSubBatch, setSelectedSubBatch, onApply, onClear }) => (
    <Collapse in={open}>
        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(25,118,210,0.08)' }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary"
                sx={{ display: 'block', mb: 1 }}>FILTER BY CLASS</Typography>
            <TextField fullWidth select size="small" label="Batch / Sub-Batch" value={selectedSubBatch?.label || 'All'}
                onChange={e => setSelectedSubBatch(SUB_BATCHES.find(b => b.label === e.target.value) || null)}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.8rem' } }}>
                <MenuItem value="All">All Batches</MenuItem>
                {SUB_BATCHES.map(b => <MenuItem key={b.label} value={b.label}>{b.label}</MenuItem>)}
            </TextField>

            <Typography variant="caption" fontWeight={700} color="text.secondary"
                sx={{ display: 'block', mb: 1 }}>FILTER BY DATE RANGE</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField size="small" type="date" label="From" value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.8rem' } }} />
                <TextField size="small" type="date" label="To" value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.8rem' } }} />
            </Box>
            {/* Quick presets */}
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
                {PRESETS.map(preset => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() - preset.days);
                    return (
                        <Chip key={preset.label} label={preset.label} size="small" clickable
                            onClick={() => {
                                setStartDate(start.toISOString().split('T')[0]);
                                setEndDate(end.toISOString().split('T')[0]);
                            }}
                            sx={{ fontWeight: 600, fontSize: '0.68rem', bgcolor: '#f5f7fa', color: '#606770' }} />
                    );
                })}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" fullWidth onClick={onClear}
                    sx={{ borderRadius: 2, fontSize: '0.78rem' }}>Clear</Button>
                <Button size="small" variant="contained" fullWidth onClick={onApply}
                    sx={{ borderRadius: 2, fontSize: '0.78rem' }}>Apply</Button>
            </Box>
        </Box>
    </Collapse>
);

export default HistoryFilterPanel;
