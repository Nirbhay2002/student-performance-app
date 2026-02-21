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
    testNamePhysics: '',
    testNameChemistry: '',
    testNameMaths: '',
    testNameBotany: '',
    testNameZoology: '',
  });

  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
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
    try {
      await studentService.saveMarks({
        studentId: selectedStudent,
        scores: {
          physics: Number(marks.physics),
          chemistry: Number(marks.chemistry),
          maths: Number(marks.maths || 0),
          botany: Number(marks.botany || 0),
          zoology: Number(marks.zoology || 0)
        },
        maxScores: {
          physics: Number(marks.maxPhysics || 100),
          chemistry: Number(marks.maxChemistry || 100),
          maths: Number(marks.maxMaths || 100),
          botany: Number(marks.maxBotany || 100),
          zoology: Number(marks.maxZoology || 100)
        },
        attendance: Number(marks.attendance),
        examName: 'Monthly Test',
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
      setMarks({
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
        testNamePhysics: '',
        testNameChemistry: '',
        testNameMaths: '',
        testNameBotany: '',
        testNameZoology: '',
      });
    } catch (err) {
      console.error(err);
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

      <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)}>
        <Alert onClose={() => setOpen(false)} severity="success" variant="filled" sx={{ width: '100%', borderRadius: 3 }}>
          {msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPanel;
