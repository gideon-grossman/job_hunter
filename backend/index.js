const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// Job search endpoint
app.get('/api/search-jobs', (req, res) => {
  try {
    // Simulate job search for green software jobs
    const jobs = [
      {
        id: 1,
        title: 'Green Software Engineer',
        company: 'EcoTech Solutions',
        location: 'San Francisco, CA',
        description: 'Build sustainable software solutions for climate tech companies',
        requirements: ['JavaScript', 'React', 'Node.js', 'AWS'],
        salary: '$120k - $150k',
        type: 'Full-time',
        remote: true
      },
      {
        id: 2,
        title: 'Sustainability Developer',
        company: 'GreenCloud Inc',
        location: 'New York, NY',
        description: 'Develop applications that help companies reduce their carbon footprint',
        requirements: ['Python', 'Django', 'PostgreSQL', 'Docker'],
        salary: '$110k - $140k',
        type: 'Full-time',
        remote: true
      },
      {
        id: 3,
        title: 'Climate Impact Fullstack Engineer',
        company: 'Renewables.io',
        location: 'Austin, TX',
        description: 'Create platforms for renewable energy management and optimization',
        requirements: ['TypeScript', 'React', 'Node.js', 'MongoDB'],
        salary: '$100k - $130k',
        type: 'Full-time',
        remote: false
      },
      {
        id: 4,
        title: 'Environmental Data Scientist',
        company: 'EcoAnalytics',
        location: 'Seattle, WA',
        description: 'Build ML models to analyze environmental data and predict climate patterns',
        requirements: ['Python', 'TensorFlow', 'Pandas', 'SQL'],
        salary: '$130k - $160k',
        type: 'Full-time',
        remote: true
      }
    ];
    
    res.json({ jobs: jobs });
  } catch (error) {
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
