import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Grid, CircularProgress } from '@mui/material';
import { studentService } from '../services/studentService';
import { downloadPDF } from '../utils';
import useStudentStore from '../store/useStudentStore';

// Sub-components
import StatsCards from './dashboard/StatsCards';
import PerformanceDistributionChart from './dashboard/PerformanceDistributionChart';
import ReportCardModal from './dashboard/ReportCardModal';
import ScoreRangeBreakdown from './dashboard/ScoreRangeBreakdown';
import SubjectRadarChart from './dashboard/SubjectRadarChart';
import TestPerformanceChart from './dashboard/TestPerformanceChart';

const Dashboard = ({ navigate }) => {
  const [students, setStudents] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReportLoading, setIsReportLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const data = await useStudentStore.getState().fetchStudents();
      setStudents(data.students);
    } catch (err) {
      alert(`Failed to load students: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReport = async (student) => {
    setIsReportLoading(true);
    try {
      const data = await useStudentStore.getState().fetchStudentPerformance(student._id);
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



  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} thickness={4} color="primary" />
      </Box>
    );
  }

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

      {/* All 3 charts in a single row — flex so each fills equal width */}
      <Box sx={{ display: 'flex', gap: 4, alignItems: 'stretch' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <ScoreRangeBreakdown students={students} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <PerformanceDistributionChart students={students} navigate={navigate} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SubjectRadarChart />
        </Box>
      </Box>

      {/* Full-width test name performance chart */}
      <TestPerformanceChart />

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
    </Box>
  );
};

export default Dashboard;
