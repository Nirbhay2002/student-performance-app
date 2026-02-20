import React from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Typography, IconButton, Grid, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import InsightsIcon from '@mui/icons-material/Insights';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

const MetricCard = ({ title, value, subtext, isPositive, icon, color }) => (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid #f0f0f0', borderRadius: 2, height: '100%', bgcolor: '#fff', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -15, right: -15, opacity: 0.05, transform: 'scale(2)' }}>
            {icon}
        </Box>
        <Typography variant="caption" fontWeight={700} color="textSecondary" textTransform="uppercase" letterSpacing={1}>
            {title}
        </Typography>
        <Typography variant="h3" fontWeight={900} sx={{ my: 1, color: color || 'text.primary' }}>
            {value}
        </Typography>
        <Box display="flex" alignItems="center" gap={0.5}>
            {isPositive === true && <TrendingUpIcon color="success" fontSize="small" />}
            {isPositive === false && <TrendingDownIcon color="error" fontSize="small" />}
            <Typography variant="caption" color={isPositive === true ? 'success.main' : isPositive === false ? 'error.main' : 'textSecondary'} fontWeight={600}>
                {subtext}
            </Typography>
        </Box>
    </Paper>
);

const PerformanceModal = ({ open, onClose, student }) => {
    if (!student) return null;

    // Rank calcs
    const currentRank = student.currentRank || student.rank || 0;
    const previousRank = student.previousRank || currentRank;
    const rankImprovement = previousRank - currentRank; // positive means they went up (e.g. 5 to 2 = +3)
    const bestRankDisplay = (student.bestRank && student.bestRank !== 999999) ? `#${student.bestRank}` : `#${currentRank}`;

    // Velocity calcs
    const currentScore = student.performanceScore || 0;
    const previousScore = student.previousPerformanceScore || currentScore;
    const velocity = currentScore - previousScore;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2, bgcolor: '#fbfbfb' } }}
            className="fade-in"
        >
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{ position: 'absolute', right: 16, top: 16, color: 'text.secondary', zIndex: 2 }}
            >
                <CloseIcon />
            </IconButton>

            <DialogTitle sx={{ px: 4, py: 3, borderBottom: '1px solid #eee' }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <InsightsIcon color="primary" />
                    <Box>
                        <Typography variant="h6" fontWeight={800}>Performance Intelligence</Typography>
                        <Typography variant="caption" color="textSecondary">Tracking velocity and rank for {student.name}</Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                    {/* Velocity Card */}
                    <Grid item xs={12}>
                        <MetricCard
                            title="Improvement Velocity"
                            value={`${velocity > 0 ? '+' : ''}${velocity.toFixed(2)}%`}
                            subtext={`Change from last test (${previousScore.toFixed(2)}% -> ${currentScore.toFixed(2)}%)`}
                            isPositive={velocity > 0 ? true : velocity < 0 ? false : null}
                            icon={<InsightsIcon fontSize="large" />}
                            color={velocity > 0 ? '#34a853' : velocity < 0 ? '#ea4335' : '#1a73e8'}
                        />
                    </Grid>

                    {/* Rank Change Card */}
                    <Grid item xs={12} sm={6}>
                        <MetricCard
                            title="Rank Change"
                            value={`${rankImprovement > 0 ? '+' : ''}${rankImprovement}`}
                            subtext={`Moved from #${previousRank} to #${currentRank}`}
                            isPositive={rankImprovement > 0 ? true : rankImprovement < 0 ? false : null}
                            icon={<CompareArrowsIcon fontSize="large" />}
                        />
                    </Grid>

                    {/* Best Rank Card */}
                    <Grid item xs={12} sm={6}>
                        <MetricCard
                            title="Highest Rank Achieved"
                            value={bestRankDisplay}
                            subtext={student.bestRank === currentRank ? "Peak Performance!" : "Historical best"}
                            isPositive={student.bestRank === currentRank ? true : null}
                            icon={<EmojiEventsIcon fontSize="large" />}
                            color="#c5a059"
                        />
                    </Grid>
                </Grid>
                <Box mt={4} textAlign="center">
                    <Typography variant="caption" color="textSecondary">Data is actively maintained for academic progression auditing.</Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default PerformanceModal;
