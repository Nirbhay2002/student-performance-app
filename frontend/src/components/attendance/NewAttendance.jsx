import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { studentService } from '../../services/studentService';
import useStudentStore from '../../store/useStudentStore';
import useNotificationStore from '../../store/useNotificationStore';
import AttendanceConfigScreen from './components/AttendanceConfigScreen';
import AttendanceRosterScreen from './components/AttendanceRosterScreen';

const NewAttendance = ({ onBack }) => {
    const [step, setStep] = useState('config');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSubBatch, setSelectedSubBatch] = useState(null);
    const [stream, setStream] = useState('Non-Medical');
    const [students, setStudents] = useState([]);
    const [statusMap, setStatusMap] = useState({});
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const showNotification = useNotificationStore((state) => state.showNotification);

    const loadStudents = async () => {
        if (!selectedSubBatch || !stream) return;
        setLoadingStudents(true);
        try {
            const { batch, subBatch } = selectedSubBatch;
            const data = await useStudentStore.getState().fetchStudents({ batch, subBatch, stream, limit: 500 });
            setStudents(data.students || []);
            const initial = {};
            (data.students || []).forEach(s => { initial[s._id] = 'Present'; });
            setStatusMap(initial);
            setStep('roster');
        } catch (err) {
            showNotification('Failed to load students: ' + err.message, 'error');
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
            const { batch, subBatch } = selectedSubBatch;
            const records = students.map(s => ({ studentId: s._id, status: statusMap[s._id] || 'Present' }));
            await studentService.saveAttendance({ date, batch, subBatch, stream, records });
            window.dispatchEvent(new Event('studentDataChanged'));
            showNotification('Attendance saved successfully!', 'success');
            setTimeout(() => onBack(), 1400);
        } catch (err) {
            showNotification(err.response?.data?.error || err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (step === 'config') {
        return (
            <AttendanceConfigScreen
                date={date} setDate={setDate}
                selectedSubBatch={selectedSubBatch} setSelectedSubBatch={setSelectedSubBatch}
                stream={stream} setStream={setStream}
                loadingStudents={loadingStudents}
                onBack={onBack}
                onLoad={loadStudents}
            />
        );
    }

    return (
        <AttendanceRosterScreen
            batch={selectedSubBatch?.batch}
            subBatch={selectedSubBatch?.subBatch}
            stream={stream}
            date={date}
            students={students} statusMap={statusMap}
            submitting={submitting}
            onBack={() => setStep('config')}
            markAll={markAll}
            onStatusChange={handleStatusChange}
            onSubmit={handleSubmit}
        />
    );
};

export default NewAttendance;
