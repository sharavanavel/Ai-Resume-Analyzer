# ATS Resume Analyzer Pro 🎯

A full-stack MERN application for AI-powered ATS (Applicant Tracking System) resume analysis, scoring, and optimization.

## Features

- 📄 **Resume Upload** — PDF and DOCX support with drag & drop
- 🔍 **ATS Score Calculation** — Multi-factor weighted scoring algorithm
- 📊 **Visual Analytics** — Score gauge, breakdown charts, keyword analysis
- ✨ **AI Optimization** — Groq-powered resume rewriting
- 🔀 **Side-by-Side Comparison** — Diff-based original vs improved view
- ⬇️ **Resume Download** — Download AI-improved resume
- 📋 **Analysis History** — MongoDB-backed history tracking

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, React Dropzone |
| Backend | Node.js, Express.js, Multer, pdf-parse, mammoth |
| Database | MongoDB (Atlas compatible) |
| AI | Groq API (LLaMA 3.3 70B) |

## Folder Structure

```
ats-resume-analyzer/
├── server/
│   ├── models/
│   │   ├── Resume.js
│   │   ├── AnalysisReport.js
│   │   └── ImprovedVersion.js
│   ├── routes/
│   │   └── api.js
│   ├── middleware/
│   │   └── upload.js
│   ├── utils/
│   │   ├── extractText.js
│   │   ├── atsScorer.js
│   │   └── aiOptimizer.js
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ScoreGauge.jsx
│   │   │   ├── KeywordBadges.jsx
│   │   │   └── DiffViewer.jsx
│   │   ├── pages/
│   │   │   ├── UploadPage.jsx
│   │   │   ├── ResultsPage.jsx
│   │   │   ├── ComparePage.jsx
│   │   │   └── HistoryPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- **Node.js** v18+ — [Download here](https://nodejs.org/)
- **MongoDB Atlas** account — [Create free cluster](https://www.mongodb.com/atlas)
- **Groq API Key** — [Get free key](https://console.groq.com)

### 1. Clone & Install

```bash
# Backend
cd ats-resume-analyzer/server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure Environment

Edit `server/.env`:
```env
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/ats-analyzer?retryWrites=true&w=majority
GROQ_API_KEY=gsk_your_groq_api_key_here
PORT=5000
```

### 3. Run Development

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Upload resume + JD → ATS analysis |
| POST | `/api/optimize` | AI-optimize resume by report ID |
| GET | `/api/history` | List all past analyses |
| GET | `/api/report/:id` | Get specific report + improved version |

## ATS Scoring Algorithm

```
Final Score = (0.5 × Keyword Match) + (0.2 × Section Coverage) + (0.2 × Formatting) + (0.1 × Experience)
```

| Factor | Weight | Checks |
|--------|--------|--------|
| Keywords | 50% | JD keyword presence in resume |
| Sections | 20% | Summary, Experience, Education, Skills, Projects, Certs |
| Formatting | 20% | No tables/images, bullet points, proper length |
| Experience | 10% | Action verbs, quantified achievements, JD relevance |

## Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Deploy the `dist/` folder to Vercel
```

### Backend → Render
1. Push `server/` to GitHub
2. Create new **Web Service** on Render
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add environment variables: `MONGODB_URI`, `GROQ_API_KEY`

### Environment Variables
| Variable | Where | Purpose |
|----------|-------|---------|
| `MONGODB_URI` | Render | MongoDB Atlas connection string |
| `GROQ_API_KEY` | Render | AI model access |
| `VITE_API_URL` | Vercel | Backend URL (update Axios base URL) |

## Future Enhancements

- 🔐 User authentication (JWT)
- 📊 Multiple JD comparison
- 🎨 Resume template builder
- 📧 Email reports
- 🔄 Real-time collaboration
- 📱 Mobile app (React Native)
