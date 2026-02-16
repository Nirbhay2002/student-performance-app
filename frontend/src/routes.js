import AssessmentIcon from '@mui/icons-material/Assessment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import StudentRecords from './components/StudentRecords';

export const routes = [
    {
        path: '/',
        label: 'Dashboard',
        icon: AssessmentIcon,
        component: Dashboard,
        id: 0
    },
    {
        path: '/records',
        label: 'Student Records',
        icon: PeopleIcon,
        component: StudentRecords,
        id: 1
    },
    {
        path: '/admin',
        label: 'Administration',
        icon: AdminPanelSettingsIcon,
        component: AdminPanel,
        id: 2
    }
];
