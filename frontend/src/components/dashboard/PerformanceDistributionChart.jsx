import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
    PieChart, Pie, Cell, Legend, ResponsiveContainer
} from 'recharts';

const RADIAN = Math.PI / 180;
// How far (px) beyond outerRadius to place the tooltip anchor
const TOOLTIP_OFFSET = 15;

// Percentage label rendered inside each slice
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, count, pct }) => {
    if (count === 0) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: 12, fontWeight: 800 }}>
            {pct}%
        </text>
    );
};

const PerformanceDistributionChart = ({ students, navigate }) => {
    const total = students.length;
    const [activeSlice, setActiveSlice] = useState(null);

    // One-time mount animation: animate on first render only
    const didAnimate = useRef(false);
    useEffect(() => {
        // After mount animation completes, lock it off so hover re-renders don't re-trigger it
        const t = setTimeout(() => { didAnimate.current = true; }, 1000);
        return () => clearTimeout(t);
    }, []);

    // Tooltip delay: only show after hovering for 500ms
    const tooltipTimer = useRef(null);

    const distributionData = useMemo(() => {
        if (!total) return [];
        const brackets = [
            { name: 'Best', color: '#34a853', category: 'Best' },
            { name: 'Medium', color: '#fbbc05', category: 'Medium' },
            { name: 'Worst', color: '#ea4335', category: 'Worst' },
        ];
        return brackets.map(b => {
            const count = students.filter(s => s.category === b.category).length;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return { ...b, count, pct };
        });
    }, [students]);

    const handleSliceClick = (data) => {
        if (navigate && data && data.category) {
            navigate(1, { category: data.category });
        }
    };

    // recharts passes real pixel values for cx, cy, outerRadius, midAngle
    const handleMouseEnter = (data, index) => {
        clearTimeout(tooltipTimer.current);
        tooltipTimer.current = setTimeout(() => {
            const { cx, cy, outerRadius, midAngle } = data;
            const angle = -midAngle * RADIAN;
            const tipX = cx + (outerRadius + TOOLTIP_OFFSET) * Math.cos(angle);
            const tipY = cy + (outerRadius + TOOLTIP_OFFSET) * Math.sin(angle);
            setActiveSlice({ ...distributionData[index], tipX, tipY });
        }, 500);
    };

    const handleMouseLeave = () => {
        clearTimeout(tooltipTimer.current);
        setActiveSlice(null);
    };

    // Determine tooltip alignment based on which side of the chart it lands on
    const getTooltipTransform = (tipX, containerWidth = 400) => {
        const midX = containerWidth / 2;
        if (tipX < midX - 20) return 'translate(-100%, -50%)'; // left side → anchor right edge
        if (tipX > midX + 20) return 'translate(0%, -50%)';    // right side → anchor left edge
        return 'translate(-50%, -100%)';                          // top/bottom → center above
    };

    return (
        <Paper sx={{ p: 3, borderRadius: 1.5, height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #f0f0f0' }}>
            <Box sx={{ mb: 1 }}>
                <Typography variant="h6" fontWeight={800} color="primary">Performance Distribution</Typography>
                <Typography variant="body2" color="textSecondary">
                    Click a segment to filter students by category
                </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, width: '100%', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={distributionData}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius="52%"
                            outerRadius="75%"
                            paddingAngle={3}
                            onClick={handleSliceClick}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            cursor="pointer"
                            labelLine={false}
                            label={renderCustomLabel}
                            isAnimationActive={!didAnimate.current}
                        >
                            {distributionData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' }}
                                />
                            ))}
                        </Pie>
                        <Legend
                            iconType="circle"
                            iconSize={10}
                            wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 8 }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center label — sits inside the donut hole */}
                <Box sx={{
                    position: 'absolute',
                    top: '44%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                }}>
                    <Typography sx={{ fontSize: 30, fontWeight: 900, color: '#1a1a2e', lineHeight: 1 }}>
                        {total}
                    </Typography>
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#9aa0a6', mt: 0.25 }}>
                        students
                    </Typography>
                </Box>

                {/* Custom tooltip — anchored outside the slice's outer edge */}
                {activeSlice && (
                    <Box sx={{
                        position: 'absolute',
                        left: activeSlice.tipX,
                        top: activeSlice.tipY,
                        transform: getTooltipTransform(activeSlice.tipX),
                        bgcolor: 'white',
                        p: 1.5,
                        border: '1px solid #eee',
                        borderRadius: 2,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                        pointerEvents: 'none',
                        zIndex: 10,
                        whiteSpace: 'nowrap',
                        minWidth: 140,
                    }}>
                        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.25 }}>
                            {activeSlice.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: activeSlice.color, fontWeight: 600 }}>
                            {activeSlice.count} students
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'primary.main', display: 'block', mt: 0.5 }}>
                            Click to filter →
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default PerformanceDistributionChart;
