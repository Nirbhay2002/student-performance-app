import React from 'react';
import { Card, Typography, Grid, TextField, MenuItem, Button } from '@mui/material';
import GradeIcon from '@mui/icons-material/Grade';
import SaveIcon from '@mui/icons-material/Save';

const PerformanceForm = ({ students, selectedStudent, setSelectedStudent, marks, setMarks, onSave }) => {
    const handleChange = (field) => (e) => {
        setMarks({ ...marks, [field]: e.target.value });
    };

    return (
        <Card className="glass-card" sx={{ p: 4, height: '100%' }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" sx={{ mb: 3 }}>
                <GradeIcon sx={{ mr: 1.5, color: '#c5a059' }} /> Performance Data Input
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        select
                        label="Select Enrolled Student"
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        sx={{ mb: 1 }}
                    >
                        {students.map(s => <MenuItem key={s._id} value={s._id}>{s.name} (Roll: {s.rollNumber})</MenuItem>)}
                    </TextField>
                </Grid>
                <Grid item xs={4}>
                    <TextField fullWidth label="Mathematics" type="number" value={marks.math} onChange={handleChange('math')} />
                </Grid>
                <Grid item xs={4}>
                    <TextField fullWidth label="Science" type="number" value={marks.science} onChange={handleChange('science')} />
                </Grid>
                <Grid item xs={4}>
                    <TextField fullWidth label="English" type="number" value={marks.english} onChange={handleChange('english')} />
                </Grid>
                <Grid item xs={6}>
                    <TextField fullWidth label="Attendance (Percentage)" type="number" value={marks.attendance} onChange={handleChange('attendance')} />
                </Grid>
                <Grid item xs={6}>
                    <TextField fullWidth label="Discipline Index (1-10)" type="number" value={marks.discipline} onChange={handleChange('discipline')} />
                </Grid>
                <Grid item xs={12}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        size="large"
                        startIcon={<SaveIcon />}
                        onClick={onSave}
                        disabled={!selectedStudent}
                        sx={{ mt: 2, py: 1.5, borderRadius: 3, color: '#fff', fontWeight: 800 }}
                    >
                        Publish Performance Record
                    </Button>
                </Grid>
            </Grid>
        </Card>
    );
};

export default PerformanceForm;
