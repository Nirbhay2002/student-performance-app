import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid } from '@mui/material';
import { studentService } from '../services/studentService';
import useStudentStore from '../store/useStudentStore';
import useNotificationStore from '../store/useNotificationStore';

// Sub-components
import RegistrationForm from './admin/RegistrationForm';
import PerformanceForm from './admin/PerformanceForm';
import BulkUploadZone from './admin/BulkUploadZone';

const AdminPanel = () => {
  const [students, setStudents] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [batch, setBatch] = useState('Growth');
  const [subBatch, setSubBatch] = useState('None');
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

  const showNotification = useNotificationStore((state) => state.showNotification);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSavingMarks, setIsSavingMarks] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  // Auto-fill student details when rollNumber changes
  useEffect(() => {
    if (rollNumber.length >= 2) {
      const timer = setTimeout(async () => {
        try {
          const student = await studentService.getStudentByRoll(rollNumber);
          if (student) {
            setStudentName(student.name);
            setEmail(student.email);
            setBatch(student.batch);
            setSubBatch(student.subBatch || 'None');
            setStream(student.stream);
            setIsUpdating(true);
            showNotification('Existing student detected. Ready to update info.', 'info');
          }
        } catch (err) {
          // If 404, just ignore, it's a new student
          if (err.response?.status !== 404) {
            console.error('Error fetching student:', err);
          }
        }
      }, 500); // 500ms debounce
      return () => clearTimeout(timer);
    } else if (rollNumber.length === 0) {
      // Clear fields if rollNumber is emptied out
      setStudentName('');
      setRollNumber('');
      setEmail('');
      setSubBatch('None');
      setIsUpdating(false);
    }
  }, [rollNumber]);

  const fetchStudents = async () => {
    try {
      const data = await useStudentStore.getState().fetchStudents();
      setStudents(data.students);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      const response = await studentService.registerStudent({ name: studentName, rollNumber, email, batch, subBatch, stream });
      useStudentStore.getState().invalidateCache();
      showNotification(response.message || 'Student saved successfully!', 'success');
      fetchStudents();
      setStudentName('');
      setRollNumber('');
      setEmail('');
      setSubBatch('None');
      setStream('Non-Medical'); // Reset to default
      setBatch('Growth');       // Reset to default
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
      useStudentStore.getState().invalidateCache();
      showNotification('Marks saved & Rank updated!', 'success');
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
      showNotification(errMsg, 'error');
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
            subBatch={subBatch}
            setSubBatch={setSubBatch}
            stream={stream}
            setStream={setStream}
            onRegister={handleRegister}
            isLoading={isRegistering}
            isUpdate={isUpdating}
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

          <BulkUploadZone
            onUploadSuccess={() => { useStudentStore.getState().invalidateCache(); fetchStudents(); }}
            uploadFn={studentService.bulkUploadMarks}
          />
          <BulkUploadZone
            title="Bulk Student Enrollment"
            description="Upload a CSV or Excel file to register or update multiple students at once. Required: name, rollNumber, email, stream."
            templateFilename="student_enrollment_template.csv"
            templateHeaders="name,rollNumber,email,batch,subBatch,stream\n"
            templateSamples="John Doe,STU101,john@example.com,Growth,A1,Non-Medical"
            onUploadSuccess={() => { useStudentStore.getState().invalidateCache(); fetchStudents(); }}
            uploadFn={studentService.bulkUploadStudents}
          />
    </Box>
  );
};

export default AdminPanel;
