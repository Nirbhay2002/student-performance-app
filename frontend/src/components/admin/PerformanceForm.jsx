import React from 'react';
import { Card, Typography, Grid, TextField, MenuItem, Button, CircularProgress, Box } from '@mui/material';
import GradeIcon from '@mui/icons-material/Grade';
import SaveIcon from '@mui/icons-material/Save';

const PerformanceForm = ({ students, selectedStudent, setSelectedStudent, marks, setMarks, onSave, isLoading }) => {
    const handleChange = (field) => (e) => {
        setMarks({ ...marks, [field]: e.target.value });
    };

    // Default date to today (YYYY-MM-DD) for the date input
    const today = new Date().toISOString().split('T')[0];

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
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Test Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ max: today }}
                        value={marks.date || today}
                        onChange={handleChange('date')}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Exam / Test Name"
                        value={marks.examName}
                        onChange={handleChange('examName')}
                        placeholder="e.g. Mid-Term 1"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField fullWidth label="Physics" type="number" value={marks.physics} onChange={handleChange('physics')} />
                        <TextField fullWidth label="Max" type="number" value={marks.maxPhysics} onChange={handleChange('maxPhysics')} sx={{ maxWidth: 80 }} />
                        <TextField fullWidth label="Chapter / Name" value={marks.testNamePhysics} onChange={handleChange('testNamePhysics')} placeholder="e.g. Kinematics" />
                    </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField fullWidth label="Chemistry" type="number" value={marks.chemistry} onChange={handleChange('chemistry')} />
                        <TextField fullWidth label="Max" type="number" value={marks.maxChemistry} onChange={handleChange('maxChemistry')} sx={{ maxWidth: 80 }} />
                        <TextField fullWidth label="Chapter / Name" value={marks.testNameChemistry} onChange={handleChange('testNameChemistry')} placeholder="e.g. Organic" />
                    </Box>
                </Grid>
                {students.find(s => s._id === selectedStudent)?.stream === 'Non-Medical' && (
                    <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField fullWidth label="Mathematics" type="number" value={marks.maths} onChange={handleChange('maths')} />
                            <TextField fullWidth label="Max" type="number" value={marks.maxMaths} onChange={handleChange('maxMaths')} sx={{ maxWidth: 80 }} />
                            <TextField fullWidth label="Chapter / Name" value={marks.testNameMaths} onChange={handleChange('testNameMaths')} placeholder="e.g. Calculus" />
                        </Box>
                    </Grid>
                )}
                {students.find(s => s._id === selectedStudent)?.stream === 'Medical' && (
                    <React.Fragment>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField fullWidth label="Botany" type="number" value={marks.botany} onChange={handleChange('botany')} />
                                <TextField fullWidth label="Max" type="number" value={marks.maxBotany} onChange={handleChange('maxBotany')} sx={{ maxWidth: 80 }} />
                                <TextField fullWidth label="Chapter / Name" value={marks.testNameBotany} onChange={handleChange('testNameBotany')} placeholder="e.g. Chapter 1" />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField fullWidth label="Zoology" type="number" value={marks.zoology} onChange={handleChange('zoology')} />
                                <TextField fullWidth label="Max" type="number" value={marks.maxZoology} onChange={handleChange('maxZoology')} sx={{ maxWidth: 80 }} />
                                <TextField fullWidth label="Chapter / Name" value={marks.testNameZoology} onChange={handleChange('testNameZoology')} placeholder="e.g. Chapter 1" />
                            </Box>
                        </Grid>
                    </React.Fragment>
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
                        startIcon={!isLoading && <SaveIcon />}
                        onClick={onSave}
                        disabled={!selectedStudent || isLoading}
                        sx={{ py: 1.5, borderRadius: 1, color: '#fff', fontWeight: 800 }}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Publish Performance Record'}
                    </Button>
                </Grid>
            </Grid>
        </Card>
    );
};

export default PerformanceForm;
