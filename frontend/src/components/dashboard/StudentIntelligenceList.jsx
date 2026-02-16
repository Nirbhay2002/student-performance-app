import React from 'react';
import { Card, Box, Typography, Chip } from '@mui/material';

const StudentIntelligenceList = ({ students, onStudentClick, getCategoryColor }) => {
    return (
        <Card className="glass-card" sx={{ p: 3, height: '90%', overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Student Intelligence</Typography>
            <Box sx={{ overflowY: 'auto', maxHeight: 400, pr: 1 }}>
                {students.map(s => (
                    <Box
                        key={s._id}
                        className="slide-in"
                        sx={{
                            p: 2,
                            mb: 1.5,
                            borderRadius: 3,
                            border: '1px solid #f0f2f5',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': { bgcolor: '#f8f9fa', borderColor: 'primary.light', transform: 'scale(1.02)' }
                        }}
                        onClick={() => onStudentClick(s)}
                    >
                        <Box>
                            <Typography variant="body1" fontWeight={700}>{s.name}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                Avg: {s?.averageMarks?.toFixed(1)} / 300
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" fontWeight={800} color="primary">
                                {s?.performanceScore?.toFixed(0)}%
                            </Typography>
                            <Chip
                                label={s.category}
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: '0.65rem',
                                    fontWeight: 900,
                                    bgcolor: getCategoryColor(s.category),
                                    color: '#fff',
                                    mt: 0.5
                                }}
                            />
                        </Box>
                    </Box>
                ))}
            </Box>
        </Card>
    );
};

export default StudentIntelligenceList;
