import React, { useState, useEffect } from 'react';
import { Typography, Box, Card, Grid, TextField, Button, MenuItem, Snackbar, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GradeIcon from '@mui/icons-material/Grade';
import api from '../services/api';

const AdminPanel = () => {
  const [students, setStudents] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [batch, setBatch] = useState('A1');

  const [selectedStudent, setSelectedStudent] = useState('');
  const [math, setMath] = useState('');
  const [science, setScience] = useState('');
  const [english, setEnglish] = useState('');
  const [attendance, setAttendance] = useState('');
  const [discipline, setDiscipline] = useState('');

  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async () => {
    try {
      await api.post('/students', { name: studentName, rollNumber, email, batch });
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
      await api.post('/marks', {
        studentId: selectedStudent,
        scores: { math: Number(math), science: Number(science), english: Number(english) },
        attendance: Number(attendance),
        disciplinePoint: Number(discipline),
        examName: 'Monthly Test'
      });
      setMsg('Marks saved & Rank updated!');
      setOpen(true);
      setMath('');
      setScience('');
      setEnglish('');
      setAttendance('');
      setDiscipline('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Admin Control Panel</Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <PersonAddIcon sx={{ mr: 1 }} /> Register New Student
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Full Name" variant="outlined" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Roll Number" variant="outlined" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth select label="Batch" value={batch} onChange={(e) => setBatch(e.target.value)}>
                  <MenuItem value="A1">Batch A1</MenuItem>
                  <MenuItem value="B1">Batch B1</MenuItem>
                  <MenuItem value="C1">Batch C1</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Parent Email" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="contained" size="large" onClick={handleRegister}>Register Student</Button>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <GradeIcon sx={{ mr: 1, color: 'primary.main' }} /> Input Test Performance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth select label="Select Student" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                  {students.map(s => <MenuItem key={s._id} value={s._id}>{s.name} ({s.rollNumber})</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth label="Math" type="number" value={math} onChange={(e) => setMath(e.target.value)} />
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth label="Science" type="number" value={science} onChange={(e) => setScience(e.target.value)} />
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth label="English" type="number" value={english} onChange={(e) => setEnglish(e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Attendance (%)" type="number" value={attendance} onChange={(e) => setAttendance(e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Discipline (1-10)" type="number" value={discipline} onChange={(e) => setDiscipline(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveMarks}
                  disabled={!selectedStudent}
                >
                  Save & Calculate Batch
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)}>
        <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%' }}>
          {msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPanel;
