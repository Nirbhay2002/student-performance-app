import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, CircularProgress, Chip,
    Snackbar, Alert, Paper, Collapse, IconButton, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { studentService } from '../../services/studentService';

// ─── Swipe-to-Delete History Row ────────────────────────────────────────────
const HistoryRow = ({ session, onDelete }) => {
    const [startX, setStartX] = useState(null);
    const [deltaX, setDeltaX] = useState(0);
    const [swiping, setSwiping] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const THRESHOLD = 80;

    const onPointerDown = (e) => {
        setStartX(e.clientX);
        setSwiping(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e) => {
        if (!swiping || startX === null) return;
        const d = e.clientX - startX;
        if (d < 0) setDeltaX(d); // only allow left swipe
    };
    const onPointerUp = () => {
        if (deltaX < -THRESHOLD) onDelete(session._id);
        setDeltaX(0);
        setSwiping(false);
        setStartX(null);
    };

    const clamp = Math.max(-90, deltaX);
    const dateStr = new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <Box sx={{ position: 'relative', mb: 1.5, borderRadius: 2, overflow: 'hidden' }}>
            {/* Delete reveal */}
            <Box
                sx={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: 90,
                    bgcolor: '#ff4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2,
                }}
            >
                <DeleteIcon sx={{ color: 'white' }} />
            </Box>

            {/* Main card */}
            <Paper
                elevation={0}
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    transform: `translateX(${clamp}px)`,
                    transition: swiping ? 'none' : 'transform 0.25s ease',
                    border: '1px solid rgba(25,118,210,0.1)',
                    borderRadius: 2,
                    bgcolor: 'white',
                    userSelect: 'none',
                }}
            >
                <Box
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    sx={{
                        px: 2,
                        py: 1.75,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'grab',
                        touchAction: 'pan-y',
                    }}
                >
                    <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{dateStr}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {session.batch} · {session.stream === 'Non-Medical' ? 'JEE' : 'NEET'}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            label={`${session.presentCount ?? '?'}/${session.totalCount ?? '?'}`}
                            size="small"
                            sx={{ fontWeight: 700, bgcolor: '#f0faf5', color: 'rgb(0,140,89)', border: '1px solid #c3f0de' }}
                        />
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
                            sx={{ color: '#606770' }}
                        >
                            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </IconButton>
                    </Box>
                </Box>

                {/* Expanded student list */}
                <Collapse in={expanded}>
                    <Divider />
                    <Box sx={{ px: 2, py: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {(session.records || []).map(r => (
                            <Chip
                                key={r.studentId}
                                size="small"
                                icon={r.status === 'Present'
                                    ? <CheckCircleIcon style={{ fontSize: 12, color: 'rgb(0,140,89)' }} />
                                    : <CancelIcon style={{ fontSize: 12, color: '#ff4444' }} />}
                                label={r.studentName || r.studentId}
                                sx={{
                                    fontWeight: 600,
                                    fontSize: '0.65rem',
                                    bgcolor: r.status === 'Present' ? '#f0faf5' : '#fff0f0',
                                    color: r.status === 'Present' ? 'rgb(0,140,89)' : '#ff4444',
                                    border: `1px solid ${r.status === 'Present' ? '#c3f0de' : '#ffd6d6'}`,
                                }}
                            />
                        ))}
                    </Box>
                </Collapse>
            </Paper>
        </Box>
    );
};

// ─── Main History Component ──────────────────────────────────────────────────
const AttendanceHistory = ({ onBack }) => {
    const [sessions, setSessions] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });
    const LIMIT = 15;

    const showToast = (msg, severity = 'success') => setToast({ open: true, msg, severity });

    const fetchSessions = useCallback(async (pageNum = 0, append = false) => {
        pageNum === 0 ? setLoading(true) : setLoadingMore(true);
        try {
            const data = await studentService.getAttendance({ page: pageNum, limit: LIMIT });
            setSessions(prev => append ? [...prev, ...(data.sessions || [])] : (data.sessions || []));
            setTotal(data.total || 0);
        } catch (err) {
            showToast('Failed to load history: ' + err.message, 'error');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => { fetchSessions(0); }, [fetchSessions]);

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
        fetchSessions(nextPage, true);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Header */}
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    bgcolor: 'white',
                    borderBottom: '1px solid rgba(25,118,210,0.1)',
                    px: 2.5,
                    py: 1.75,
                    boxShadow: '0 2px 8px rgba(25,118,210,0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                }}
            >
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={onBack}
                    sx={{ minWidth: 0, p: 0.5, color: 'text.secondary' }}
                />
                <Typography variant="subtitle1" fontWeight={800}>Attendance History</Typography>
                <Chip
                    label={`${total} sessions`}
                    size="small"
                    sx={{ ml: 'auto', fontWeight: 600, bgcolor: '#f5f7fa', color: '#606770' }}
                />
            </Box>

            {/* Swipe hint */}
            <Box sx={{ bgcolor: '#f5f7fa', px: 2.5, py: 0.75 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    💡 Swipe left on a session to delete · Tap ▾ to view details
                </Typography>
            </Box>

            {/* List */}
            <Box sx={{ flex: 1, px: 2.5, pt: 2, pb: 4 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : sessions.length === 0 ? (
                    <Typography color="text.secondary" textAlign="center" sx={{ mt: 8 }}>
                        No attendance sessions recorded yet.
                    </Typography>
                ) : (
                    <>
                        {sessions.map(session => (
                            <HistoryRow key={session._id} session={session} onDelete={handleDelete} />
                        ))}
                        {sessions.length < total && (
                            <Button
                                fullWidth
                                variant="outlined"
                                disabled={loadingMore}
                                onClick={handleLoadMore}
                                sx={{ mt: 1, borderRadius: 2 }}
                            >
                                {loadingMore ? <CircularProgress size={18} /> : 'Load More'}
                            </Button>
                        )}
                    </>
                )}
            </Box>

            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={() => setToast(t => ({ ...t, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: 2 }}>
                    {toast.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AttendanceHistory;
