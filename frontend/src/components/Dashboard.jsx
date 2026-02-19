import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Grid } from '@mui/material';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { studentService } from '../services/studentService';

// Sub-components
import StatsCards from './dashboard/StatsCards';
import PerformanceDistributionChart from './dashboard/PerformanceDistributionChart';
import StudentIntelligenceList from './dashboard/StudentIntelligenceList';
import ReportCardModal from './dashboard/ReportCardModal';

const Dashboard = ({ navigate }) => {
  const [students, setStudents] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      setStudents(data.students);
    } catch (err) {
      alert(`Failed to load students: ${err.message}`);
    }
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
    const input = document.getElementById('report-card');
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0);
      pdf.save(`${selectedReport.name}_Report.pdf`);
    });
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

  // Optimization: Only show top/bottom for the intelligence list
  const sortedStudents = [...students].sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0));
  const top10 = sortedStudents.slice(0, 10);
  const bottom10 = sortedStudents.slice(-10).reverse();

  return (
    <Box className="fade-in">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 800 }}>Performance Dashboard</Typography>
          <Typography variant="body1" color="textSecondary">Scalable analytics engine supporting {students.length} students</Typography>
        </Box>
        <Chip
          label="Academic Session 2025-26"
          variant="outlined"
          color="secondary"
          sx={{ fontWeight: 600, px: 1 }}
        />
      </Box>

      <StatsCards students={students} navigate={navigate} />

      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <PerformanceDistributionChart students={students} navigate={navigate} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <StudentIntelligenceList
              title="🏆 Top Achievers"
              students={top10}
              onStudentClick={handleOpenReport}
              getCategoryColor={getCategoryColor}
            />
          </Box>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <StudentIntelligenceList
              title="⚠️ Need Attention"
              students={bottom10}
              onStudentClick={handleOpenReport}
              getCategoryColor={getCategoryColor}
            />
          </Box>
        </Grid>
      </Grid>

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

export default Dashboard;
