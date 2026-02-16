import React from 'react';
import { Card, Box, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PerformanceChart = ({ students }) => {
    return (
        <Card className="glass-card" sx={{ p: 3, width: '1000px' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Typography variant="h6">Academic Trajectory</Typography>
                <Box display="flex" gap={2}>
                    <Box display="flex" alignItems="center">
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main', mr: 1 }} />
                        <Typography variant="caption" fontWeight={600}>SCORE %</Typography>
                    </Box>
                </Box>
            </Box>
            <Box height={350}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={students}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 600 }}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="performanceScore"
                            stroke="#1a237e"
                            strokeWidth={4}
                            dot={{ r: 6, fill: '#1a237e', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Card>
    );
};

export default PerformanceChart;
