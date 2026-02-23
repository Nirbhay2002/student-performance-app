import React from 'react';
import { Box, Button, Grid, TextField, Typography } from '@mui/material';

const PRESETS = [
    { label: '1 Month', value: '1m' },
    { label: '3 Months', value: '3m' },
    { label: '6 Months', value: '6m' },
    { label: '1 Year', value: '1y' },
    { label: 'All Time', value: 'all' },
];

const DateRangeFilter = ({ startDate, endDate, activePreset, onStartDate, onEndDate, onActivePreset }) => {
    const handlePreset = (preset) => {
        onActivePreset(preset);
        if (preset === 'all') {
            onStartDate('');
            onEndDate('');
            return;
        }

        const end = new Date();
        const start = new Date();

        switch (preset) {
            case '1m': start.setMonth(end.getMonth() - 1); break;
            case '3m': start.setMonth(end.getMonth() - 3); break;
            case '6m': start.setMonth(end.getMonth() - 6); break;
            case '1y': start.setFullYear(end.getFullYear() - 1); break;
            default: return;
        }

        onStartDate(start.toISOString().split('T')[0]);
        onEndDate(end.toISOString().split('T')[0]);
    };

    return (
        <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 1.5, bgcolor: '#fff' }}>
            <Typography variant="caption" fontWeight={700} color="textSecondary" sx={{ mb: 1.5, display: 'block', textTransform: 'uppercase' }}>
                Analysis Timeframe
            </Typography>
            <Grid container spacing={2.5}>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {PRESETS.map(preset => (
                            <Button
                                key={preset.value}
                                size="small"
                                variant={activePreset === preset.value ? 'contained' : 'outlined'}
                                onClick={() => handlePreset(preset.value)}
                                sx={{ borderRadius: 4, px: 2, fontSize: '0.7rem' }}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            type="date"
                            size="small"
                            label="From"
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ max: new Date().toISOString().split('T')[0] }}
                            value={startDate}
                            onChange={(e) => { onStartDate(e.target.value); onActivePreset('custom'); }}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            type="date"
                            size="small"
                            label="To"
                            InputLabelProps={{ shrink: true }}
                            inputProps={{
                                max: new Date().toISOString().split('T')[0],
                                min: startDate
                            }}
                            disabled={!startDate}
                            value={endDate}
                            onChange={(e) => { onEndDate(e.target.value); onActivePreset('custom'); }}
                            sx={{ flex: 1 }}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DateRangeFilter;
