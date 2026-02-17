import React from 'react';
import { Box, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * SubjectTrendChart Component
 * Renders a multi-line chart showing trends in Mathematics, Science, and English.
 * 
 * @param {Array} marks - Array of mark objects from the student report
 */
const SubjectTrendChart = ({ marks, stream }) => {
    // Transform marks data for the chart
    const chartData = marks?.map(m => ({
        date: new Date(m.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
        Physics: m.scores.physics,
        Chemistry: m.scores.chemistry,
        Elective: stream === 'Medical' ? m.scores.bio : m.scores.maths,
        Attendance: m.attendance,
        Total: m.totalScore
    })); // Backend already sorts by date (oldest to newest)

    if (!chartData || chartData.length === 0) {
        return (
            <Box sx={{ mb: 4, p: 4, border: '1px solid #f0f0f0', borderRadius: 1.5, textAlign: 'center', bgcolor: '#fafafa' }}>
                <Typography variant="body2" color="textSecondary">No test records found for the selected timeframe.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mb: 4, p: 2, border: '1px solid #f0f0f0', borderRadius: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                Performance Trends: Physics, Chemistry & {stream === 'Medical' ? 'Biology' : 'Mathematics'}
            </Typography>
            <Box height={250}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 600 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 600 }}
                            domain={[0, 100]}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: 12,
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                fontSize: 12
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 10 }} />
                        <Line
                            type="monotone"
                            dataKey="Physics"
                            stroke="#1a73e8"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="Chemistry"
                            stroke="#34a853"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="Elective"
                            name={stream === 'Medical' ? 'Biology' : 'Mathematics'}
                            stroke="#fbbc05"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
};

export default SubjectTrendChart;
