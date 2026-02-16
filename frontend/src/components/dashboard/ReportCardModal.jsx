import React from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Typography, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

const ReportCardModal = ({ open, onClose, selectedReport, reportData, getCategoryColor, onDownload, onSendEmail }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 5, position: 'relative' } }}
        >
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    color: (theme) => theme.palette.grey[500],
                    zIndex: 1
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogTitle sx={{ px: 4, py: 3, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 8 }}>
                <Box>
                    <Typography variant="h6">Academic Dossier</Typography>
                    <Typography variant="caption" color="textSecondary">Detailed student performance breakdown</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button startIcon={<DownloadIcon />} onClick={onDownload} sx={{ borderRadius: 3 }}>Export PDF</Button>
                    <Button startIcon={<SendIcon />} variant="contained" onClick={onSendEmail} sx={{ borderRadius: 3 }}>Notify Parent</Button>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 4, bgcolor: '#fbfbfb' }}>
                {reportData && (
                    <Box id="report-card" className="fade-in" sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 4, bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Typography variant="h5" fontWeight={900} color="primary" sx={{ letterSpacing: 2 }}>STUDENT<span style={{ color: '#c5a059' }}>PRO</span> ACADEMY</Typography>
                            <Typography variant="subtitle2" color="textSecondary" sx={{ textTransform: 'uppercase', mt: 1 }}>Official Progression Report | 2025-26</Typography>
                        </Box>

                        <Grid container spacing={3} sx={{ mb: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: 3 }}>
                            <Grid item xs={4}>
                                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Candidate Name</Typography>
                                <Typography variant="body1" fontWeight={700}>{selectedReport?.name}</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Roll Number</Typography>
                                <Typography variant="body1" fontWeight={700}>{selectedReport?.rollNumber}</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Performance Index</Typography>
                                <Typography variant="body1" fontWeight={700} color="primary">{selectedReport?.performanceScore?.toFixed(1)}%</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Global Status</Typography>
                                <Box>{selectedReport && <Chip label={selectedReport.category} size="small" sx={{ fontWeight: 800, bgcolor: getCategoryColor(selectedReport.category), color: '#fff' }} />}</Box>
                            </Grid>
                        </Grid>

                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee', borderRadius: 3, overflow: 'hidden' }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#1a237e' }}>
                                    <TableRow>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Test Date</TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Mathematics</TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Science</TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>English</TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Attendance</TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Total (300)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportData.marks.map((m, idx) => (
                                        <TableRow key={idx} sx={{ '&:nth-of-type(even)': { bgcolor: '#fafafa' } }}>
                                            <TableCell sx={{ fontWeight: 600 }}>{new Date(m.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</TableCell>
                                            <TableCell>{m.scores.math}</TableCell>
                                            <TableCell>{m.scores.science}</TableCell>
                                            <TableCell>{m.scores.english}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: m.attendance < 75 ? 'error.main' : 'success.main', fontWeight: 700 }}>
                                                    {m.attendance}%
                                                </Typography>
                                            </TableCell>
                                            <TableCell><Typography fontWeight={800}>{m.totalScore}</Typography></TableCell>
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
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ReportCardModal;
