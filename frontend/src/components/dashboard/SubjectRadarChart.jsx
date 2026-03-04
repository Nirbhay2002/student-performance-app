import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip
} from 'recharts';
import api from '../../services/api';

const SUBJECT_LABELS = {
    physics: 'Physics',
    chemistry: 'Chemistry',
    maths: 'Maths',
    botany: 'Botany',
    zoology: 'Zoology',
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { subject, value } = payload[0].payload;
        return (
            <Box sx={{
                bgcolor: 'white', p: 1.5, border: '1px solid #eee',
                borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12
            }}>
                <Typography variant="body2" fontWeight={700}>{subject}</Typography>
                <Typography variant="body2" color="primary">{value}% avg</Typography>
            </Box>
        );
    }
    return null;
};

const SubjectRadarChart = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAverages = async () => {
            try {
                const res = await api.get('/marks/class-subject-averages');
                const avgs = res.data;

                // Build radar data array — only include subjects with any data (avg > 0)
                const radarData = Object.entries(avgs)
                    .map(([key, value]) => ({
                        subject: SUBJECT_LABELS[key] || key,
                        value: value ?? 0,
                    }))
                    .filter(d => d.value > 0);

                setData(radarData.length > 0 ? radarData : null);
            } catch (err) {
                console.error('Failed to fetch subject averages:', err.message);
                setError('Could not load subject averages.');
            } finally {
                setLoading(false);
            }
        };
        fetchAverages();
    }, []);

    const renderContent = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                    <CircularProgress size={40} />
                </Box>
            );
        }
        if (error || !data) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                        {error || 'No subject data available yet. Add marks to see averages.'}
                    </Typography>
                </Box>
            );
        }
        return (
            <Box sx={{ flexGrow: 1, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                        <PolarGrid stroke="#e8eaed" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fontSize: 12, fontWeight: 700, fill: '#3c4043' }}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fontSize: 10, fill: '#9aa0a6' }}
                            tickCount={5}
                        />
                        <Radar
                            name="Class Avg"
                            dataKey="value"
                            stroke="#1a73e8"
                            strokeWidth={2.5}
                            fill="#1a73e8"
                            fillOpacity={0.18}
                            dot={{ r: 4, fill: '#1a73e8', strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                </ResponsiveContainer>
            </Box>
        );
    };

    return (
        <Paper sx={{ p: 3, borderRadius: 1.5, height: '100%', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={800} color="primary">
                    Class Subject Averages
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Average score % per subject across all students
                </Typography>
            </Box>
            {renderContent()}
        </Paper>
    );
};

export default SubjectRadarChart;
