import React, { useState } from 'react';
import { Box, Typography, Button, ButtonGroup } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * SubjectTrendChart Component
 * Renders a multi-line chart showing trends in Mathematics, Science, and English.
 * 
 * @param {Array} marks - Array of mark objects from the student report
 */
const SubjectTrendChart = ({ marks, stream }) => {
    const [selectedSubjects, setSelectedSubjects] = useState(['All']);

    // Transform marks data for the chart
    const chartData = marks?.map(m => {
        const pMax = m.maxScores?.physics || 100;
        const cMax = m.maxScores?.chemistry || 100;
        const eMax = m.maxScores?.maths || 100;
        const botMax = m.maxScores?.botany || 100;
        const zooMax = m.maxScores?.zoology || 100;

        return {
            date: new Date(m.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
            testNames: m.testNames,
            Physics: Math.round((m.scores.physics / pMax) * 100) || 0,
            Chemistry: Math.round((m.scores.chemistry / cMax) * 100) || 0,
            Elective: stream === 'Non-Medical' ? Math.round((m.scores.maths / eMax) * 100) || 0 : undefined,
            Botany: stream === 'Medical' ? Math.round((m.scores.botany / botMax) * 100) || 0 : undefined,
            Zoology: stream === 'Medical' ? Math.round((m.scores.zoology / zooMax) * 100) || 0 : undefined,
            Attendance: m.attendance,
            Total: m.totalScore
        };
    }); // Backend already sorts by date (oldest to newest)

    if (!chartData || chartData.length === 0) {
        return (
            <Box sx={{ mb: 4, p: 4, border: '1px solid #f0f0f0', borderRadius: 1.5, textAlign: 'center', bgcolor: '#fafafa' }}>
                <Typography variant="body2" color="textSecondary">No test records found for the selected timeframe.</Typography>
            </Box>
        );
    }

    const filterOptions = ['All', 'Physics', 'Chemistry'];
    if (stream === 'Non-Medical') filterOptions.push('Mathematics');
    if (stream === 'Medical') {
        filterOptions.push('Botany', 'Zoology');
    }

    return (
        <Box sx={{ mb: 4, p: 2, border: '1px solid #f0f0f0', borderRadius: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    Performance Trends: Physics, Chemistry & {stream === 'Medical' ? 'Botany, Zoology' : 'Mathematics'}
                </Typography>
                <ButtonGroup variant="outlined" size="small" aria-label="subject-filter">
                    {filterOptions.map(option => (
                        <Button
                            key={option}
                            onClick={() => {
                                let newSelection = [...selectedSubjects];
                                if (option === 'All') {
                                    newSelection = ['All'];
                                } else {
                                    if (newSelection.includes('All')) {
                                        newSelection = [option];
                                    } else if (newSelection.includes(option)) {
                                        newSelection = newSelection.filter(s => s !== option);
                                        if (newSelection.length === 0) newSelection = ['All'];
                                    } else {
                                        newSelection.push(option);
                                    }
                                }
                                setSelectedSubjects(newSelection);
                            }}
                            variant={selectedSubjects.includes(option) ? 'contained' : 'outlined'}
                            sx={{
                                fontSize: '0.65rem',
                                fontWeight: selectedSubjects.includes(option) ? 700 : 500,
                                px: 1.5,
                            }}
                        >
                            {option}
                        </Button>
                    ))}
                </ButtonGroup>
            </Box>
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
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <Box sx={{
                                            bgcolor: 'rgba(255, 255, 255, 0.95)',
                                            p: 1.5,
                                            border: '1px solid #eee',
                                            borderRadius: 2,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            fontSize: 12
                                        }}>
                                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, borderBottom: '1px solid #eee', pb: 0.5 }}>
                                                {label}
                                            </Typography>
                                            {payload.map((entry, index) => {
                                                const subjectKey = entry.dataKey.toLowerCase();
                                                const testName = entry.payload.testNames?.[subjectKey] || 'Combined test';
                                                // Handle 'elective' mapping back to maths
                                                const finalTestName = subjectKey === 'elective'
                                                    ? (entry.payload.testNames?.maths || 'Combined test')
                                                    : testName;

                                                return (
                                                    <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color, mr: 1 }} />
                                                        <Typography variant="body2" sx={{ color: entry.color, fontWeight: 600, mr: 1 }}>
                                                            {entry.name}: {entry.value}%
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            ({finalTestName})
                                                        </Typography>
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 10 }} />

                        {(selectedSubjects.includes('All') || selectedSubjects.includes('Physics')) && (
                            <Line
                                type="monotone"
                                dataKey="Physics"
                                stroke="#1a73e8"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        )}
                        {(selectedSubjects.includes('All') || selectedSubjects.includes('Chemistry')) && (
                            <Line
                                type="monotone"
                                dataKey="Chemistry"
                                stroke="#34a853"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        )}
                        {stream === 'Non-Medical' && (selectedSubjects.includes('All') || selectedSubjects.includes('Mathematics')) && (
                            <Line
                                type="monotone"
                                dataKey="Elective"
                                name="Mathematics"
                                stroke="#fbbc05"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        )}
                        {stream === 'Medical' && (
                            <React.Fragment>
                                {(selectedSubjects.includes('All') || selectedSubjects.includes('Botany')) && (
                                    <Line
                                        type="monotone"
                                        dataKey="Botany"
                                        name="Botany"
                                        stroke="#fbbc05"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                )}
                                {(selectedSubjects.includes('All') || selectedSubjects.includes('Zoology')) && (
                                    <Line
                                        type="monotone"
                                        dataKey="Zoology"
                                        name="Zoology"
                                        stroke="#ec407a"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                )}
                            </React.Fragment>
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
};

export default SubjectTrendChart;
