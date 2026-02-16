import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, MenuItem, Select, FormControl, InputLabel, Chip, Button, Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import PersonIcon from '@mui/icons-material/Person';
import GradeIcon from '@mui/icons-material/Grade';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import api from '../services/api';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      console.log('Fetching students from API...');
      const res = await api.get('/students');
      console.log('Students fetched successfully:', res.data.length);
      setStudents(res.data);
    } catch (err) {
      alert(`Failed to load students: ${err.message}`);
    }
  };

  const handleOpenReport = async (student) => {
    try {
      const res = await api.get(`/students/${student._id}/performance`);
      setReportData(res.data);
      setSelectedReport(student);
    } catch (err) {
      alert(`Failed to load report: ${err.message}`);
    }
  };

  const downloadReport = () => {
    const input = document.getElementById('report-card');
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0);
      pdf.save(`${selectedReport.name}_Report.pdf`);
    });
  };

  const sendEmail = () => {
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Performance Overview</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#e8f0fe', color: 'primary.main', mr: 2 }}>
                  <PersonIcon />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Total Students</Typography>
                  <Typography variant="h5">{students.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#e6f4ea', color: 'success.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Average Score</Typography>
                  <Typography variant="h5">
                    {students.length > 0 ? (students.reduce((acc, s) => acc + s?.averageMarks, 0) / students.length)?.toFixed(1) : 0} / 300
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#fef7e0', color: 'warning.main', mr: 2 }}>
                  <GradeIcon />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Top Performers</Typography>
                  <Typography variant="h5">{students.filter(s => s.category === 'Best').length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Overall Performance Distribution</Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={students}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="performanceScore" stroke="#1a73e8" strokeWidth={3} dot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Student Batches</Typography>
            {students.map(s => (
              <Box
                key={s._id}
                sx={{
                  py: 1.5,
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#f8f9fa' }
                }}
                onClick={() => handleOpenReport(s)}
              >
                <Box>
                  <Typography variant="body1" fontWeight={600}>{s.name}</Typography>
                  <Typography variant="body2" color="textSecondary">Score: {s?.averageMarks?.toFixed(1)} / 300 ({s?.performanceScore?.toFixed(1)}%)</Typography>
                </Box>
                <Chip
                  label={s.category}
                  size="small"
                  sx={{ bgcolor: getCategoryColor(s.category), color: '#fff', fontWeight: 700 }}
                />
              </Box>
            ))}
          </Card>
        </Grid>
      </Grid>

      {/* Report Card Modal */}
      <Dialog open={!!selectedReport} onClose={() => setSelectedReport(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Report Card - {selectedReport?.name}
          <Box>
            <Button startIcon={<DownloadIcon />} onClick={downloadReport} sx={{ mr: 1 }}>Download</Button>
            <Button startIcon={<SendIcon />} variant="contained" onClick={sendEmail}>Send to Parent</Button>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {reportData && (
            <Box id="report-card" sx={{ p: 3, border: '1px solid #eee', borderRadius: 2, bgcolor: '#fff' }}>
              <Typography variant="h5" align="center" gutterBottom color="primary">Coaching Institute Progress Report</Typography>
              <Typography variant="body2" align="center" gutterBottom>Academic Session 2025-26</Typography>

              <Grid container spacing={2} sx={{ my: 3 }}>
                <Grid item xs={6}><Typography><b>Student Name:</b> {selectedReport.name}</Typography></Grid>
                <Grid item xs={6}><Typography><b>Roll No:</b> {selectedReport.rollNumber}</Typography></Grid>
                <Grid item xs={6}><Typography><b>Batch Category:</b> {selectedReport.category}</Typography></Grid>
                <Grid item xs={6}><Typography><b>Average Marks:</b> {selectedReport?.averageMarks?.toFixed(1)} / 300</Typography></Grid>
                <Grid item xs={6}><Typography><b>Performance Score:</b> {selectedReport?.performanceScore?.toFixed(1)}%</Typography></Grid>
              </Grid>

              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                    <TableRow>
                      <TableCell>Test Date</TableCell>
                      <TableCell>Math</TableCell>
                      <TableCell>Science</TableCell>
                      <TableCell>English</TableCell>
                      <TableCell>Att %</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.marks.map((m, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{new Date(m.date).toLocaleDateString()}</TableCell>
                        <TableCell>{m.scores.math}</TableCell>
                        <TableCell>{m.scores.science}</TableCell>
                        <TableCell>{m.scores.english}</TableCell>
                        <TableCell>{m.attendance}%</TableCell>
                        <TableCell><b>{m.totalScore}/300</b></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
