import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    InputAdornment,
    IconButton,
    Grid,
    CircularProgress,
    Button,
    Popover,
    Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { studentService } from '../services/studentService';
import ReportCardModal from './dashboard/ReportCardModal';
import PerformanceModal from './dashboard/PerformanceModal';
import { downloadPDF, generatePdfBlob } from '../utils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import HiddenReportContent from './dashboard/HiddenReportContent';
import DateRangeFilter from './dashboard/DateRangeFilter';

const StudentRecords = ({ navParams }) => {
    const [students, setStudents] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    // Cancellation Ref
    const cancelDownloadRef = React.useRef(false);

    // Filters
    const [searchName, setSearchName] = useState('');
    const [filterStream, setFilterStream] = useState('All');
    const [filterBatch, setFilterBatch] = useState('All');
    const [filterCategory, setFilterCategory] = useState(navParams?.category || 'All');

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Report Modal
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [isReportLoading, setIsReportLoading] = useState(false);

    // Performance Modal
    const [selectedPerformanceStudent, setSelectedPerformanceStudent] = useState(null);

    // Batch Download State
    const [isDownloadingZip, setIsDownloadingZip] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [totalToDownload, setTotalToDownload] = useState(0);
    const [batchStudent, setBatchStudent] = useState(null);
    const [batchReport, setBatchReport] = useState(null);

    // Bulk download date filter
    const [downloadMenuAnchor, setDownloadMenuAnchor] = useState(null);
    const [bulkStartDate, setBulkStartDate] = useState('');
    const [bulkEndDate, setBulkEndDate] = useState('');
    const [bulkActivePreset, setBulkActivePreset] = useState('all');

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchName);
            setPage(0); // Reset to first page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchName]);

    // Handle Navigation Params Updates (if component is already mounted)
    useEffect(() => {
        if (navParams) {
            let changed = false;

            // Category Filter
            if (navParams.category && navParams.category !== filterCategory) {
                setFilterCategory(navParams.category);
                changed = true;
            }

            if (changed) setPage(0);
        }
    }, [navParams]);

    useEffect(() => {
        fetchStudents();
    }, [page, rowsPerPage, debouncedSearch, filterStream, filterBatch, filterCategory]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const data = await studentService.getAllStudents({
                page,
                limit: rowsPerPage,
                search: debouncedSearch,
                stream: filterStream,
                batch: filterBatch,
                category: filterCategory
            });
            setStudents(data.students);
            setTotal(data.total);
        } catch (err) {
            console.error('Failed to fetch students:', err);
        } finally {
            setLoading(false);
        }
    };

    const clearPerformanceFilter = () => {
        setFilterMinScore(null);
        setFilterMaxScore(null);
        setPage(0);
    };

    const handleOpenReport = async (student) => {
        setIsReportLoading(true);
        try {
            const data = await studentService.getStudentPerformance(student._id);
            setReportData(data);
            setSelectedReport(student);
        } catch (err) {
            alert(`Failed to load report: ${err.message}`);
        } finally {
            setIsReportLoading(false);
        }
    };

    const downloadReport = () => {
        if (!selectedReport) return;
        downloadPDF('report-card', `${selectedReport.name}_Report`);
    };

    const sendEmail = () => {
        if (!selectedReport) return;
        alert(`Report card sent to ${selectedReport.email}`);
    };

    const getCategoryColor = (cat) => {
        switch (cat) {
            case 'Best': return '#34a853';
            case 'Medium': return '#fbbc05';
            case 'Worst': return '#ea4335';
            default: return '#5f6368';
        }
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDownloadAllZip = async () => {
        setIsDownloadingZip(true);
        cancelDownloadRef.current = false;
        try {
            let allStudents = [];
            let p = 0;
            let t = 1;
            while (allStudents.length < t) {
                if (cancelDownloadRef.current) throw new Error("Cancelled by user");
                const res = await studentService.getAllStudents({ page: p, limit: 100, search: debouncedSearch, stream: filterStream, batch: filterBatch, category: filterCategory });
                allStudents = [...allStudents, ...res.students];
                t = res.total;
                p++;
            }

            setTotalToDownload(allStudents.length);
            setDownloadProgress(0);

            const zip = new JSZip();

            for (let i = 0; i < allStudents.length; i++) {
                if (cancelDownloadRef.current) throw new Error("Cancelled by user");

                const student = allStudents[i];
                const reportData = await studentService.getStudentPerformance(student._id);

                await new Promise(resolve => {
                    setBatchStudent(student);
                    setBatchReport(reportData);
                    setTimeout(resolve, 800); // Allow DOM to render and charts to init
                });

                if (cancelDownloadRef.current) throw new Error("Cancelled by user");

                const blob = await generatePdfBlob('hidden-report-card');
                zip.file(`${student.rollNumber}_${student.name}_Report.pdf`, blob);

                setDownloadProgress(i + 1);
            }

            if (cancelDownloadRef.current) throw new Error("Cancelled by user");

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            saveAs(zipBlob, `Student_Report_Cards_${new Date().toISOString().split('T')[0]}.zip`);

        } catch (err) {
            if (err.message === "Cancelled by user") {
                console.log("Zip download cancelled.");
            } else {
                console.error("Failed to download zip:", err);
                alert("An error occurred while downloading report cards zip.");
            }
        } finally {
            setIsDownloadingZip(false);
            setBatchStudent(null);
            setBatchReport(null);
            setDownloadProgress(0);
            setTotalToDownload(0);
            cancelDownloadRef.current = false;
        }
    };

    const handleOpenDownloadMenu = (event) => {
        setDownloadMenuAnchor(event.currentTarget);
    };

    const handleCloseDownloadMenu = () => {
        setDownloadMenuAnchor(null);
    };

    const handleConfirmDownload = () => {
        handleCloseDownloadMenu();
        handleDownloadAllZip();
    };

    const handleCancelDownload = () => {
        cancelDownloadRef.current = true;
    };

    const batches = ['All', 'Growth', 'Excel', 'Conquer']; // Simplified for now, or fetch from separate endpoint

    return (
        <Box className="fade-in">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 800 }}>
                        Student Records
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        Comprehensive database of enrolled students and academic performance.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {isDownloadingZip && (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleCancelDownload}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={isDownloadingZip || students.length === 0}
                        onClick={handleOpenDownloadMenu}
                        sx={{
                            "&.Mui-disabled": {
                                backgroundColor: "primary.main",
                                color: "white",
                                opacity: 0.7
                            }
                        }}
                    >
                        {isDownloadingZip ? `Zipping (${downloadProgress}/${totalToDownload})...` : 'Download All as ZIP'}
                    </Button>

                    {/* Date filter popover */}
                    <Popover
                        open={Boolean(downloadMenuAnchor)}
                        anchorEl={downloadMenuAnchor}
                        onClose={handleCloseDownloadMenu}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        PaperProps={{ sx: { p: 2.5, width: 420, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } }}
                    >
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                            Filter Report Cards by Date
                        </Typography>
                        <DateRangeFilter
                            startDate={bulkStartDate}
                            endDate={bulkEndDate}
                            activePreset={bulkActivePreset}
                            onStartDate={setBulkStartDate}
                            onEndDate={setBulkEndDate}
                            onActivePreset={setBulkActivePreset}
                        />
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button size="small" onClick={handleCloseDownloadMenu}>Cancel</Button>
                            <Button size="small" variant="contained" onClick={handleConfirmDownload}>
                                Download ZIP
                            </Button>
                        </Box>
                    </Popover>
                </Box>
            </Box>

            {/* Hidden component for batch pdf generation */}
            <Box sx={{ position: 'absolute', top: -9999, left: -9999, opacity: 0, pointerEvents: 'none' }}>
                <HiddenReportContent
                    student={batchStudent}
                    reportData={batchReport}
                    getCategoryColor={getCategoryColor}
                    dateFilter={{ startDate: bulkStartDate, endDate: bulkEndDate }}
                />
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 1.5, border: '1px solid #f0f0f0' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Search by name or roll number..."
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <TextField
                            fullWidth
                            select
                            label="Stream"
                            value={filterStream}
                            onChange={(e) => { setFilterStream(e.target.value); setPage(0); }}
                        >
                            <MenuItem value="All">All Streams</MenuItem>
                            <MenuItem value="Medical">Medical (PCB)</MenuItem>
                            <MenuItem value="Non-Medical">Non-Medical (PCM)</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <TextField
                            fullWidth
                            select
                            label="Batch"
                            value={filterBatch}
                            onChange={(e) => { setFilterBatch(e.target.value); setPage(0); }}
                        >
                            {batches.map(b => (
                                <MenuItem key={b} value={b}>{b === 'All' ? 'All Batches' : b}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={6} md={4}>
                        <TextField
                            fullWidth
                            select
                            label="Performance Category"
                            value={filterCategory}
                            onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }}
                        >
                            <MenuItem value="All">All Categories</MenuItem>
                            <MenuItem value="Best">Best (Elite)</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="Worst">Worst</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            {/* Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 1.5, border: '1px solid #f0f0f0', overflow: 'hidden', position: 'relative' }}>
                {loading && (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(255,255,255,0.7)', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                )}
                <Table>
                    <TableHead sx={{ bgcolor: 'primary.main' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 700 }}>Name & Roll</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 700 }}>Stream</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 700 }}>Batch</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Performance</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Rank</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.length > 0 ? students.map((student) => (
                            <TableRow
                                key={student._id}
                                hover
                                onClick={() => handleOpenReport(student)}
                                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(26, 115, 232, 0.04)' } }}
                            >
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight={700}>{student.name}</Typography>
                                    <Typography variant="caption" color="textSecondary">{student.rollNumber}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={student.stream}
                                        size="small"
                                        variant="outlined"
                                        color={student.stream === 'Medical' ? 'secondary' : 'default'}
                                        sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{student.batch}</Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={student.category}
                                        size="small"
                                        sx={{
                                            bgcolor: getCategoryColor(student.category),
                                            color: 'white',
                                            fontWeight: 800,
                                            fontSize: '0.65rem',
                                            minWidth: 70
                                        }}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2" fontWeight={700} color="primary.main">
                                        #{student.rank || '-'}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton size="small" color="secondary" onClick={(e) => { e.stopPropagation(); setSelectedPerformanceStudent(student); }} title="View Performance Velocity">
                                        <TrendingUpIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        )) : !loading && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                    <Typography color="textSecondary">No students found matching your filters.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                />
            </TableContainer>

            <ReportCardModal
                open={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                selectedReport={selectedReport}
                reportData={reportData}
                isReportLoading={isReportLoading}
                getCategoryColor={getCategoryColor}
                onDownload={downloadReport}
                onSendEmail={sendEmail}
            />

            <PerformanceModal
                open={!!selectedPerformanceStudent}
                onClose={() => setSelectedPerformanceStudent(null)}
                student={selectedPerformanceStudent}
            />
        </Box>
    );
};

export default StudentRecords;
