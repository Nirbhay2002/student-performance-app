import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, CircularProgress,
    Chip, Snackbar, Alert, TextField, MenuItem, Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { studentService } from '../../services/studentService';

const BATCHES = ['Growth', 'Excel', 'Conquer'];
const STREAMS = [
    { value: 'Non-Medical', label: 'JEE (Non-Medical)' },
    { value: 'Medical', label: 'NEET (Medical)' },
];

// ─── Swipeable Student Row ──────────────────────────────────────────────────
const SwipeableRow = ({ student, status, onChange }) => {
    const [startX, setStartX] = useState(null);
    const [deltaX, setDeltaX] = useState(0);
    const [swiping, setSwiping] = useState(false);
    const isAbsent = status === 'Absent';
    const THRESHOLD = 72; // px to trigger a flip

    const onPointerDown = (e) => {
        setStartX(e.clientX);
        setSwiping(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
        if (!swiping || startX === null) return;
        setDeltaX(e.clientX - startX);
    };

    const onPointerUp = () => {
        if (Math.abs(deltaX) > THRESHOLD) {
            onChange(student._id, isAbsent ? 'Present' : 'Absent');
        }
        setDeltaX(0);
        setSwiping(false);
        setStartX(null);
    };

    const clampedDelta = Math.max(-90, Math.min(90, deltaX));
    const absentColor = '#ff4444';
    const presentColor = 'rgb(0,192,122)';

    return (
        <Box
            sx={{
                position: 'relative',
                mb: 1.25,
                borderRadius: 2,
                overflow: 'hidden',
                userSelect: 'none',
            }}
        >
            {/* Background hint layer */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    bgcolor: isAbsent
                        ? (clampedDelta > 0 ? presentColor : absentColor)
                        : (clampedDelta > 0 ? absentColor : presentColor),
                    display: 'flex',
                    alignItems: 'center',
                    px: 2.5,
                    justifyContent: clampedDelta > 0 ? 'flex-start' : 'flex-end',
                }}
            >
                {clampedDelta > 0
                    ? (isAbsent
                        ? <CheckCircleIcon sx={{ color: 'white' }} />
                        : <CancelIcon sx={{ color: 'white' }} />)
                    : (isAbsent
                        ? <CancelIcon sx={{ color: 'white' }} />
                        : <CheckCircleIcon sx={{ color: 'white' }} />)
                }
            </Box>

            {/* Foreground card */}
            <Paper
                elevation={0}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    transform: `translateX(${clampedDelta}px)`,
                    transition: swiping ? 'none' : 'transform 0.25s ease',
                    borderRadius: 2,
                    border: `2px solid ${isAbsent ? absentColor : presentColor}`,
                    bgcolor: 'white',
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'grab',
                    touchAction: 'pan-y', // allow vertical scroll, capture horizontal
                    WebkitUserSelect: 'none',
                }}
            >
                <Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1c1e21' }}>
                        {student.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {student.rollNumber}
                    </Typography>
                </Box>
                <Chip
                    label={isAbsent ? 'Absent' : 'Present'}
                    size="small"
                    icon={isAbsent ? <CancelIcon style={{ fontSize: 14 }} /> : <CheckCircleIcon style={{ fontSize: 14 }} />}
                    sx={{
                        bgcolor: isAbsent ? '#fff0f0' : '#f0faf5',
                        color: isAbsent ? absentColor : presentColor,
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        border: `1px solid ${isAbsent ? '#ffd6d6' : '#c3f0de'}`,
                        '& .MuiChip-icon': { color: isAbsent ? absentColor : presentColor },
                    }}
                />
            </Paper>
        </Box>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const NewAttendance = ({ onBack }) => {
    const [step, setStep] = useState('config'); // 'config' | 'roster'
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [batch, setBatch] = useState('');
    const [stream, setStream] = useState('Non-Medical');
    const [students, setStudents] = useState([]);
    const [statusMap, setStatusMap] = useState({}); // { studentId: 'Present' | 'Absent' }
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });

    const showToast = (msg, severity = 'success') => setToast({ open: true, msg, severity });

    const loadStudents = async () => {
        if (!batch || !stream) return;
        setLoadingStudents(true);
        try {
            const data = await studentService.getAllStudents({ batch, stream, limit: 500 });
            setStudents(data.students || []);
            // Default everyone to Present
            const initial = {};
            (data.students || []).forEach(s => { initial[s._id] = 'Present'; });
            setStatusMap(initial);
            setStep('roster');
        } catch (err) {
            showToast('Failed to load students: ' + err.message, 'error');
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleStatusChange = (studentId, newStatus) => {
        setStatusMap(prev => ({ ...prev, [studentId]: newStatus }));
    };

    const markAll = (status) => {
        const updated = {};
        students.forEach(s => { updated[s._id] = status; });
        setStatusMap(updated);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const records = students.map(s => ({ studentId: s._id, status: statusMap[s._id] || 'Present' }));
            await studentService.saveAttendance({ date, batch, stream, records });
            window.dispatchEvent(new Event('studentDataChanged'));
            showToast('Attendance saved successfully!');
            setTimeout(() => onBack(), 1400);
        } catch (err) {
            showToast(err.response?.data?.error || err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const presentCount = Object.values(statusMap).filter(s => s === 'Present').length;
    const absentCount = Object.values(statusMap).filter(s => s === 'Absent').length;

    // ── Config Screen ──
    if (step === 'config') {
        return (
            <Box sx={{ px: 2.5, py: 3, maxWidth: 480, mx: 'auto' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={onBack}
                        sx={{ minWidth: 0, p: 0.5, color: 'text.secondary' }}
                    />
                    <Typography variant="h6" fontWeight={800}>New Attendance</Typography>
                </Box>

                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid rgba(25,118,210,0.1)', mb: 2.5 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#606770' }}>SELECT CLASS</Typography>

                    <TextField
                        fullWidth
                        type="date"
                        label="Date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        select
                        label="Batch"
                        value={batch}
                        onChange={e => setBatch(e.target.value)}
                        sx={{ mb: 2 }}
                    >
                        {BATCHES.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                    </TextField>

                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        STREAM
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        {STREAMS.map(s => (
                            <Chip
                                key={s.value}
                                label={s.label}
                                clickable
                                onClick={() => setStream(s.value)}
                                sx={{
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    px: 0.5,
                                    bgcolor: stream === s.value ? '#1976d2' : '#f5f7fa',
                                    color: stream === s.value ? 'white' : '#606770',
                                    border: stream === s.value ? '1.5px solid #1976d2' : '1.5px solid #e0e0e0',
                                    '&:hover': { bgcolor: stream === s.value ? '#1565c0' : '#eff0f2' },
                                }}
                            />
                        ))}
                    </Box>
                </Paper>

                <Button
                    variant="contained"
                    fullWidth
                    disabled={!batch || !stream || loadingStudents}
                    onClick={loadStudents}
                    sx={{ py: 1.75, fontSize: '1rem', fontWeight: 800, borderRadius: 2.5 }}
                >
                    {loadingStudents ? <CircularProgress size={22} color="inherit" /> : 'Load Students'}
                </Button>
            </Box>
        );
    }

    // ── Roster Screen ──
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Fixed Header */}
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    bgcolor: 'white',
                    borderBottom: '1px solid rgba(25,118,210,0.1)',
                    px: 2.5,
                    py: 1.5,
                    boxShadow: '0 2px 8px rgba(25,118,210,0.07)',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => setStep('config')}
                            sx={{ minWidth: 0, p: 0.5, color: 'text.secondary' }}
                        />
                        <Typography variant="subtitle1" fontWeight={800}>
                            {batch} · {stream === 'Non-Medical' ? 'JEE' : 'NEET'}
                        </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Typography>
                </Box>

                {/* Bulk action pills */}
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip
                        label="✓ All Present"
                        clickable
                        size="small"
                        onClick={() => markAll('Present')}
                        sx={{ fontWeight: 700, bgcolor: '#f0faf5', color: 'rgb(0,140,89)', border: '1px solid #c3f0de' }}
                    />
                    <Chip
                        label="✗ All Absent"
                        clickable
                        size="small"
                        onClick={() => markAll('Absent')}
                        sx={{ fontWeight: 700, bgcolor: '#fff0f0', color: '#ff4444', border: '1px solid #ffd6d6' }}
                    />
                    <Chip
                        label={`${students.length} students`}
                        size="small"
                        sx={{ fontWeight: 600, ml: 'auto', bgcolor: '#f5f7fa', color: '#606770' }}
                    />
                </Box>
            </Box>

            {/* Swipe hint */}
            <Box sx={{ bgcolor: '#f5f7fa', px: 2.5, py: 0.75 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    💡 Swipe right to mark Absent · Swipe again to revert
                </Typography>
            </Box>

            {/* Student List */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, pt: 2, pb: 2 }}>
                {students.length === 0 ? (
                    <Typography color="text.secondary" textAlign="center" sx={{ mt: 8 }}>
                        No students found for this batch/stream.
                    </Typography>
                ) : (
                    students.map(student => (
                        <SwipeableRow
                            key={student._id}
                            student={student}
                            status={statusMap[student._id] || 'Present'}
                            onChange={handleStatusChange}
                        />
                    ))
                )}
            </Box>

            {/* Submit Bar — sits naturally at bottom of flex column */}
            <Box
                sx={{
                    bgcolor: 'white',
                    borderTop: '1px solid rgba(25,118,210,0.1)',
                    px: 2.5,
                    py: 2,
                    boxShadow: '0 -4px 16px rgba(25,118,210,0.08)',
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 5,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Chip label={`${presentCount} Present`} size="small" sx={{ bgcolor: '#f0faf5', color: 'rgb(0,140,89)', fontWeight: 700, border: '1px solid #c3f0de' }} />
                    <Chip label={`${absentCount} Absent`} size="small" sx={{ bgcolor: absentCount > 0 ? '#fff0f0' : '#f5f7fa', color: absentCount > 0 ? '#ff4444' : '#aaa', fontWeight: 700, border: `1px solid ${absentCount > 0 ? '#ffd6d6' : '#e0e0e0'}` }} />
                </Box>
                <Button
                    variant="contained"
                    fullWidth
                    disabled={submitting || students.length === 0}
                    onClick={handleSubmit}
                    sx={{
                        py: 1.75,
                        fontSize: '1rem',
                        fontWeight: 800,
                        borderRadius: 2.5,
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    }}
                >
                    {submitting ? <CircularProgress size={22} color="inherit" /> : `Submit Attendance`}
                </Button>
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

export default NewAttendance;
