import React, { useState } from 'react';
import {
    Box, Typography, Chip, Paper, IconButton,
    Collapse, Divider, LinearProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AttPctChip from './AttPctChip';

const THRESHOLD = 80;

const HistoryRow = ({ session, onDelete, summaryMap }) => {
    const [startX, setStartX] = useState(null);
    const [deltaX, setDeltaX] = useState(0);
    const [swiping, setSwiping] = useState(false);
    const [expanded, setExpanded] = useState(false);

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

export default HistoryRow;
