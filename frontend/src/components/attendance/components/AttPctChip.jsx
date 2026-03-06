import React from 'react';
import { Chip, Tooltip } from '@mui/material';

const AttPctChip = ({ pct }) => {
    if (pct === undefined || pct === null) return null;
    const color = pct >= 75 ? 'rgb(0,140,89)' : pct >= 50 ? '#f6a623' : '#ff4444';
    const bg = pct >= 75 ? '#f0faf5' : pct >= 50 ? '#fff8ec' : '#fff0f0';
    const border = pct >= 75 ? '#c3f0de' : pct >= 50 ? '#fde8b0' : '#ffd6d6';
    return (
        <Tooltip title="Overall attendance %" placement="top" arrow>
            <Chip label={`${pct}%`} size="small"
                sx={{ fontWeight: 800, fontSize: '0.65rem', bgcolor: bg, color, border: `1px solid ${border}`, height: 20 }} />
        </Tooltip>
    );
};

export default AttPctChip;
