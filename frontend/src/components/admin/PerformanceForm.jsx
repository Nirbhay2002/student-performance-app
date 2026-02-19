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
            <Grid container spacing={3} alignItems="center">
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        select
                        label="Select Enrolled Student"
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                    >
                        {students.map(s => <MenuItem key={s._id} value={s._id}>{s.name} (Roll: {s.rollNumber})</MenuItem>)}
                    </TextField>
                </Grid>
                <Grid item xs={students.find(s => s._id === selectedStudent)?.stream === 'Medical' || students.find(s => s._id === selectedStudent)?.stream === 'Non-Medical' ? 4 : 12}>
                    <TextField fullWidth label="Physics" type="number" value={marks.physics} onChange={handleChange('physics')} />
                </Grid>
                <Grid item xs={4}>
                    <TextField fullWidth label="Chemistry" type="number" value={marks.chemistry} onChange={handleChange('chemistry')} />
                </Grid>
                {students.find(s => s._id === selectedStudent)?.stream === 'Non-Medical' && (
                    <Grid item xs={4}>
                        <TextField fullWidth label="Mathematics" type="number" value={marks.maths} onChange={handleChange('maths')} />
                    </Grid>
                )}
                {students.find(s => s._id === selectedStudent)?.stream === 'Medical' && (
                    <Grid item xs={4}>
                        <TextField fullWidth label="Biology" type="number" value={marks.bio} onChange={handleChange('bio')} />
                    </Grid>
                )}
                <Grid item xs={12}>
                    <TextField fullWidth label="Attendance (Percentage)" type="number" value={marks.attendance} onChange={handleChange('attendance')} />
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
                        sx={{ py: 1.5, borderRadius: 1, color: '#fff', fontWeight: 800 }}
                    >
                        Publish Performance Record
                    </Button>
                </Grid>
            </Grid>
        </Card>
    );
};

export default PerformanceForm;
