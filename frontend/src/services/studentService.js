import api from './api';

export const studentService = {
    getAllStudents: async () => {
        const res = await api.get('/students');
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
