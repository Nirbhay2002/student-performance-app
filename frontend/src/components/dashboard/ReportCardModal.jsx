import React from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Typography, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, TextField, TablePagination } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SubjectTrendChart from './SubjectTrendChart';
import CircularProgress from '@mui/material/CircularProgress';

const ReportCardModal = ({ open, onClose, selectedReport, reportData, isReportLoading, getCategoryColor, onDownload, onSendEmail }) => {
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [activePreset, setActivePreset] = React.useState('all');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handlePreset = (preset) => {
        setActivePreset(preset);
        const end = new Date();
        let start = new Date();

        switch (preset) {
            case '1m':
                start.setMonth(end.getMonth() - 1);
                break;
            case '3m':
                start.setMonth(end.getMonth() - 3);
                break;
            case '6m':
                start.setMonth(end.getMonth() - 6);
                break;
            case '1y':
                start.setFullYear(end.getFullYear() - 1);
                break;
            case 'all':
                setStartDate('');
                setEndDate('');
                return;
            default:
                return;
        }

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

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

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
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
                        <Box sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 1.5, bgcolor: '#fff' }}>
                            <Typography variant="caption" fontWeight={700} color="textSecondary" sx={{ mb: 1.5, display: 'block', textTransform: 'uppercase' }}>
                                Analysis Timeframe
                            </Typography>
                            <Grid container spacing={2.5}>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {[
                                            { label: '1 Month', value: '1m' },
                                            { label: '3 Months', value: '3m' },
                                            { label: '6 Months', value: '6m' },
                                            { label: '1 Year', value: '1y' },
                                            { label: 'All Time', value: 'all' }
                                        ].map(preset => (
                                            <Button
                                                key={preset.value}
                                                size="small"
                                                variant={activePreset === preset.value ? 'contained' : 'outlined'}
                                                onClick={() => handlePreset(preset.value)}
                                                sx={{ borderRadius: 4, px: 2, fontSize: '0.7rem' }}
                                            >
                                                {preset.label}
                                            </Button>
                                        ))}
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <TextField
                                            type="date"
                                            size="small"
                                            label="From"
                                            InputLabelProps={{ shrink: true }}
                                            inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                            value={startDate}
                                            onChange={(e) => { setStartDate(e.target.value); setActivePreset('custom'); }}
                                            sx={{ flex: 1 }}
                                        />
                                        <TextField
                                            type="date"
                                            size="small"
                                            label="To"
                                            InputLabelProps={{ shrink: true }}
                                            inputProps={{
                                                max: new Date().toISOString().split('T')[0],
                                                min: startDate
                                            }}
                                            disabled={!startDate}
                                            value={endDate}
                                            onChange={(e) => { setEndDate(e.target.value); setActivePreset('custom'); }}
                                            sx={{ flex: 1 }}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                        <SubjectTrendChart marks={filteredMarks} stream={selectedReport?.stream} />

                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee', borderRadius: 3, overflow: 'hidden' }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#1a237e' }}>
                                    <TableRow>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Test Date</TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Physics</TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Chemistry</TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>{selectedReport?.stream === 'Medical' ? 'Biology' : 'Mathematics'}</TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Attendance</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedMarks.map((m, idx) => (
                                        <TableRow key={idx} sx={{ '&:nth-of-type(even)': { bgcolor: '#fafafa' } }}>
                                            <TableCell sx={{ fontWeight: 600 }}>{new Date(m.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</TableCell>
                                            <TableCell>{m.scores.physics} {m.maxScores?.physics ? `/ ${m.maxScores.physics}` : ''}</TableCell>
                                            <TableCell>{m.scores.chemistry} {m.maxScores?.chemistry ? `/ ${m.maxScores.chemistry}` : ''}</TableCell>
                                            <TableCell>
                                                {selectedReport?.stream === 'Medical' ? m.scores.bio : m.scores.maths}
                                                {selectedReport?.stream === 'Medical'
                                                    ? (m.maxScores?.bio ? ` / ${m.maxScores.bio}` : '')
                                                    : (m.maxScores?.maths ? ` / ${m.maxScores.maths}` : '')
                                                }
                                            </TableCell>
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
