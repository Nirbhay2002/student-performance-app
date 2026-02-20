import React, { useMemo } from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PerformanceDistributionChart = ({ students, navigate }) => {
    const theme = useTheme();

    const distributionData = useMemo(() => {
        if (!students.length) return [];

        const brackets = [
            { label: 'Worst (Bottom 25%)', color: '#ea4335', category: 'Worst' },
            { label: 'Medium (Middle 50%)', color: '#fbbc05', category: 'Medium' },
            { label: 'Best (Top 25%)', color: '#34a853', category: 'Best' }
        ];

        return brackets.map(b => {
            const count = students.filter(s => s.category === b.category).length;

            return {
                name: b.label,
                count,
                color: b.color,
                category: b.category
            };
        });
    }, [students]);

    const handleBarClick = (data) => {
        if (navigate && data && data.category) {
            navigate(1, { category: data.category });
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
