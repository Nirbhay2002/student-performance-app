import React from 'react';
import {
    Box, Typography, Button, CircularProgress,
    Chip, Snackbar, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SwipeableRow from './SwipeableRow';

const AttendanceRosterScreen = ({
    batch, subBatch, stream, date,
    students, statusMap,
    submitting,
    onBack, markAll, onStatusChange, onSubmit,
}) => {
    const presentCount = Object.values(statusMap).filter(s => s === 'Present').length;
    const absentCount = Object.values(statusMap).filter(s => s === 'Absent').length;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Sticky Header */}
            <Box sx={{
                position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white',
                borderBottom: '1px solid rgba(25,118,210,0.1)',
                px: 2.5, py: 1.5, boxShadow: '0 2px 8px rgba(25,118,210,0.07)',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button startIcon={<ArrowBackIcon />} onClick={onBack}
                            sx={{ minWidth: 0, p: 0.5, color: 'text.secondary' }} />
                        <Typography variant="subtitle1" fontWeight={800}>
                            {subBatch || batch} · {stream === 'Non-Medical' ? 'JEE' : 'NEET'}
                        </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Typography>
                </Box>

                {/* Bulk action pills */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip label="✓ All Present" clickable size="small" onClick={() => markAll('Present')}
                        sx={{ fontWeight: 700, bgcolor: '#f0faf5', color: 'rgb(0,140,89)', border: '1px solid #c3f0de' }} />
                    <Chip label="✗ All Absent" clickable size="small" onClick={() => markAll('Absent')}
                        sx={{ fontWeight: 700, bgcolor: '#fff0f0', color: '#ff4444', border: '1px solid #ffd6d6' }} />
                    <Chip label={`${students.length} students`} size="small"
                        sx={{ fontWeight: 600, ml: 'auto', bgcolor: '#f5f7fa', color: '#606770' }} />
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
                        <SwipeableRow key={student._id} student={student}
                            status={statusMap[student._id] || 'Present'}
                            onChange={onStatusChange} />
                    ))
                )}
            </Box>

            {/* Submit Bar */}
            <Box sx={{
                bgcolor: 'white', borderTop: '1px solid rgba(25,118,210,0.1)',
                px: 2.5, py: 2, boxShadow: '0 -4px 16px rgba(25,118,210,0.08)',
                position: 'sticky', bottom: 0, zIndex: 5,
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Chip label={`${presentCount} Present`} size="small"
                        sx={{ bgcolor: '#f0faf5', color: 'rgb(0,140,89)', fontWeight: 700, border: '1px solid #c3f0de' }} />
                    <Chip label={`${absentCount} Absent`} size="small"
                        sx={{ bgcolor: absentCount > 0 ? '#fff0f0' : '#f5f7fa', color: absentCount > 0 ? '#ff4444' : '#aaa', fontWeight: 700, border: `1px solid ${absentCount > 0 ? '#ffd6d6' : '#e0e0e0'}` }} />
                </Box>
                <Button variant="contained" fullWidth disabled={submitting || students.length === 0}
                    onClick={onSubmit}
                    sx={{
                        py: 1.75, fontSize: '1rem', fontWeight: 800, borderRadius: 2.5,
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    }}>
                    {submitting ? <CircularProgress size={22} color="inherit" /> : 'Submit Attendance'}
                </Button>
            </Box>
        </Box>
    );
};

export default AttendanceRosterScreen;
