import React, { useState } from 'react';
import {
    Box, Button, TextField, Typography, Container, Paper,
    CircularProgress, Alert, Tabs, Tab
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EventNoteIcon from '@mui/icons-material/EventNote';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Login = ({ onLogin }) => {
    const [portalTab, setPortalTab] = useState(0); // 0 = Student, 1 = Attendance
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isAttendancePortal = portalTab === 1;

    const handleTabChange = (_, newVal) => {
        setPortalTab(newVal);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await axios.post(`${API_URL}/auth/login`, { username, password });
            const { token } = response.data;
            if (token) {
                localStorage.setItem('token', token);
                onLogin(token, isAttendancePortal ? 'attendance' : 'main');
            } else {
                setError('Invalid response from server.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container
            component="main"
            maxWidth="xs"
            sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    borderRadius: 3,
                    border: '1px solid rgba(25, 118, 210, 0.12)',
                    boxShadow: '0 4px 32px rgba(25, 118, 210, 0.08)',
                    overflow: 'hidden',
                }}
            >
                {/* Logo Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 4, pt: 4, pb: 2 }}>
                    <img src="/assets/img/logo.png" alt="Logo" style={{ height: 38, width: 'auto', objectFit: 'contain' }} />
                    <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: 0.5 }}>
                        <span style={{ color: '#1976d2' }}>Unacademy</span>
                    </Typography>
                </Box>

                {/* Portal Selector Tabs */}
                <Tabs
                    value={portalTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                        borderBottom: '1px solid rgba(25,118,210,0.1)',
                        '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', py: 1.5, fontSize: '0.82rem' },
                        '& .Mui-selected': { color: '#1976d2' },
                        '& .MuiTabs-indicator': { backgroundColor: '#1976d2', height: 3 },
                    }}
                >
                    <Tab
                        icon={<AssessmentIcon fontSize="small" />}
                        iconPosition="start"
                        label="Performance Portal"
                    />
                    <Tab
                        icon={<EventNoteIcon fontSize="small" />}
                        iconPosition="start"
                        label="Attendance Portal"
                    />
                </Tabs>
                {/* Form */}
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ px: 4, pb: 4, pt: 1 }}>
                    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>{error}</Alert>}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 3,
                            mb: 1,
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 800,
                            borderRadius: 2,
                            background: isAttendancePortal
                                ? 'linear-gradient(135deg, rgb(0,192,122) 0%, rgb(0,140,89) 100%)'
                                : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        }}
                        disabled={loading}
                    >
                        {loading
                            ? <CircularProgress size={24} color="inherit" />
                            : 'Sign In'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;
