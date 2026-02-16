import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Container, Box, AppBar, Toolbar, Typography, Tab, Tabs } from '@mui/material';
import theme from './theme';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" elevation={0} color="inherit" sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <Typography variant="h6" color="primary" sx={{ flexGrow: 1, fontWeight: 800 }}>
            STUDENT<span style={{ color: '#5f6368' }}>PRO</span>
          </Typography>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Tab icon={<AssessmentIcon />} iconPosition="start" label="Dashboard" />
            <Tab icon={<AdminPanelSettingsIcon />} iconPosition="start" label="Admin Access" />
          </Tabs>
        </Toolbar>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth" 
          sx={{ display: { xs: 'block', sm: 'none' } }}
        >
          <Tab icon={<AssessmentIcon />} />
          <Tab icon={<AdminPanelSettingsIcon />} />
        </Tabs>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {tabValue === 0 ? <Dashboard /> : <AdminPanel />}
      </Container>
    </ThemeProvider>
  );
}

export default App;
