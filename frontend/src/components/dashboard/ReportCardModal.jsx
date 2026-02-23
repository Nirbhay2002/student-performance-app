import React from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Typography, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, TablePagination } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SubjectTrendChart from './SubjectTrendChart';
import CircularProgress from '@mui/material/CircularProgress';
import DateRangeFilter from './DateRangeFilter';

// Renders a score value or an "Absent" chip when the score is null
const ScoreCell = ({ score, max }) => {
    if (score === null || score === undefined) {
        return <Chip label="Absent" size="small" sx={{ bgcolor: '#fce8e6', color: '#c62828', fontWeight: 700, fontSize: '0.65rem', height: 20 }} />;
    }
    return <>{score}{max ? ` / ${max}` : ''}</>;
};

const ReportCardModal = ({ open, onClose, selectedReport, reportData, isReportLoading, getCategoryColor, onDownload, onSendEmail }) => {
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [activePreset, setActivePreset] = React.useState('all');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);


    const filteredMarks = React.useMemo(() => {
        if (!reportData?.marks) return [];
        let filtered = [...reportData.marks];

        if (startDate) {
            filtered = filtered.filter(m => new Date(m.date) >= new Date(startDate));
        }
        if (endDate) {
            // Include the entire end date by setting time to end of day
            const endLimit = new Date(endDate);
            endLimit.setHours(23, 59, 59, 999);
            filtered = filtered.filter(m => new Date(m.date) <= endLimit);
        }

        return filtered;
    }, [reportData, startDate, endDate]);

    // Reset pagination when filters change
    React.useEffect(() => {
        setPage(0);
    }, [startDate, endDate]);

    // For table: reverse to show latest first (graph still gets chronological order)
    const reversedMarks = React.useMemo(() => {
        return [...filteredMarks].reverse();
    }, [filteredMarks]);

    // Paginated data for table
    const paginatedMarks = React.useMemo(() => {
        return reversedMarks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [reversedMarks, page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

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

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{ sx: { borderRadius: 1.5, position: 'relative' } }}
        >
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    color: (theme) => theme.palette.grey[500],
                    zIndex: 2
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
                    <Button startIcon={<DownloadIcon />} onClick={onDownload} sx={{ borderRadius: 1 }}>Export PDF</Button>
                    <Button startIcon={<SendIcon />} variant="contained" onClick={onSendEmail} sx={{ borderRadius: 1 }}>Notify Parent</Button>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 4, bgcolor: '#fbfbfb', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                {isReportLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, height: '100%' }}>
                        <CircularProgress size={50} color="primary" />
                    </Box>
                ) : reportData && (
                    <Box id="report-card" className="fade-in" sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 1.5, bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Typography variant="h5" fontWeight={900} color="primary" sx={{ letterSpacing: 2 }}>STUDENT<span style={{ color: '#c5a059' }}>PRO</span> ACADEMY</Typography>
                            <Typography variant="subtitle2" color="textSecondary" sx={{ textTransform: 'uppercase', mt: 1 }}>Official Progression Report | 2025-26</Typography>
                        </Box>

                        <Grid container spacing={3} sx={{ mb: 2, p: 3, bgcolor: '#f8f9fa', borderRadius: 1.5 }}>
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
                                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Academic Stream</Typography>
                                <Typography variant="body1" fontWeight={700} color="secondary">{selectedReport?.stream}</Typography>
                            </Grid>
                        </Grid>

                        {/* Date Range Filters */}
                        <Box sx={{ mb: 3 }}>
                            <DateRangeFilter
                                startDate={startDate}
                                endDate={endDate}
                                activePreset={activePreset}
                                onStartDate={setStartDate}
                                onEndDate={setEndDate}
                                onActivePreset={setActivePreset}
                            />
                        </Box>

                        <SubjectTrendChart marks={filteredMarks} stream={selectedReport?.stream} />

                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee', borderRadius: 3, overflow: 'hidden' }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#1a237e' }}>
                                    <TableRow>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Test Date</TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Test Name</TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Physics</TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Chemistry</TableCell>
                                        {selectedReport?.stream === 'Medical' ? (
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
                                    {paginatedMarks.map((m, idx) => (
                                        <TableRow key={idx} sx={{ '&:nth-of-type(even)': { bgcolor: '#fafafa' } }}>
                                            <TableCell sx={{ fontWeight: 600 }}>{new Date(m.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</TableCell>
                                            <TableCell>{formatTestNames(m.testNames, selectedReport?.stream)}</TableCell>
                                            <TableCell><ScoreCell score={m.scores.physics} max={m.maxScores?.physics} /></TableCell>
                                            <TableCell><ScoreCell score={m.scores.chemistry} max={m.maxScores?.chemistry} /></TableCell>
                                            {selectedReport?.stream === 'Medical' ? (
                                                <React.Fragment>
                                                    <TableCell><ScoreCell score={m.scores.botany} max={m.maxScores?.botany} /></TableCell>
                                                    <TableCell><ScoreCell score={m.scores.zoology} max={m.maxScores?.zoology} /></TableCell>
                                                </React.Fragment>
                                            ) : (
                                                <TableCell><ScoreCell score={m.scores.maths} max={m.maxScores?.maths} /></TableCell>
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
                            <TablePagination
                                rowsPerPageOptions={[10, 20, 50, 100]}
                                component="div"
                                count={reversedMarks.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                sx={{ borderTop: '1px solid #eee' }}
                            />
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
