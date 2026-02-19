import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Box, AppBar, Toolbar, Typography, Tab, Tabs } from '@mui/material';
import theme from './theme';
import { routes } from './routes';
import './App.css';

function App() {
  const [tabValue, setTabValue] = useState(0);



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
    setNavParams({}); // Clear params on manual tab switch
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" elevation={0} sx={{ color: 'text.primary' }}>
        <Toolbar sx={{ maxWidth: 1440, width: '100%', mx: 'auto' }}>
          <Typography variant="h6" color="primary" sx={{ flexGrow: 1, fontWeight: 900, letterSpacing: 1 }}>
            STUDENT<span style={{ color: '#c5a059' }}>PRO</span>
          </Typography>
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
