import React, { useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { studentService } from '../../services/studentService';
import useStudentStore from '../../store/useStudentStore';
import AttendanceConfigScreen from './components/AttendanceConfigScreen';
import AttendanceRosterScreen from './components/AttendanceRosterScreen';

const NewAttendance = ({ onBack }) => {
    const [step, setStep] = useState('config');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [batch, setBatch] = useState('');
    const [stream, setStream] = useState('Non-Medical');
    const [students, setStudents] = useState([]);
    const [statusMap, setStatusMap] = useState({});
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });

    const showToast = (msg, severity = 'success') => setToast({ open: true, msg, severity });

    const loadStudents = async () => {
        if (!batch || !stream) return;
        setLoadingStudents(true);
        try {
            const data = await useStudentStore.getState().fetchStudents({ batch, stream, limit: 500 });
            setStudents(data.students || []);
            const initial = {};
            (data.students || []).forEach(s => { initial[s._id] = 'Present'; });
            setStatusMap(initial);
            setStep('roster');
        } catch (err) {
            showToast('Failed to load students: ' + err.message, 'error');
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleStatusChange = (studentId, newStatus) =>
        setStatusMap(prev => ({ ...prev, [studentId]: newStatus }));

    const markAll = (status) => {
        const updated = {};
        students.forEach(s => { updated[s._id] = status; });
        setStatusMap(updated);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const records = students.map(s => ({ studentId: s._id, status: statusMap[s._id] || 'Present' }));
            await studentService.saveAttendance({ date, batch, stream, records });
            window.dispatchEvent(new Event('studentDataChanged'));
            showToast('Attendance saved successfully!');
            setTimeout(() => onBack(), 1400);
        } catch (err) {
            showToast(err.response?.data?.error || err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (step === 'config') {
        return (
            <AttendanceConfigScreen
                date={date} setDate={setDate}
                batch={batch} setBatch={setBatch}
                stream={stream} setStream={setStream}
                loadingStudents={loadingStudents}
                onBack={onBack}
                onLoad={loadStudents}
            />
        );
    }

    return (
        <AttendanceRosterScreen
            batch={batch} stream={stream} date={date}
            students={students} statusMap={statusMap}
            submitting={submitting}
            toast={toast} setToast={setToast}
            onBack={() => setStep('config')}
            markAll={markAll}
            onStatusChange={handleStatusChange}
            onSubmit={handleSubmit}
        />
    );
};

export default NewAttendance;
