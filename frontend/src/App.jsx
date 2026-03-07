import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, AppBar, Toolbar, Typography, Tab, Tabs, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import theme from './theme';
import { routes } from './routes';
import Login from './components/Login';
import AttendanceApp from './components/attendance/AttendanceApp';
import GlobalNotification from './components/GlobalNotification';
import './App.css';

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePortal, setActivePortal] = useState('main'); // 'main' | 'attendance'

  useEffect(() => {
    const token = localStorage.getItem('token');
    const portal = localStorage.getItem('activePortal') || 'main';
    if (token) {
      setIsLoggedIn(true);
      setActivePortal(portal);
    }

    // --- EARLY WAKE UP ---
    // Ping the backend as soon as the app loads to wake it up from Render sleep
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${API_BASE_URL}/health`).catch(() => { });
  }, []);

  const handleLogin = (token, portal = 'main') => {
    localStorage.setItem('activePortal', portal);
    setActivePortal(portal);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activePortal');
    setIsLoggedIn(false);
    setActivePortal('main');
  };

  // Find the active component from routes
  const ActiveComponent = routes.find(r => r.id === tabValue)?.component || (() => null);

  // Navigation Parameters State
  const [navParams, setNavParams] = useState({});

  const handleNavigate = (tabId, params = {}) => {
    setNavParams(params);
    setTabValue(tabId);
  };

  const onTabClick = (event, newValue) => {
    setTabValue(newValue);
    setNavParams({});
  };

  if (!isLoggedIn) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalNotification />
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  // ── Attendance Portal Shell ──────────────────────────────────────────────
  if (activePortal === 'attendance') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalNotification />
        <AttendanceApp onLogout={handleLogout} />
      </ThemeProvider>
    );
  }

  // ── Main Admin Dashboard Shell ───────────────────────────────────────────
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalNotification />
      <AppBar position="sticky" elevation={0} sx={{ color: 'text.primary' }}>
        <Toolbar sx={{ maxWidth: 1440, width: '100%', mx: 'auto' }}>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <img src="/assets/img/logo.png" alt="Unacademy Logo" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 0.5, color: '#1976d2' }}>
              Unacademy
            </Typography>
          </Box>
          <Tabs
            value={tabValue}
            onChange={onTabClick}
            className="nav-tabs"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            {routes.map((route) => (
              <Tab
                key={route.id}
                className="nav-tab"
                icon={<route.icon />}
                iconPosition="start"
                label={route.label}
                value={route.id}
              />
            ))}
          </Tabs>
          <Button color="inherit" onClick={handleLogout} sx={{ display: { xs: 'none', sm: 'flex' }, ml: 2 }}>
            <LogoutIcon sx={{ mr: 1 }} /> Logout
          </Button>
        </Toolbar>
        <Tabs
          value={tabValue}
          onChange={onTabClick}
          variant="fullWidth"
          className="nav-tabs"
          sx={{ display: { xs: 'block', sm: 'none' } }}
        >
          {routes.map((route) => (
            <Tab
              key={route.id}
              icon={<route.icon />}
              value={route.id}
            />
          ))}
        </Tabs>
        <Button color="inherit" fullWidth onClick={handleLogout} sx={{ display: { xs: 'flex', sm: 'none' }, py: 1.5, justifyContent: 'center' }}>
          <LogoutIcon sx={{ mr: 1 }} /> Logout
        </Button>
      </AppBar>

      <div className="app-container">
        <Box className="fade-in">
          <ActiveComponent navigate={handleNavigate} navParams={navParams} />
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default App;
