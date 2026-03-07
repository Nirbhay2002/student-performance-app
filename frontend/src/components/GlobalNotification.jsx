import React from 'react';
import { Snackbar, Alert, Box } from '@mui/material';
import useNotificationStore from '../store/useNotificationStore';

const GlobalNotification = () => {
    const { open, message, severity, autoHideDuration, hideNotification } = useNotificationStore();

    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={hideNotification}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            sx={{ bottom: { xs: 80, sm: 24 } }} // Adjust for mobile bottom tabs
        >
            <Alert
                onClose={hideNotification}
                severity={severity}
                variant="filled"
                sx={{
                    width: '100%',
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    fontWeight: 600,
                    px: 3,
                    '& .MuiAlert-icon': {
                        fontSize: '1.5rem'
                    }
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export default GlobalNotification;
