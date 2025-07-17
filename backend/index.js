const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT ||5050;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Only PDF, DOC, and DOCX files are allowed!');
    }
  }
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// CV upload endpoint
app.post('/api/upload-cv', upload.single('cv'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Simulate CV parsing
    const cvData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
      experience: '5 years',
      education: 'Bachelor in Computer Science'
    };
    
    res.json({ 
      message: 'CV uploaded successfully',
      cvData: cvData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Job search endpoint (now uses Remotive API)
app.get('/api/search-jobs', async (req, res) => {
  try {
    // For demo: use hardcoded skills, but in production use parsed CV data
    const skills = req.query.skills || 'green software, sustainability, climate, renewable, frontend, data visualization, typescript, react';
    console.log('skills:' + skills);
    const keywords = Array.isArray(skills) ? skills.join(' ') : skills;
    console.log('keywords:' + keywords);
    const remotiveUrl = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(keywords)}`;
    console.log('remotiveUrl:' + remotiveUrl);
    const response = await axios.get(remotiveUrl);
    const jobs = (response.data.jobs || []).map((job, idx) => ({
      id: job.id || idx,
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location,
      description: job.description,
      requirements: [job.category],
      salary: job.salary || 'N/A',
      type: job.job_type,
      remote: true,
      url: job.url
    }));
    console.log('jobs[0]:' + JSON.stringify(jobs[0]));
    res.json({ jobs });
  } catch (error) {
    console.log('error:' + error);
    res.status(500).json({ error: error.message });
  }
});

// Generate tailored applications endpoint
app.post('/api/generate-applications', (req, res) => {
  try {
    const { cvData, selectedJobs } = req.body;
    
    if (!cvData || !selectedJobs) {
      return res.status(400).json({ error: 'CV data and selected jobs are required' });
    }
    
    // Simulate generating tailored applications
    const applications = selectedJobs.map(job => ({
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      tailoredResume: `Experienced software engineer with ${cvData.experience} in ${cvData.skills.join(', ')}. Passionate about green technology and sustainability. Perfect fit for ${job.title} role at ${job.company}.`,
      coverLetter: `Dear Hiring Manager at ${job.company},

I am excited to apply for the ${job.title} position. With my background in ${cvData.skills.join(', ')}, I am confident I can contribute to your mission of ${job.description}.

My experience aligns perfectly with your requirements, and I am passionate about using technology to address climate challenges.

Best regards,
[Your Name]`
    }));
    
    res.json({ applications: applications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit applications endpoint
app.post('/api/submit-applications', (req, res) => {
  try {
    const { applications } = req.body;
    
    if (!applications || applications.length === 0) {
      return res.status(400).json({ error: 'No applications to submit' });
    }
    
    // Simulate application submission
    const results = applications.map(app => ({
      jobId: app.jobId,
      jobTitle: app.jobTitle,
      company: app.company,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    }));
    
    res.json({ 
      message: 'Applications submitted successfully',
      results: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
