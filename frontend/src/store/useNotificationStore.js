import { create } from 'zustand';

const useNotificationStore = create((set) => ({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'error' | 'info' | 'warning'
    autoHideDuration: 4000,

    showNotification: (message, severity = 'success', autoHideDuration = 4000) => {
        set({
            open: true,
            message,
            severity,
            autoHideDuration,
        });
    },

    hideNotification: (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        set({ open: false });
    },
}));

export default useNotificationStore;
