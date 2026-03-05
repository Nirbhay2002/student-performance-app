import React, { useState } from 'react';
import {
    Box, Typography, AppBar, Toolbar, Button, IconButton
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttendanceLanding from './AttendanceLanding';
import NewAttendance from './NewAttendance';
import AttendanceHistory from './AttendanceHistory';

const AttendanceApp = ({ onLogout }) => {
    const [screen, setScreen] = useState('landing'); // 'landing' | 'new' | 'history'

    const handleNavigate = (dest) => setScreen(dest);
    const handleBack = () => setScreen('landing');

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fb', maxWidth: 480, mx: 'auto', position: 'relative' }}>
            {/* Mobile App Bar */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: 'white',
                    borderBottom: '1px solid rgba(25,118,210,0.10)',
                    boxShadow: '0 1px 8px rgba(25,118,210,0.08)',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', minHeight: 56 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <img
                            src="/assets/img/logo.png"
                            alt="Logo"
                            style={{ height: 30, width: 'auto', objectFit: 'contain' }}
                        />
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1976d2' }}>
                            Attendance
                        </Typography>
                    </Box>
                    <Button
                        onClick={onLogout}
                        size="small"
                        startIcon={<LogoutIcon fontSize="small" />}
                        sx={{ color: '#606770', fontSize: '0.75rem' }}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Screen Router */}
            {screen === 'landing' && <AttendanceLanding onNavigate={handleNavigate} />}
            {screen === 'new' && <NewAttendance onBack={handleBack} />}
            {screen === 'history' && <AttendanceHistory onBack={handleBack} />}
        </Box>
    );
};

export default AttendanceApp;
