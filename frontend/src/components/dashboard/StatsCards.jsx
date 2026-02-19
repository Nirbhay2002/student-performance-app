import React from 'react';
import { Grid, Card, CardContent, Box, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GradeIcon from '@mui/icons-material/Grade';

const StatsCards = ({ students, navigate }) => {
    const avgScore = students.length > 0
        ? (students.reduce((acc, s) => acc + (s?.averageMarks || 0), 0) / students.length).toFixed(1)
        : 0;

    const eliteCount = students.filter(s => s.category === 'Best').length;

    const stats = [
        {
            label: 'Total Students',
            value: students.length,
            icon: <PersonIcon sx={{ fontSize: 32 }} />,
            gradient: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            color: 'primary.main'
        },
        {
            label: 'Average Score',
            value: avgScore,
            caption: 'OUT OF 300 MARKS',
            icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
            gradient: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
            color: 'success.main'
        },
        {
            label: 'Elite Performers',
            value: eliteCount,
            icon: <GradeIcon sx={{ fontSize: 32 }} />,
            gradient: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
            color: 'warning.main'
        }
    ];

    const handleCardClick = (stat) => {
        if (!navigate) return;
        if (stat.label === 'Total Students') {
            navigate(1); // Go to Student Records
        } else if (stat.label === 'Elite Performers') {
            navigate(1, { category: 'Best' });
        }
    };

    return (
        <Grid container spacing={4} sx={{ mb: 6 }}>
            {stats.map((stat, idx) => (
                <Grid item xs={12} md={4} key={idx}>
                    <Card
                        className="glass-card"
                        sx={{
                            height: '100%',
                            cursor: (stat.label === 'Total Students' || stat.label === 'Elite Performers') ? 'pointer' : 'default',
                            transition: 'transform 0.2s',
                            '&:hover': (stat.label === 'Total Students' || stat.label === 'Elite Performers') ? { transform: 'translateY(-4px)' } : {}
                        }}
                        onClick={() => handleCardClick(stat)}
                    >
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <Box sx={{ p: 2, borderRadius: 1.5, background: stat.gradient, color: stat.color, mr: 2.5 }}>
                                    {stat.icon}
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="textSecondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>
                                        {stat.label}
                                    </Typography>
                                    <Typography variant="h3" fontWeight={900}>{stat.value}</Typography>
                                    {stat.caption && (
                                        <Typography variant="caption" color="textSecondary" fontWeight={700}>
                                            {stat.caption}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default StatsCards;
