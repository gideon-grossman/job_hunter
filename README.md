# Green Job Hunter

A full-stack web app to automatically find and apply to green software jobs, tailored to your CV.

## Features
- Upload your CV and parse your skills
- Search real green/remote jobs (Remotive API)
- Generate tailored resumes and cover letters
- Review and submit applications
- Modern React/Material UI frontend
- Node.js/Express backend

---

## Prerequisites
- Node.js (v16+ recommended)
- npm (comes with Node.js)

---

## Getting Started

### 1. Clone the repository
```bash
git clone git@github.com:YOUR_USERNAME/job_hunter.git
cd job_hunter
```

### 2. Install dependencies
#### Frontend
```bash
cd frontend
npm install
```
#### Backend
```bash
cd ../backend
npm install
```

---

## Running the App

### Start the Backend
In the `backend` directory:
```bash
node index.js
```
The backend will run on [http://localhost:5050](http://localhost:5050)

### Start the Frontend
In a new terminal, go to the `frontend` directory:
```bash
npm start
```
The frontend will run on [http://localhost:3000](http://localhost:3000)

---

## Usage
1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. Upload your CV and follow the steps to find and apply to green jobs.

---

## Configuration
- The backend uses the Remotive API for job search (no API key required).
- You can adjust the backend port in `backend/index.js` (default: 5050).

---

## License
MIT
