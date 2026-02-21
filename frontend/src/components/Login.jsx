import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, CircularProgress, Alert } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
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
            <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', borderRadius: 3 }}>
                <Box sx={{ m: 1, bgcolor: 'primary.main', p: 2, borderRadius: '50%', display: 'flex' }}>
                    <LockOutlinedIcon sx={{ color: 'white', fontSize: 32 }} />
                </Box>
                <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Admin Login
                </Typography>

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
                        sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;
