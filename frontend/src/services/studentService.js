import api from './api';

export const studentService = {
    getAllStudents: async (params = {}) => {
        const res = await api.get('/students', { params });
        return res.data;
    },

    getStudentPerformance: async (studentId) => {
        const res = await api.get(`/students/${studentId}/performance`);
        return res.data;
    },

    registerStudent: async (studentData) => {
        const res = await api.post('/students', studentData);
        return res.data;
    },

    saveMarks: async (marksData) => {
        const res = await api.post('/marks', marksData);
        return res.data;
    },

    bulkUploadMarks: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/marks/bulk', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },

    // Attendance Portal
    saveAttendance: async (payload) => {
        const res = await api.post('/attendance', payload);
        return res.data;
    },

    getAttendance: async (params = {}) => {
        const res = await api.get('/attendance', { params });
        return res.data;
    },

    getStudentAttendance: async (studentId) => {
        const res = await api.get(`/attendance/student/${studentId}`);
        return res.data;
    },

    deleteAttendance: async (id) => {
        const res = await api.delete(`/attendance/${id}`);
        return res.data;
    },
};
