import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, Chip, Button, CircularProgress,
    Divider, TextField, IconButton, Tooltip, LinearProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import { studentService } from '../../services/studentService';

const PCT_COLOR = (pct) => pct >= 75 ? 'rgb(0,140,89)' : pct >= 50 ? '#f6a623' : '#d32f2f';
const PCT_BG = (pct) => pct >= 75 ? '#f0faf5' : pct >= 50 ? '#fff8ec' : '#fff0f0';
const PCT_BORDER = (pct) => pct >= 75 ? '#c3f0de' : pct >= 50 ? '#fde8b0' : '#ffd6d6';
const PCT_LABEL = (pct) => pct >= 75 ? 'Good' : pct >= 50 ? 'Needs Improvement' : 'Critical';

const StudentAttendanceModal = ({ open, onClose, student }) => {
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [attendancePct, setAttendancePct] = useState(null);
    const [showFilter, setShowFilter] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [appliedStart, setAppliedStart] = useState('');
    const [appliedEnd, setAppliedEnd] = useState('');

    const fetchData = useCallback(async (start = '', end = '') => {
        if (!student?._id) return;
        setLoading(true);
        try {
            const params = {};
            if (start) params.startDate = start;
            if (end) params.endDate = end;
            const data = await studentService.getStudentAttendance(student._id, params);
            setHistory(data.history || []);
            setAttendancePct(data.attendancePct ?? null);
        } catch (err) {
            console.error('Failed to load attendance:', err);
        } finally {
            setLoading(false);
        }
    }, [student?._id]);

    useEffect(() => {
        if (open) {
            setStartDate(''); setEndDate('');
            setAppliedStart(''); setAppliedEnd('');
            setShowFilter(false);
            fetchData('', '');
        }
    }, [open, fetchData]);

    const applyFilter = () => {
        setAppliedStart(startDate);
        setAppliedEnd(endDate);
        fetchData(startDate, endDate);
        setShowFilter(false);
    };

    const clearFilter = () => {
        setStartDate(''); setEndDate('');
        setAppliedStart(''); setAppliedEnd('');
        fetchData('', '');
    };

    const absentDays = history.filter(h => h.status === 'Absent');
    const presentDays = history.filter(h => h.status === 'Present');
    const hasFilter = !!(appliedStart || appliedEnd);

    const pct = attendancePct ?? 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>

            {/* Header */}
            <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h6" fontWeight={800}>{student?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{student?.rollNumber} · {student?.batch} · {student?.stream === 'Non-Medical' ? 'JEE' : 'NEET'}</Typography>
                </Box>
                <IconButton size="small" onClick={onClose} sx={{ mt: -0.5 }}><CloseIcon /></IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}><CircularProgress /></Box>
                ) : (
                    <>
                        {/* Overall Attendance % Card */}
                        {attendancePct !== null && (
                            <Box sx={{
                                p: 2.5, mb: 2.5, borderRadius: 2.5,
                                bgcolor: PCT_BG(pct),
                                border: `1.5px solid ${PCT_BORDER(pct)}`,
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
                                    <Box>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                                            OVERALL ATTENDANCE (ALL TIME)
                                        </Typography>
                                        <Typography variant="h3" fontWeight={900} sx={{ color: PCT_COLOR(pct), lineHeight: 1.1 }}>
                                            {pct}%
                                        </Typography>
                                    </Box>
                                    <Chip label={PCT_LABEL(pct)} size="small"
                                        sx={{ fontWeight: 800, bgcolor: PCT_COLOR(pct), color: 'white', fontSize: '0.72rem' }} />
                                </Box>
                                <LinearProgress variant="determinate" value={pct}
                                    sx={{
                                        height: 8, borderRadius: 4, bgcolor: 'rgba(0,0,0,0.08)',
                                        '& .MuiLinearProgress-bar': { bgcolor: PCT_COLOR(pct), borderRadius: 4 },
                                    }} />
                                <Box sx={{ display: 'flex', gap: 2, mt: 1.25 }}>
                                    <Typography variant="caption" fontWeight={600} sx={{ color: 'rgb(0,140,89)' }}>
                                        ✓ {presentDays.length} present
                                    </Typography>
                                    <Typography variant="caption" fontWeight={600} sx={{ color: '#d32f2f' }}>
                                        ✗ {absentDays.length} absent
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        out of {history.length} session{history.length !== 1 ? 's' : ''}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {/* Absent Days Section */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
                            <Typography variant="subtitle2" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <EventBusyIcon sx={{ fontSize: 16, color: '#d32f2f' }} />
                                Absent Days
                                {hasFilter && (
                                    <Chip label="Filtered" size="small" onDelete={clearFilter}
                                        sx={{
                                            ml: 0.5, fontSize: '0.6rem', height: 18, fontWeight: 700,
                                            bgcolor: 'rgba(25,118,210,0.08)', color: '#1976d2', border: '1px solid rgba(25,118,210,0.2)'
                                        }} />
                                )}
                            </Typography>
                            <Tooltip title="Filter by date range">
                                <IconButton size="small" onClick={() => setShowFilter(v => !v)}
                                    sx={{ color: hasFilter ? '#1976d2' : '#aaa' }}>
                                    <FilterListIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        {/* Date filter panel */}
                        {showFilter && (
                            <Box sx={{ p: 2, mb: 1.5, borderRadius: 2, border: '1px solid rgba(25,118,210,0.15)', bgcolor: 'rgba(25,118,210,0.03)' }}>
                                <Box sx={{ display: 'flex', gap: 1.5, mb: 1.25 }}>
                                    <TextField size="small" type="date" label="From" value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />
                                    <TextField size="small" type="date" label="To" value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />
                                </Box>
                                {/* Quick presets */}
                                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.25 }}>
                                    {[{ label: 'This Week', days: 7 }, { label: 'This Month', days: 30 }, { label: 'Last 3 Months', days: 90 }].map(p => {
                                        const e = new Date(); const s = new Date(); s.setDate(s.getDate() - p.days);
                                        return (
                                            <Chip key={p.label} label={p.label} size="small" clickable
                                                onClick={() => { setStartDate(s.toISOString().split('T')[0]); setEndDate(e.toISOString().split('T')[0]); }}
                                                sx={{ fontWeight: 600, fontSize: '0.68rem', bgcolor: '#f5f7fa', color: '#606770' }} />
                                        );
                                    })}
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button size="small" variant="outlined" fullWidth onClick={clearFilter} sx={{ borderRadius: 1.5 }}>Clear</Button>
                                    <Button size="small" variant="contained" fullWidth onClick={applyFilter} sx={{ borderRadius: 1.5 }}>Apply</Button>
                                </Box>
                            </Box>
                        )}

                        {/* Absent days list */}
                        {absentDays.length === 0 ? (
                            <Box sx={{ py: 4, textAlign: 'center' }}>
                                <CheckCircleIcon sx={{ fontSize: 40, color: 'rgb(0,192,122)', mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    {hasFilter ? 'No absent days in selected range.' : 'No absences recorded yet — perfect attendance!'}
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, maxHeight: 260, overflowY: 'auto', pr: 0.5 }}>
                                {absentDays.map(day => (
                                    <Box key={day._id} sx={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        px: 2, py: 1.25, borderRadius: 1.5,
                                        border: '1px solid #ffd6d6', bgcolor: '#fff8f8',
                                    }}>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1c1e21' }}>
                                                {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {day.batch} · {day.stream === 'Non-Medical' ? 'JEE' : 'NEET'}
                                            </Typography>
                                        </Box>
                                        <Chip label="Absent" size="small"
                                            sx={{ fontWeight: 700, fontSize: '0.65rem', bgcolor: '#fff0f0', color: '#d32f2f', border: '1px solid #ffd6d6' }} />
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default StudentAttendanceModal;
