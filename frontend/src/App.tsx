import React, { useState } from 'react';
import { Container, Typography, Box, Button, Stepper, Step, StepLabel, Paper, Input, CircularProgress, Card, CardContent, Checkbox, FormControlLabel, TextField, Alert } from '@mui/material';

const PORT = 5050;
const BASE_URL = `http://localhost:${PORT}`;
const API_URL = `${BASE_URL}/api`;
const steps = ['Upload CV', 'Review Jobs', 'Approve Applications', 'Submit Applications'];

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary: string;
  type: string;
  remote: boolean;
}

interface Application {
  jobId: number;
  jobTitle: string;
  company: string;
  tailoredResume: string;
  coverLetter: string;
}

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvData, setCvData] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleFindJobs = async () => {
    if (!cvFile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Upload CV
      const formData = new FormData();
      formData.append('cv', cvFile);
      
      const uploadResponse = await fetch(`${API_URL}/upload-cv`, {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload CV');
      }
      
      const uploadResult = await uploadResponse.json();
      setCvData(uploadResult.cvData);
      
      // Search for jobs
      const jobsResponse = await fetch(`${API_URL}/search-jobs`);
      if (!jobsResponse.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const jobsResult = await jobsResponse.json();
      setJobs(jobsResult.jobs);
      setActiveStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleJobSelection = (job: Job, checked: boolean) => {
    if (checked) {
      setSelectedJobs([...selectedJobs, job]);
    } else {
      setSelectedJobs(selectedJobs.filter(j => j.id !== job.id));
    }
  };

  const handleGenerateApplications = async () => {
    if (selectedJobs.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/generate-applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvData,
          selectedJobs,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate applications');
      }
      
      const result = await response.json();
      setApplications(result.applications);
      setActiveStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplications = async () => {
    if (applications.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applications,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit applications');
      }
      
      setActiveStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Green Job Hunter
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 4 }}>
        {activeStep === 0 && (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              Upload your CV to get started
            </Typography>
            <Input 
              type="file" 
              inputProps={{ accept: '.pdf,.doc,.docx' }} 
              onChange={handleCvUpload}
              sx={{ mb: 2 }}
            />
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                disabled={!cvFile || loading}
                onClick={handleFindJobs}
              >
                {loading ? <CircularProgress size={24} /> : 'Find Green Jobs'}
              </Button>
            </Box>
          </Box>
        )}
        
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Jobs Matched to Your CV
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                {jobs.map((job) => (
                  <Card key={job.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedJobs.some(j => j.id === job.id)}
                            onChange={(e) => handleJobSelection(job, e.target.checked)}
                          />
                        }
                        label=""
                      />
                      <Typography variant="h6">{job.title}</Typography>
                      <Typography color="textSecondary">{job.company}</Typography>
                      <Typography variant="body2">{job.location}</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {job.description}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Requirements:</strong> {job.requirements.join(', ')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Salary:</strong> {job.salary} | <strong>Type:</strong> {job.type}
                        {job.remote && ' | Remote'}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
            <Box mt={2} display="flex" justifyContent="space-between">
              <Button onClick={handleBack}>Back</Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleGenerateApplications}
                disabled={selectedJobs.length === 0 || loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Generate Applications'}
              </Button>
            </Box>
          </Box>
        )}
        
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review and Approve Applications
            </Typography>
            {applications.map((app, index) => (
              <Card key={app.jobId} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">{app.jobTitle} at {app.company}</Typography>
                  <Typography variant="subtitle1" sx={{ mt: 1 }}>
                    <strong>Tailored Resume:</strong>
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={app.tailoredResume}
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>
                    <strong>Cover Letter:</strong>
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    value={app.coverLetter}
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            ))}
            <Box mt={2} display="flex" justifyContent="space-between">
              <Button onClick={handleBack}>Back</Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSubmitApplications}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Applications'}
              </Button>
            </Box>
          </Box>
        )}
        
        {activeStep === 3 && (
          <Box textAlign="center">
            <Typography variant="h5" color="success.main" gutterBottom>
              Applications Submitted!
            </Typography>
            <Typography variant="body1">
              Thank you for using Green Job Hunter. Good luck with your applications!
            </Typography>
            <Box mt={2}>
              <Button variant="outlined" onClick={() => setActiveStep(0)}>
                Start Over
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default App;
