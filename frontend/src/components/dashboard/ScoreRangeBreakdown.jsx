import React, { useMemo } from 'react';
import { Paper, Typography, Box, LinearProgress } from '@mui/material';

const BUCKETS = [
    { label: 'Excellent', range: '80–100%', min: 80, max: 100, color: '#34a853', bg: '#e6f4ea' },
    { label: 'Good', range: '60–80%', min: 60, max: 80, color: '#1a73e8', bg: '#e8f0fe' },
    { label: 'Average', range: '40–60%', min: 40, max: 60, color: '#fbbc05', bg: '#fef9e0' },
    { label: 'Needs Work', range: '0–40%', min: 0, max: 40, color: '#ea4335', bg: '#fce8e6' },
];

const ScoreRangeBreakdown = ({ students }) => {
    const bucketData = useMemo(() => {
        if (!students?.length) return BUCKETS.map(b => ({ ...b, count: 0, pct: 0 }));
        return BUCKETS.map(b => {
            const count = students.filter(s => {
                const score = s.performanceScore || 0;
                return b.max === 100
                    ? score >= b.min && score <= b.max
                    : score >= b.min && score < b.max;
            }).length;
            return { ...b, count, pct: Math.round((count / students.length) * 100) };
        });
    }, [students]);

    return (
        <Paper sx={{ p: 3, borderRadius: 1.5, height: '100%', border: '1px solid #f0f0f0' }}>
            <Box sx={{ mb: 2.5 }}>
                <Typography variant="h6" fontWeight={800} color="primary">
                    Score Range Breakdown
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Absolute performance thresholds · {students?.length || 0} students
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {bucketData.map((b) => (
                    <Box key={b.label}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{
                                    width: 10, height: 10, borderRadius: '50%',
                                    bgcolor: b.color, flexShrink: 0
                                }} />
                                <Typography variant="body2" fontWeight={700}>{b.label}</Typography>
                                <Typography variant="caption" color="textSecondary">({b.range})</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body2" fontWeight={900} sx={{ color: b.color }}>
                                    {b.count}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">{b.pct}%</Typography>
                            </Box>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={b.pct}
                            sx={{
                                height: 10,
                                borderRadius: 5,
                                bgcolor: b.bg,
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 5,
                                    bgcolor: b.color,
                                },
                            }}
                        />
                    </Box>
                ))}
            </Box>

            {/* Divider summary row */}
            <Box sx={{
                mt: 3, pt: 2, borderTop: '1px solid #f0f0f0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <Typography variant="caption" color="textSecondary" fontWeight={600}>
                    Based on overall performance score
                </Typography>
                <Typography variant="caption" fontWeight={800} color="primary">
                    Total: {students?.length || 0}
                </Typography>
            </Box>
        </Paper>
    );
};

export default ScoreRangeBreakdown;
