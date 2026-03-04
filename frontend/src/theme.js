import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // MUI Default Blue
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: 'rgb(0, 192, 122)', // Custom Green
      light: 'rgb(51, 210, 148)',
      dark: 'rgb(0, 140, 89)',
    },
    success: {
      main: 'rgb(0, 192, 122)',
    },
    background: {
      default: '#ffffff',
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
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 28px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, rgb(0, 192, 122) 0%, rgb(0, 140, 89) 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 16px 0 rgba(25, 118, 210, 0.06)',
          border: '1px solid rgba(25, 118, 210, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 1px 8px rgba(25, 118, 210, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

export default theme;
