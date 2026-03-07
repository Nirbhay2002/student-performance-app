import React, { useState, useEffect, useRef } from 'react';
import {
    Paper, Typography, Box, CircularProgress, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, LabelList
} from 'recharts';
import DateRangeFilter from './DateRangeFilter';
import api from '../../services/api';

const SUBJECTS = [
    { key: 'physics', label: 'Physics' },
    { key: 'chemistry', label: 'Chemistry' },
    { key: 'maths', label: 'Maths' },
    { key: 'botany', label: 'Botany' },
    { key: 'zoology', label: 'Zoology' },
];

const getBarColor = (pct) => {
    if (pct >= 70) return '#34a853'; // green — good
    if (pct >= 40) return '#fbbc05'; // yellow — average
    return '#ea4335';                // red — weak
};

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const color = getBarColor(d.avgPct);
    return (
        <Box sx={{
            bgcolor: 'white', p: 1.5, border: '1px solid #eee',
            borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            minWidth: 180
        }}>
            <Typography variant="body2" fontWeight={800} sx={{ mb: 0.5 }}>{d.testName}</Typography>
            <Typography variant="body2" sx={{ color, fontWeight: 700 }}>
                {d.avgPct}% class average
            </Typography>
            <Typography variant="caption" color="textSecondary">
                {d.count} student{d.count !== 1 ? 's' : ''} appeared
            </Typography>
        </Box>
    );
};

const TestPerformanceChart = () => {
    const [subject, setSubject] = useState('physics');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activePreset, setActivePreset] = useState('6m');
    const [data, setData] = useState([]);

    useEffect(() => {
        if (activePreset === '6m' && !startDate && !endDate) {
            const end = new Date();
            const start = new Date();
            start.setMonth(end.getMonth() - 6);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(end.toISOString().split('T')[0]);
        }
    }, [activePreset, startDate, endDate]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchRef = useRef(0);

    useEffect(() => {
        const id = ++fetchRef.current;
        setLoading(true);
        setError(null);

        const params = { subject };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        api.get('/marks/test-performance', { params })
            .then(res => {
                if (fetchRef.current !== id) return; // stale, ignore
                setData(res.data);
            })
            .catch(err => {
                if (fetchRef.current !== id) return;
                setError('Could not load test data.');
                console.error(err.message);
            })
            .finally(() => {
                if (fetchRef.current === id) setLoading(false);
            });
    }, [subject, startDate, endDate]);

    // Dynamic bar height: min 40px per test, cap at 480px
    const chartHeight = Math.min(Math.max(data.length * 48, 200), 480);

    const renderContent = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <CircularProgress size={36} />
                </Box>
            );
        }
        if (error) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Typography variant="body2" color="error">{error}</Typography>
                </Box>
            );
        }
        if (!data.length) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" color="textSecondary" fontWeight={600}>
                        No test data found for this subject / timeframe.
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        Try switching subjects or expanding the date range.
                    </Typography>
                </Box>
            );
        }
        return (
            <Box sx={{ width: '100%', height: chartHeight, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 4, right: 64, left: 8, bottom: 4 }}
                        barCategoryGap="28%"
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis
                            type="number"
                            domain={[0, 100]}
                            ticks={[0, 25, 50, 75, 100]}
                            tickFormatter={v => `${v}%`}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#9aa0a6', fontWeight: 600 }}
                        />
                        <YAxis
                            type="category"
                            dataKey="testName"
                            width={160}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#3c4043', fontWeight: 600 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                        <Bar dataKey="avgPct" radius={[0, 6, 6, 0]} isAnimationActive={true}>
                            {data.map((entry, i) => (
                                <Cell key={i} fill={getBarColor(entry.avgPct)} />
                            ))}
                            <LabelList
                                dataKey="avgPct"
                                position="right"
                                formatter={v => `${v}%`}
                                style={{ fontSize: 12, fontWeight: 800, fill: '#3c4043' }}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        );
    };

    return (
        <Paper sx={{ p: 3, borderRadius: 1.5, border: '1px solid #f0f0f0', mt: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={800} color="primary">
                    Chapter Wise Performance
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Class-wide average % per chapter · sorted highest → lowest · color indicates performance level
                </Typography>
            </Box>

            {/* Filters row */}
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', flexWrap: 'wrap', mb: 1 }}>
                {/* Subject toggle */}
                <Box>
                    <Typography variant="caption" fontWeight={700} color="textSecondary"
                        sx={{ textTransform: 'uppercase', display: 'block', mb: 1 }}>
                        Subject
                    </Typography>
                    <ToggleButtonGroup
                        value={subject}
                        exclusive
                        onChange={(_, val) => { if (val) setSubject(val); }}
                        size="small"
                    >
                        {SUBJECTS.map(s => (
                            <ToggleButton key={s.key} value={s.key} sx={{ px: 2, fontSize: '0.72rem', fontWeight: 600 }}>
                                {s.label}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>

                {/* Date range */}
                <Box sx={{ flex: 1, minWidth: 280 }}>
                    <DateRangeFilter
                        startDate={startDate}
                        endDate={endDate}
                        activePreset={activePreset}
                        onStartDate={setStartDate}
                        onEndDate={setEndDate}
                        onActivePreset={setActivePreset}
                    />
                </Box>
            </Box>

            {/* Legend */}
            <Box sx={{ display: 'flex', gap: 2.5, mb: 1 }}>
                {[
                    { color: '#ea4335', label: 'Weak (<40%)' },
                    { color: '#fbbc05', label: 'Average (40–70%)' },
                    { color: '#34a853', label: 'Good (>70%)' },
                ].map(item => (
                    <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                        <Typography variant="caption" fontWeight={600} color="textSecondary">{item.label}</Typography>
                    </Box>
                ))}
            </Box>

            {renderContent()}
        </Paper>
    );
};

export default TestPerformanceChart;
