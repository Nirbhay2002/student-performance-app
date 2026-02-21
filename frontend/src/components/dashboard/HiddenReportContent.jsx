import React from 'react';
import { Box, Typography, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import SubjectTrendChart from './SubjectTrendChart';

const HiddenReportContent = ({ student, reportData, getCategoryColor }) => {
    const formatTestNames = (testNames, stream) => {
        if (!testNames) return <Typography variant="caption" color="textSecondary">Combined test</Typography>;

        const validSubjects = [];
        if (testNames.physics && testNames.physics !== 'Combined test') validSubjects.push(`Phy: ${testNames.physics}`);
        if (testNames.chemistry && testNames.chemistry !== 'Combined test') validSubjects.push(`Chem: ${testNames.chemistry}`);

        if (stream === 'Medical') {
            if (testNames.botany && testNames.botany !== 'Combined test') validSubjects.push(`Bot: ${testNames.botany}`);
            if (testNames.zoology && testNames.zoology !== 'Combined test') validSubjects.push(`Zoo: ${testNames.zoology}`);
        } else {
            if (testNames.maths && testNames.maths !== 'Combined test') validSubjects.push(`Math: ${testNames.maths}`);
        }

        if (validSubjects.length === 0) return <Typography variant="caption" color="textSecondary">Combined test</Typography>;

        return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {validSubjects.map((s, i) => (
                    <Chip key={i} label={s} size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                ))}
            </Box>
        );
    };

    if (!student || !reportData) return null;

    const reversedMarks = [...reportData.marks].reverse();

    return (
        <Box id="hidden-report-card" sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 1.5, bgcolor: '#fff', width: '1200px', backgroundColor: '#fff' }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h5" fontWeight={900} color="primary" sx={{ letterSpacing: 2 }}>STUDENT<span style={{ color: '#c5a059' }}>PRO</span> ACADEMY</Typography>
                <Typography variant="subtitle2" color="textSecondary" sx={{ textTransform: 'uppercase', mt: 1 }}>Official Progression Report | 2025-26</Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 2, p: 3, bgcolor: '#f8f9fa', borderRadius: 1.5 }}>
                <Grid item xs={4}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Candidate Name</Typography>
                    <Typography variant="body1" fontWeight={700}>{student?.name}</Typography>
                </Grid>
                <Grid item xs={2}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Roll Number</Typography>
                    <Typography variant="body1" fontWeight={700}>{student?.rollNumber}</Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Performance Index</Typography>
                    <Typography variant="body1" fontWeight={700} color="primary">{student?.performanceScore?.toFixed(1)}%</Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Academic Stream</Typography>
                    <Typography variant="body1" fontWeight={700} color="secondary">{student?.stream}</Typography>
                </Grid>
            </Grid>

            <SubjectTrendChart marks={reportData.marks} stream={student?.stream} />

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee', borderRadius: 3, overflow: 'hidden', mt: 4 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#1a237e' }}>
                        <TableRow>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Test Date</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Test Name</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Physics</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Chemistry</TableCell>
                            {student?.stream === 'Medical' ? (
                                <React.Fragment>
                                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Botany</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Zoology</TableCell>
                                </React.Fragment>
                            ) : (
                                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Mathematics</TableCell>
                            )}
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Attendance</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reversedMarks.map((m, idx) => (
                            <TableRow key={idx} sx={{ '&:nth-of-type(even)': { bgcolor: '#fafafa' } }}>
                                <TableCell sx={{ fontWeight: 600 }}>{new Date(m.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</TableCell>
                                <TableCell>{formatTestNames(m.testNames, student?.stream)}</TableCell>
                                <TableCell>{m.scores.physics} {m.maxScores?.physics ? `/ ${m.maxScores.physics}` : ''}</TableCell>
                                <TableCell>{m.scores.chemistry} {m.maxScores?.chemistry ? `/ ${m.maxScores.chemistry}` : ''}</TableCell>
                                {student?.stream === 'Medical' ? (
                                    <React.Fragment>
                                        <TableCell>{m.scores.botany} {m.maxScores?.botany ? `/ ${m.maxScores.botany}` : ''}</TableCell>
                                        <TableCell>{m.scores.zoology} {m.maxScores?.zoology ? `/ ${m.maxScores.zoology}` : ''}</TableCell>
                                    </React.Fragment>
                                ) : (
                                    <TableCell>{m.scores.maths} {m.maxScores?.maths ? `/ ${m.maxScores.maths}` : ''}</TableCell>
                                )}
                                <TableCell>
                                    <Typography variant="body2" sx={{ color: m.attendance < 75 ? 'error.main' : 'success.main', fontWeight: 700 }}>
                                        {m.attendance}%
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="textSecondary">Generated securely via StudentPro Analytics Engine</Typography>
                <Box sx={{ textAlign: 'center', minWidth: 150 }}>
                    <Box sx={{ height: 40, borderBottom: '1px solid #eee' }} />
                    <Typography variant="caption" fontWeight={700}>System Signature</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default HiddenReportContent;
