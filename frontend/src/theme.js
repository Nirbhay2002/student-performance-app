import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a237e', // Deep Indigo
      light: '#534bae',
      dark: '#000051',
    },
    secondary: {
      main: '#c5a059', // Premium Gold
      light: '#f9d189',
      dark: '#93722c',
    },
    success: {
      main: '#2e7d32', // Emerald Green
    },
    background: {
      default: '#f0f2f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#1c1e21',
      secondary: '#606770',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "system-ui", sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 28px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(26, 35, 126, 0.2)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default theme;
