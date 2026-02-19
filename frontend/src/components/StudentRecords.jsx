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
    Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { studentService } from '../services/studentService';
import ReportCardModal from './dashboard/ReportCardModal';
import { downloadPDF } from '../utils';

const StudentRecords = ({ navParams }) => {
    const [students, setStudents] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

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
        try {
            const data = await studentService.getStudentPerformance(student._id);
            setReportData(data);
            setSelectedReport(student);
        } catch (err) {
            alert(`Failed to load report: ${err.message}`);
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
                        <Typography color="primary" variant="h6">Loading...</Typography>
                    </Box>
                )}
                <Table>
                    <TableHead sx={{ bgcolor: 'primary.main' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 700 }}>Name & Roll</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 700 }}>Stream</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 700 }}>Batch</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Performance</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Avg Marks</TableCell>
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
                                    <Typography variant="body2" fontWeight={700}>
                                        {student.averageMarks?.toFixed(1)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton size="small" color="primary">
                                        <VisibilityIcon />
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
                getCategoryColor={getCategoryColor}
                onDownload={downloadReport}
                onSendEmail={sendEmail}
            />
        </Box>
    );
};

export default StudentRecords;
