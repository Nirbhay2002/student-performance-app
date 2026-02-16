import React from 'react';
import { Card, Typography, Grid, TextField, MenuItem, Button } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const RegistrationForm = ({ studentName, setStudentName, rollNumber, setRollNumber, email, setEmail, batch, setBatch, onRegister }) => {
    return (
        <Card className="glass-card" sx={{ p: 4, height: '100%' }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" color="primary" sx={{ mb: 3 }}>
                <PersonAddIcon sx={{ mr: 1.5 }} /> Student Enrollment
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField fullWidth label="Full Name" variant="outlined" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
                </Grid>
                <Grid item xs={6}>
                    <TextField fullWidth label="Roll Number" variant="outlined" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} />
                </Grid>
                <Grid item xs={6}>
                    <TextField fullWidth select label="Batch" value={batch} onChange={(e) => setBatch(e.target.value)}>
                        <MenuItem value="A1">Priority Batch A1</MenuItem>
                        <MenuItem value="B1">Standard Batch B1</MenuItem>
                        <MenuItem value="C1">Core Batch C1</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12}>
                    <TextField fullWidth label="Parent Contact Email" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={onRegister}
                        sx={{ mt: 2, py: 1.5, borderRadius: 3 }}
                    >
                        Register Candidate
                    </Button>
                </Grid>
            </Grid>
        </Card>
    );
};

export default RegistrationForm;
