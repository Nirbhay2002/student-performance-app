import React from 'react';
import { Box, Typography, Card, CardActionArea } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import HistoryIcon from '@mui/icons-material/History';

// Color palette matching the existing app theme
const COLORS = {
    primary: '#1976d2',
    primaryDark: '#1565c0',
    secondary: 'rgb(0, 192, 122)',
    secondaryDark: 'rgb(0, 140, 89)',
};

const AttendanceLanding = ({ onNavigate }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(100vh - 72px)',
                px: 2.5,
                py: 4,
                gap: 3,
            }}
        >
            {/* Greeting */}
            <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1c1e21', letterSpacing: '-0.01em' }}>
                    Attendance Portal
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </Typography>
            </Box>

            {/* Take New Attendance Card */}
            <Card
                sx={{
                    width: '100%',
                    maxWidth: 420,
                    borderRadius: 3,
                    border: 'none',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(25, 118, 210, 0.18)',
                }}
            >
                <CardActionArea
                    onClick={() => onNavigate('new')}
                    sx={{
                        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
                        p: 3.5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        '&:hover': { opacity: 0.93 },
                    }}
                >
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <EventNoteIcon sx={{ fontSize: 30, color: 'white' }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 800 }}>
                            Take New Attendance
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.25 }}>
                            Record today's class attendance with swipe gestures
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            alignSelf: 'flex-end',
                            bgcolor: 'rgba(255,255,255,0.15)',
                            borderRadius: 2,
                            px: 2,
                            py: 0.75,
                        }}
                    >
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, letterSpacing: 0.5 }}>
                            Start →
                        </Typography>
                    </Box>
                </CardActionArea>
            </Card>

            {/* View History Card */}
            <Card
                sx={{
                    width: '100%',
                    maxWidth: 420,
                    borderRadius: 3,
                    border: 'none',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0, 192, 122, 0.18)',
                }}
            >
                <CardActionArea
                    onClick={() => onNavigate('history')}
                    sx={{
                        background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.secondaryDark} 100%)`,
                        p: 3.5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        '&:hover': { opacity: 0.93 },
                    }}
                >
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <HistoryIcon sx={{ fontSize: 30, color: 'white' }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 800 }}>
                            View History
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.25 }}>
                            Browse & manage past attendance sessions
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            alignSelf: 'flex-end',
                            bgcolor: 'rgba(255,255,255,0.15)',
                            borderRadius: 2,
                            px: 2,
                            py: 0.75,
                        }}
                    >
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, letterSpacing: 0.5 }}>
                            Browse →
                        </Typography>
                    </Box>
                </CardActionArea>
            </Card>
        </Box>
    );
};

export default AttendanceLanding;
