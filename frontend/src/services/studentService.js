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
    }
};
