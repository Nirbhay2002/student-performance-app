import React, { useMemo } from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PerformanceDistributionChart = ({ students, navigate }) => {
    const theme = useTheme();

    const distributionData = useMemo(() => {
        if (!students.length) return [];

        const brackets = [
            { label: '0-20%', min: 0, max: 20, color: '#ea4335' },
            { label: '20-40%', min: 20, max: 40, color: '#fb8c00' },
            { label: '40-60%', min: 40, max: 60, color: '#fbbc05' },
            { label: '60-80%', min: 60, max: 80, color: '#1a73e8' },
            { label: '80-100%', min: 80, max: 100, color: '#34a853' }
        ];

        return brackets.map(b => {
            const count = students.filter(s => {
                const score = s.performanceScore || 0;
                return score >= b.min && (b.max === 100 ? score <= b.max : score < b.max);
            }).length;

            return {
                name: b.label,
                count,
                color: b.color,
                min: b.min,
                max: b.max
            };
        });
    }, [students]);

    const handleBarClick = (data) => {
        if (navigate && data) {
            navigate(1, { performanceMin: data.min, performanceMax: data.max });
        }
    };

    return (
        <Paper sx={{ p: 3, borderRadius: 1.5, height: '450px', width: '550px', display: 'flex', flexDirection: 'column', border: '1px solid #f0f0f0' }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={800} color="primary">Performance Distribution</Typography>
                <Typography variant="body2" color="textSecondary">Distribution of {students.length} students across score brackets</Typography>
            </Box>

            <Box sx={{ flexGrow: 1, width: '100%', mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distributionData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#5f6368', fontSize: 12, fontWeight: 600 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#5f6368', fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        />
                        <Bar
                            dataKey="count"
                            radius={[8, 8, 0, 0]}
                            barSize={60}
                            onClick={handleBarClick}
                            cursor="pointer"
                        >
                            {distributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default PerformanceDistributionChart;
