import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, CircularProgress, Chip,
    Snackbar, Alert, Paper, Collapse, IconButton, Divider,
    TextField, LinearProgress, Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { studentService } from '../../services/studentService';

// ─── Attendance % Pill ───────────────────────────────────────────────────────
const AttPctChip = ({ pct }) => {
    if (pct === undefined || pct === null) return null;
    const color = pct >= 75 ? 'rgb(0,140,89)' : pct >= 50 ? '#f6a623' : '#ff4444';
    const bg = pct >= 75 ? '#f0faf5' : pct >= 50 ? '#fff8ec' : '#fff0f0';
    const border = pct >= 75 ? '#c3f0de' : pct >= 50 ? '#fde8b0' : '#ffd6d6';
    return (
        <Tooltip title="Overall attendance %" placement="top" arrow>
            <Chip label={`${pct}%`} size="small"
                sx={{ fontWeight: 800, fontSize: '0.65rem', bgcolor: bg, color, border: `1px solid ${border}`, height: 20 }} />
        </Tooltip>
    );
};

// ─── Swipe-to-Delete History Row ─────────────────────────────────────────────
const HistoryRow = ({ session, onDelete, summaryMap }) => {
    const [startX, setStartX] = useState(null);
    const [deltaX, setDeltaX] = useState(0);
    const [swiping, setSwiping] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const THRESHOLD = 80;

    const onPointerDown = (e) => { setStartX(e.clientX); setSwiping(true); e.currentTarget.setPointerCapture(e.pointerId); };
    const onPointerMove = (e) => { if (!swiping || startX === null) return; const d = e.clientX - startX; if (d < 0) setDeltaX(d); };
    const onPointerUp = () => { if (deltaX < -THRESHOLD) onDelete(session._id); setDeltaX(0); setSwiping(false); setStartX(null); };

    const clamp = Math.max(-90, deltaX);
    const dateStr = new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const pct = session.totalCount > 0 ? Math.round((session.presentCount / session.totalCount) * 100) : 0;
    const barColor = pct >= 75 ? 'rgb(0,192,122)' : pct >= 50 ? '#f6a623' : '#ff4444';

    return (
        <Box sx={{ position: 'relative', mb: 1.5, borderRadius: 2, overflow: 'hidden' }}>
            {/* Delete reveal */}
            <Box sx={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: 90,
                bgcolor: '#ff4444', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2,
            }}>
                <DeleteIcon sx={{ color: 'white' }} />
            </Box>

            <Paper elevation={0} sx={{
                position: 'relative', zIndex: 1,
                transform: `translateX(${clamp}px)`,
                transition: swiping ? 'none' : 'transform 0.25s ease',
                border: '1px solid rgba(25,118,210,0.1)', borderRadius: 2, bgcolor: 'white', userSelect: 'none',
            }}>
                <Box onPointerDown={onPointerDown} onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
                    sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'grab', touchAction: 'pan-y' }}>
                    <Box sx={{ flex: 1, mr: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                            <Typography variant="subtitle2" fontWeight={700}>{dateStr}</Typography>
                            <Chip label={`${session.batch} · ${session.stream === 'Non-Medical' ? 'JEE' : 'NEET'}`}
                                size="small" sx={{ fontSize: '0.6rem', fontWeight: 700, bgcolor: '#f5f7fa', color: '#606770', height: 18 }} />
                        </Box>
                        {/* Attendance progress bar */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress variant="determinate" value={pct}
                                sx={{
                                    flex: 1, height: 5, borderRadius: 3, bgcolor: '#f0f0f0',
                                    '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 3 },
                                }} />
                            <Typography variant="caption" fontWeight={700} sx={{ color: barColor, minWidth: 36 }}>
                                {session.presentCount}/{session.totalCount}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }} sx={{ color: '#606770' }}>
                        {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </IconButton>
                </Box>

                {/* Expanded: per-student chips with overall attendance % */}
                <Collapse in={expanded}>
                    <Divider />
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            STUDENTS — chip colour = this session · % = overall attendance
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                            {(session.records || []).map(r => {
                                const sid = typeof r.studentId === 'object' ? r.studentId?.toString() : r.studentId;
                                const overallPct = summaryMap[sid]?.attendancePct ?? null;
                                return (
                                    <Box key={sid} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                                        <Chip size="small"
                                            icon={r.status === 'Present'
                                                ? <CheckCircleIcon style={{ fontSize: 12, color: 'rgb(0,140,89)' }} />
                                                : <CancelIcon style={{ fontSize: 12, color: '#ff4444' }} />}
                                            label={r.rollNumber ? `${r.studentName} (${r.rollNumber})` : r.studentName}
                                            sx={{
                                                fontWeight: 600, fontSize: '0.65rem',
                                                bgcolor: r.status === 'Present' ? '#f0faf5' : '#fff0f0',
                                                color: r.status === 'Present' ? 'rgb(0,140,89)' : '#ff4444',
                                                border: `1px solid ${r.status === 'Present' ? '#c3f0de' : '#ffd6d6'}`,
                                            }}
                                        />
                                        <AttPctChip pct={overallPct} />
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                </Collapse>
            </Paper>
        </Box>
    );
};

// ─── Main History Component ───────────────────────────────────────────────────
const AttendanceHistory = ({ onBack }) => {
    const [sessions, setSessions] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [summaryMap, setSummaryMap] = useState({}); // { studentId: { attendancePct, ... } }
    const [showFilters, setShowFilters] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [appliedStart, setAppliedStart] = useState('');
    const [appliedEnd, setAppliedEnd] = useState('');
    const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });
    const LIMIT = 15;

    const showToast = (msg, severity = 'success') => setToast({ open: true, msg, severity });

    const fetchSessions = useCallback(async (pageNum = 0, append = false, start = appliedStart, end = appliedEnd) => {
        pageNum === 0 ? setLoading(true) : setLoadingMore(true);
        try {
            const params = { page: pageNum, limit: LIMIT };
            if (start) params.startDate = start;
            if (end) params.endDate = end;
            const data = await studentService.getAttendance(params);
            setSessions(prev => append ? [...prev, ...(data.sessions || [])] : (data.sessions || []));
            setTotal(data.total || 0);
        } catch (err) {
            showToast('Failed to load history: ' + err.message, 'error');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [appliedStart, appliedEnd]);

    // Fetch student summary (for overall attendance %)
    const fetchSummary = useCallback(async (start = '', end = '') => {
        try {
            const params = {};
            if (start) params.startDate = start;
            if (end) params.endDate = end;
            const data = await studentService.getStudentSummary(params);
            const map = {};
            (data || []).forEach(s => { map[s.studentId] = s; });
            setSummaryMap(map);
        } catch (err) {
            console.error('Failed to load summary:', err);
        }
    }, []);

    useEffect(() => {
        fetchSessions(0, false, '', '');
        fetchSummary('', '');
    }, []);

    const applyFilters = () => {
        setAppliedStart(startDate);
        setAppliedEnd(endDate);
        setPage(0);
        fetchSessions(0, false, startDate, endDate);
        fetchSummary(startDate, endDate);
        setShowFilters(false);
    };

    const clearFilters = () => {
        setStartDate(''); setEndDate('');
        setAppliedStart(''); setAppliedEnd('');
        setPage(0);
        fetchSessions(0, false, '', '');
        fetchSummary('', '');
    };

    const handleDelete = async (id) => {
        try {
            await studentService.deleteAttendance(id);
            showToast('Session deleted.');
            window.dispatchEvent(new Event('studentDataChanged'));
            setSessions(prev => prev.filter(s => s._id !== id));
            setTotal(t => t - 1);
        } catch (err) {
            showToast(err.response?.data?.error || err.message, 'error');
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchSessions(nextPage, true, appliedStart, appliedEnd);
    };

    const hasFilters = !!(appliedStart || appliedEnd);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{
                position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white',
                borderBottom: '1px solid rgba(25,118,210,0.1)',
                px: 2.5, py: 1.75, boxShadow: '0 2px 8px rgba(25,118,210,0.07)',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button startIcon={<ArrowBackIcon />} onClick={onBack}
                        sx={{ minWidth: 0, p: 0.5, color: 'text.secondary' }} />
                    <Typography variant="subtitle1" fontWeight={800}>Attendance History</Typography>
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
                        {hasFilters && (
                            <Chip label="Filtered" size="small" onDelete={clearFilters}
                                sx={{ fontWeight: 700, bgcolor: 'rgba(25,118,210,0.08)', color: '#1976d2', border: '1px solid rgba(25,118,210,0.2)', fontSize: '0.65rem' }} />
                        )}
                        <Chip label={`${total} sessions`} size="small"
                            sx={{ fontWeight: 600, bgcolor: '#f5f7fa', color: '#606770' }} />
                        <IconButton size="small" onClick={() => setShowFilters(v => !v)}
                            sx={{ color: hasFilters ? '#1976d2' : '#606770' }}>
                            <FilterListIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                {/* Date Range Filter Panel */}
                <Collapse in={showFilters}>
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(25,118,210,0.08)' }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary"
                            sx={{ display: 'block', mb: 1 }}>FILTER BY DATE RANGE</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <TextField size="small" type="date" label="From" value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.8rem' } }} />
                            <TextField size="small" type="date" label="To" value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.8rem' } }} />
                        </Box>
                        {/* Quick presets */}
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
                            {[
                                { label: 'This Week', days: 7 },
                                { label: 'This Month', days: 30 },
                                { label: 'Last 3 Months', days: 90 },
                            ].map(preset => {
                                const end = new Date();
                                const start = new Date();
                                start.setDate(start.getDate() - preset.days);
                                return (
                                    <Chip key={preset.label} label={preset.label} size="small" clickable
                                        onClick={() => {
                                            setStartDate(start.toISOString().split('T')[0]);
                                            setEndDate(end.toISOString().split('T')[0]);
                                        }}
                                        sx={{ fontWeight: 600, fontSize: '0.68rem', bgcolor: '#f5f7fa', color: '#606770' }} />
                                );
                            })}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button size="small" variant="outlined" fullWidth onClick={clearFilters}
                                sx={{ borderRadius: 2, fontSize: '0.78rem' }}>Clear</Button>
                            <Button size="small" variant="contained" fullWidth onClick={applyFilters}
                                sx={{ borderRadius: 2, fontSize: '0.78rem' }}>Apply</Button>
                        </Box>
                    </Box>
                </Collapse>
            </Box>

            {/* Swipe hint */}
            <Box sx={{ bgcolor: '#f5f7fa', px: 2.5, py: 0.75 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    💡 Swipe left to delete · Tap ▾ to expand · % = overall attendance
                </Typography>
            </Box>

            {/* List */}
            <Box sx={{ flex: 1, px: 2.5, pt: 2, pb: 4 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
                ) : sessions.length === 0 ? (
                    <Typography color="text.secondary" textAlign="center" sx={{ mt: 8 }}>
                        {hasFilters ? 'No sessions found for the selected date range.' : 'No attendance sessions recorded yet.'}
                    </Typography>
                ) : (
                    <>
                        {sessions.map(session => (
                            <HistoryRow key={session._id} session={session}
                                onDelete={handleDelete} summaryMap={summaryMap} />
                        ))}
                        {sessions.length < total && (
                            <Button fullWidth variant="outlined" disabled={loadingMore} onClick={handleLoadMore}
                                sx={{ mt: 1, borderRadius: 2 }}>
                                {loadingMore ? <CircularProgress size={18} /> : 'Load More'}
                            </Button>
                        )}
                    </>
                )}
            </Box>

            <Snackbar open={toast.open} autoHideDuration={3000}
                onClose={() => setToast(t => ({ ...t, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: 2 }}>{toast.msg}</Alert>
            </Snackbar>
        </Box>
    );
};

export default AttendanceHistory;
