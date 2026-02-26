/**
 * ATS Resume Analyzer Pro — Server Entry Point
 * Connects to MongoDB, registers routes, starts Express.
 */
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Global flag — routes check this to skip DB operations
global.dbConnected = false;

// ─── Ensure uploads directory exists ─────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ─────────────────────────────────────────────
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// ─── Health Check ───────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Global Error Handler ───────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 5MB limit' });
    }
    if (err.message === 'Only PDF and DOCX files are allowed') {
        return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: 'Internal server error' });
});

// ─── Connect to MongoDB & Start Server ──────────────────────
async function startServer() {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI || mongoURI.includes('YOUR_USER')) {
            console.warn('⚠️  MongoDB URI not configured. Running without database.');
            console.warn('   Set MONGODB_URI in .env file for full functionality.');
        } else {
            await mongoose.connect(mongoURI);
            global.dbConnected = true;
            console.log('✅ Connected to MongoDB');
        }

        app.listen(PORT, () => {
            console.log(`\n🚀 ATS Resume Analyzer Pro`);
            console.log(`   Server running on http://localhost:${PORT}`);
            console.log(`   Health check: http://localhost:${PORT}/health\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
