import React, { useState } from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const ABSENT_COLOR = '#ff4444';
const PRESENT_COLOR = 'rgb(0,192,122)';
const THRESHOLD = 72;

const SwipeableRow = ({ student, status, onChange }) => {
    const [startX, setStartX] = useState(null);
    const [deltaX, setDeltaX] = useState(0);
    const [swiping, setSwiping] = useState(false);
    const isAbsent = status === 'Absent';

    const onPointerDown = (e) => {
        setStartX(e.clientX);
        setSwiping(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e) => {
        if (!swiping || startX === null) return;
        setDeltaX(e.clientX - startX);
    };
    const onPointerUp = () => {
        if (Math.abs(deltaX) > THRESHOLD) onChange(student._id, isAbsent ? 'Present' : 'Absent');
        setDeltaX(0); setSwiping(false); setStartX(null);
    };

    const clampedDelta = Math.max(-90, Math.min(90, deltaX));

    return (
        <Box sx={{ position: 'relative', mb: 1.25, borderRadius: 2, overflow: 'hidden', userSelect: 'none' }}>
            {/* Background hint */}
            <Box sx={{
                position: 'absolute', inset: 0,
                bgcolor: isAbsent ? (clampedDelta > 0 ? PRESENT_COLOR : ABSENT_COLOR) : (clampedDelta > 0 ? ABSENT_COLOR : PRESENT_COLOR),
                display: 'flex', alignItems: 'center', px: 2.5,
                justifyContent: clampedDelta > 0 ? 'flex-start' : 'flex-end',
            }}>
                {clampedDelta > 0
                    ? (isAbsent ? <CheckCircleIcon sx={{ color: 'white' }} /> : <CancelIcon sx={{ color: 'white' }} />)
                    : (isAbsent ? <CancelIcon sx={{ color: 'white' }} /> : <CheckCircleIcon sx={{ color: 'white' }} />)}
            </Box>

            {/* Foreground card */}
            <Paper elevation={0}
                onPointerDown={onPointerDown} onPointerMove={onPointerMove}
                onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
                sx={{
                    position: 'relative', zIndex: 1,
                    transform: `translateX(${clampedDelta}px)`,
                    transition: swiping ? 'none' : 'transform 0.25s ease',
                    borderRadius: 2,
                    border: `2px solid ${isAbsent ? ABSENT_COLOR : PRESENT_COLOR}`,
                    bgcolor: 'white', px: 2, py: 1.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'grab', touchAction: 'pan-y', WebkitUserSelect: 'none',
                }}
            >
                <Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1c1e21' }}>{student.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{student.rollNumber}</Typography>
                </Box>
                <Chip
                    label={isAbsent ? 'Absent' : 'Present'}
                    size="small"
                    icon={isAbsent ? <CancelIcon style={{ fontSize: 14 }} /> : <CheckCircleIcon style={{ fontSize: 14 }} />}
                    sx={{
                        bgcolor: isAbsent ? '#fff0f0' : '#f0faf5',
                        color: isAbsent ? ABSENT_COLOR : PRESENT_COLOR,
                        fontWeight: 700, fontSize: '0.68rem',
                        border: `1px solid ${isAbsent ? '#ffd6d6' : '#c3f0de'}`,
                        '& .MuiChip-icon': { color: isAbsent ? ABSENT_COLOR : PRESENT_COLOR },
                    }}
                />
            </Paper>
        </Box>
    );
};

export default SwipeableRow;
