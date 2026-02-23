import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, CircularProgress, Alert, Divider } from '@mui/material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Note: Deliberately using standard cross-origin axios for login since we don't have a token to send
            const response = await axios.post(`${API_URL}/auth/login`, { username, password });

            const { token } = response.data;
            if (token) {
                localStorage.setItem('token', token);
                onLogin(token);
            } else {
                setError('Invalid response from server.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    borderRadius: 3,
                    border: '1px solid rgba(25, 118, 210, 0.12)',
                    boxShadow: '0 4px 32px rgba(25, 118, 210, 0.08)',
                }}
            >
                {/* Logo */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <img src="/assets/img/logo.png" alt="Unacademy Logo" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
                    <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: 0.5 }}>
                        <span style={{ color: '#1976d2' }}>Unacademy</span>
                    </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Sign in to the Admin Portal
                </Typography>

                <Divider sx={{ width: '100%', mb: 3, borderColor: 'rgba(25, 118, 210, 0.1)' }} />

                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
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
                        sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;
