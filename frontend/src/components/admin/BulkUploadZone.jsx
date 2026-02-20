import React, { useState } from 'react';
import { Card, Typography, Box, Button, CircularProgress, Alert, List, ListItem, ListItemText, Divider } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { studentService } from '../../services/studentService';

const BulkUploadZone = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
        setResult(null);
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await studentService.bulkUploadMarks(file);
            setResult(data);
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to upload file');
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const headers = 'rollNumber,examName,date,physics,maxPhysics,chemistry,maxChemistry,maths,maxMaths,bio,maxBio,attendance,remarks\n';
        const sample = 'STU001,Mid-Term 1,2024-03-01,85,100,90,100,88,100,0,100,95,Great performance\n';
        const blob = new Blob([headers + sample], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'marks_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <Card className="glass-card" sx={{ p: 4, mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" display="flex" alignItems="center">
                    <CloudUploadIcon sx={{ mr: 1.5, color: 'primary.main' }} /> Bulk Marks Import
                </Typography>
                <Button
                    startIcon={<FileDownloadIcon />}
                    variant="text"
                    size="small"
                    onClick={downloadTemplate}
                >
                    Get Template
                </Button>
            </Box>

            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Upload a CSV or Excel file with roll numbers to automatically assign marks to multiple students.
            </Typography>

            <Box
                sx={{
                    border: '2px dashed #ccc',
                    borderRadius: 3,
                    p: 4,
                    textAlign: 'center',
                    transition: '0.3s',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(25, 118, 210, 0.04)' }
                }}
            >
                <input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    id="bulk-file-input"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
                <label htmlFor="bulk-file-input" style={{ cursor: 'pointer' }}>
                    <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body1" fontWeight={600}>
                        {file ? file.name : 'Click or Drag to Select File'}
                    </Typography>
                </label>
            </Box>

            {file && (
                <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
                    onClick={handleUpload}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Start Bulk Processing'}
                </Button>
            )}

            {error && (
                <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {result && (
                <Box sx={{ mt: 3 }}>
                    <Alert
                        severity={result.errorCount > 0 ? "warning" : "success"}
                        icon={<CheckCircleOutlineIcon />}
                        sx={{ borderRadius: 2, mb: 2 }}
                    >
                        {result.message}
                    </Alert>

                    {result.errors && result.errors.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" fontWeight={700} sx={{ mb: 1, display: 'block' }}>
                                ERRORS DETECTED ({result.errorCount}):
                            </Typography>
                            <List dense sx={{ bgcolor: 'rgba(211, 47, 47, 0.05)', borderRadius: 2, p: 1, maxHeight: 150, overflow: 'auto' }}>
                                {result.errors.map((err, i) => (
                                    <React.Fragment key={i}>
                                        <ListItem>
                                            <ListItemText
                                                primary={err}
                                                primaryTypographyProps={{ variant: 'caption', color: 'error' }}
                                            />
                                        </ListItem>
                                        {i < result.errors.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </Box>
                    )}
                </Box>
            )}
        </Card>
    );
};

export default BulkUploadZone;
