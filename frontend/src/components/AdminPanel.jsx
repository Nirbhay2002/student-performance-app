import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid, Snackbar, Alert } from '@mui/material';
import { studentService } from '../services/studentService';

// Sub-components
import RegistrationForm from './admin/RegistrationForm';
import PerformanceForm from './admin/PerformanceForm';
import BulkUploadZone from './admin/BulkUploadZone';

const AdminPanel = () => {
  const [students, setStudents] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [batch, setBatch] = useState('A1');
  const [stream, setStream] = useState('Non-Medical');

  const [selectedStudent, setSelectedStudent] = useState('');
  const [marks, setMarks] = useState({
    physics: '',
    maxPhysics: '100',
    chemistry: '',
    maxChemistry: '100',
    maths: '',
    maxMaths: '100',
    botany: '',
    maxBotany: '100',
    zoology: '',
    maxZoology: '100',
    attendance: '',
    date: new Date().toISOString().split('T')[0],
    examName: '',
    testNamePhysics: '',
    testNameChemistry: '',
    testNameMaths: '',
    testNameBotany: '',
    testNameZoology: '',
  });

  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgSeverity, setMsgSeverity] = useState('success');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSavingMarks, setIsSavingMarks] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      setStudents(data.students);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      await studentService.registerStudent({ name: studentName, rollNumber, email, batch, stream });
      setMsg('Student registered successfully!');
      setOpen(true);
      fetchStudents();
      setStudentName('');
      setRollNumber('');
      setEmail('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSaveMarks = async () => {
    setIsSavingMarks(true);
    const parseScore = (v) => (v === '' || v === null || v === undefined) ? null : Number(v);

    // Fix #6: Client-side score > max validation
    const scoreFields = [
      { score: marks.physics, max: marks.maxPhysics, label: 'Physics' },
      { score: marks.chemistry, max: marks.maxChemistry, label: 'Chemistry' },
      { score: marks.maths, max: marks.maxMaths, label: 'Mathematics' },
      { score: marks.botany, max: marks.maxBotany, label: 'Botany' },
      { score: marks.zoology, max: marks.maxZoology, label: 'Zoology' },
    ];
    for (const { score, max, label } of scoreFields) {
      if (score !== '' && max !== '' && Number(score) > Number(max)) {
        alert(`${label} score (${score}) cannot exceed max (${max}).`);
        setIsSavingMarks(false);
        return;
      }
    }

    try {
      await studentService.saveMarks({
        studentId: selectedStudent,
        date: marks.date || new Date().toISOString().split('T')[0],
        examName: marks.examName || 'Monthly Test',
        scores: {
          physics: parseScore(marks.physics),
          chemistry: parseScore(marks.chemistry),
          maths: parseScore(marks.maths),
          botany: parseScore(marks.botany),
          zoology: parseScore(marks.zoology)
        },
        maxScores: {
          physics: Number(marks.maxPhysics || 100),
          chemistry: Number(marks.maxChemistry || 100),
          maths: Number(marks.maxMaths || 100),
          botany: Number(marks.maxBotany || 100),
          zoology: Number(marks.maxZoology || 100)
        },
        attendance: Number(marks.attendance),
        testNames: {
          physics: marks.testNamePhysics || 'Combined test',
          chemistry: marks.testNameChemistry || 'Combined test',
          maths: marks.testNameMaths || 'Combined test',
          botany: marks.testNameBotany || 'Combined test',
          zoology: marks.testNameZoology || 'Combined test',
        }
      });
      setMsg('Marks saved & Rank updated!');
      setOpen(true);
      // Fix #10: Notify StudentRecords (and any other component) that data changed
      window.dispatchEvent(new Event('studentDataChanged'));
      setMarks({
        physics: '', maxPhysics: '100',
        chemistry: '', maxChemistry: '100',
        maths: '', maxMaths: '100',
        botany: '', maxBotany: '100',
        zoology: '', maxZoology: '100',
        attendance: '',
        date: new Date().toISOString().split('T')[0],
        examName: '',
        testNamePhysics: '', testNameChemistry: '',
        testNameMaths: '', testNameBotany: '', testNameZoology: '',
      });
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to save marks';
      setMsg(errMsg);
      setMsgSeverity('error');
      setOpen(true);
    } finally {
      setIsSavingMarks(false);
    }
  };

  return (
    <Box className="fade-in">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary" gutterBottom>Administration Control</Typography>
        <Typography variant="body1" color="textSecondary">Manage student enrollments and academic performance records</Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <RegistrationForm
            studentName={studentName}
            setStudentName={setStudentName}
            rollNumber={rollNumber}
            setRollNumber={setRollNumber}
            email={email}
            setEmail={setEmail}
            batch={batch}
            setBatch={setBatch}
            stream={stream}
            setStream={setStream}
            onRegister={handleRegister}
            isLoading={isRegistering}
          />
        </Grid>

        <Grid item xs={12} md={7}>
          <PerformanceForm
            students={students}
            selectedStudent={selectedStudent}
            setSelectedStudent={setSelectedStudent}
            marks={marks}
            setMarks={setMarks}
            onSave={handleSaveMarks}
            isLoading={isSavingMarks}
          />
        </Grid>
      </Grid>

      <BulkUploadZone onUploadSuccess={fetchStudents} />

      <Snackbar open={open} autoHideDuration={5000} onClose={() => setOpen(false)}>
        <Alert onClose={() => setOpen(false)} severity={msgSeverity} variant="filled" sx={{ width: '100%', borderRadius: 3 }}>
          {msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPanel;
