import AssessmentIcon from '@mui/icons-material/Assessment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

export const routes = [
    {
        path: '/',
        label: 'Dashboard',
        icon: AssessmentIcon,
        component: Dashboard,
        id: 0
    },
    {
        path: '/admin',
        label: 'Administration',
        icon: AdminPanelSettingsIcon,
        component: AdminPanel,
        id: 1
    }
];
