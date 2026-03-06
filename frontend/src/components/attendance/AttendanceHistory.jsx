import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, CircularProgress, Chip,
    Snackbar, Alert, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterListIcon from '@mui/icons-material/FilterList';
import { studentService } from '../../services/studentService';
import HistoryRow from './components/HistoryRow';
import HistoryFilterPanel from './components/HistoryFilterPanel';

const LIMIT = 15;

const AttendanceHistory = ({ onBack }) => {
    const [sessions, setSessions] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [summaryMap, setSummaryMap] = useState({});
    const [showFilters, setShowFilters] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [appliedStart, setAppliedStart] = useState('');
    const [appliedEnd, setAppliedEnd] = useState('');
    const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });

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

                <HistoryFilterPanel
                    open={showFilters}
                    startDate={startDate} endDate={endDate}
                    setStartDate={setStartDate} setEndDate={setEndDate}
                    onApply={applyFilters} onClear={clearFilters}
                />
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
