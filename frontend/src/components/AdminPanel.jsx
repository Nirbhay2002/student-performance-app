import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid, Snackbar, Alert } from '@mui/material';
import { studentService } from '../services/studentService';

// Sub-components
import RegistrationForm from './admin/RegistrationForm';
import PerformanceForm from './admin/PerformanceForm';

const AdminPanel = () => {
  const [students, setStudents] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [batch, setBatch] = useState('A1');

  const [selectedStudent, setSelectedStudent] = useState('');
  const [marks, setMarks] = useState({
    math: '',
    science: '',
    english: '',
    attendance: '',
    discipline: ''
  });

  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async () => {
    try {
      await studentService.registerStudent({ name: studentName, rollNumber, email, batch });
      setMsg('Student registered successfully!');
      setOpen(true);
      fetchStudents();
      setStudentName('');
      setRollNumber('');
      setEmail('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveMarks = async () => {
    try {
      await studentService.saveMarks({
        studentId: selectedStudent,
        scores: { math: Number(marks.math), science: Number(marks.science), english: Number(marks.english) },
        attendance: Number(marks.attendance),
        disciplinePoint: Number(marks.discipline),
        examName: 'Monthly Test'
      });
      setMsg('Marks saved & Rank updated!');
      setOpen(true);
      setMarks({
        math: '',
        science: '',
        english: '',
        attendance: '',
        discipline: ''
      });
    } catch (err) {
      console.error(err);
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
            onRegister={handleRegister}
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
          />
        </Grid>
      </Grid>

      <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)}>
        <Alert onClose={() => setOpen(false)} severity="success" variant="filled" sx={{ width: '100%', borderRadius: 3 }}>
          {msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPanel;
