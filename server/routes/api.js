/**
 * API Routes
 * All endpoints for resume analysis, optimization, and history.
 * Works in-memory when MongoDB is not configured.
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Models
const Resume = require('../models/Resume');
const AnalysisReport = require('../models/AnalysisReport');
const ImprovedVersion = require('../models/ImprovedVersion');

// Utils
const { extractText } = require('../utils/extractText');
const { calculateATSScore } = require('../utils/atsScorer');
const { optimizeResume } = require('../utils/aiOptimizer');

// Middleware
const upload = require('../middleware/upload');

// ─── In-Memory Store (used when MongoDB is not connected) ───
const memoryStore = {
    resumes: {},
    reports: {},
    improved: {},
};

/**
 * POST /api/analyze
 * Upload resume + job description → ATS analysis report
 */
router.post('/analyze', upload.single('resume'), async (req, res) => {
    try {
        const { jobDescription } = req.body;

        // Validate inputs
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a resume file (PDF or DOCX)' });
        }
        if (!jobDescription || jobDescription.trim().length < 20) {
            return res.status(400).json({ error: 'Please provide a valid job description (at least 20 characters)' });
        }

        // Determine file type
        const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
        const filePath = req.file.path;

        // Extract text from resume
        const resumeText = await extractText(filePath, ext);

        if (!resumeText || resumeText.length < 50) {
            return res.status(400).json({ error: 'Could not extract enough text from the resume. Please check the file.' });
        }

        // Calculate ATS score
        const atsResult = calculateATSScore(resumeText, jobDescription);

        let reportData;

        if (global.dbConnected) {
            // ─── Save to MongoDB ─────────────────────────
            const resume = await Resume.create({
                fileName: req.file.originalname,
                fileType: ext,
                originalText: resumeText,
            });

            const report = await AnalysisReport.create({
                resumeId: resume._id,
                jobDescription,
                score: atsResult.score,
                breakdown: atsResult.breakdown,
                matchedKeywords: atsResult.matchedKeywords,
                missingKeywords: atsResult.missingKeywords,
                weakSections: atsResult.weakSections,
                formattingIssues: atsResult.formattingIssues,
                suggestions: atsResult.suggestions,
            });

            reportData = {
                _id: report._id,
                resumeId: resume._id,
                fileName: resume.fileName,
                originalText: resumeText,
                score: report.score,
                breakdown: report.breakdown,
                matchedKeywords: report.matchedKeywords,
                missingKeywords: report.missingKeywords,
                weakSections: report.weakSections,
                formattingIssues: report.formattingIssues,
                suggestions: report.suggestions,
                createdAt: report.createdAt,
            };
        } else {
            // ─── In-Memory Mode ──────────────────────────
            const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
            const resumeId = 'r_' + id;
            const reportId = 'rp_' + id;

            memoryStore.resumes[resumeId] = {
                _id: resumeId,
                fileName: req.file.originalname,
                fileType: ext,
                originalText: resumeText,
            };

            memoryStore.reports[reportId] = {
                _id: reportId,
                resumeId,
                jobDescription,
                fileName: req.file.originalname,
                originalText: resumeText,
                score: atsResult.score,
                breakdown: atsResult.breakdown,
                matchedKeywords: atsResult.matchedKeywords,
                missingKeywords: atsResult.missingKeywords,
                weakSections: atsResult.weakSections,
                formattingIssues: atsResult.formattingIssues,
                suggestions: atsResult.suggestions,
                createdAt: new Date(),
            };

            reportData = memoryStore.reports[reportId];
        }

        // Clean up uploaded file
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }

        res.json({ success: true, report: reportData });
    } catch (error) {
        console.error('Analyze Error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

/**
 * POST /api/optimize
 * AI-powered resume optimization
 */
router.post('/optimize', async (req, res) => {
    try {
        const { reportId } = req.body;

        if (!reportId) {
            return res.status(400).json({ error: 'Report ID is required' });
        }

        let report, resumeText, jobDescription, missingKeywords, suggestions;

        if (global.dbConnected) {
            // ─── MongoDB Mode ────────────────────────────
            report = await AnalysisReport.findById(reportId);
            if (!report) return res.status(404).json({ error: 'Analysis report not found' });

            const resume = await Resume.findById(report.resumeId);
            if (!resume) return res.status(404).json({ error: 'Resume not found' });

            // Check if already optimized
            const existing = await ImprovedVersion.findOne({ reportId: report._id });
            if (existing) {
                return res.json({
                    success: true,
                    improvedVersion: {
                        _id: existing._id,
                        improvedText: existing.improvedText,
                        createdAt: existing.createdAt,
                    },
                });
            }

            resumeText = resume.originalText;
            jobDescription = report.jobDescription;
            missingKeywords = report.missingKeywords;
            suggestions = report.suggestions;
        } else {
            // ─── In-Memory Mode ──────────────────────────
            report = memoryStore.reports[reportId];
            if (!report) return res.status(404).json({ error: 'Analysis report not found' });

            // Check if already optimized
            if (memoryStore.improved[reportId]) {
                return res.json({
                    success: true,
                    improvedVersion: memoryStore.improved[reportId],
                });
            }

            resumeText = report.originalText;
            jobDescription = report.jobDescription;
            missingKeywords = report.missingKeywords;
            suggestions = report.suggestions;
        }

        // Call AI optimizer
        const improvedText = await optimizeResume(resumeText, jobDescription, missingKeywords, suggestions);

        let improvedData;

        if (global.dbConnected) {
            const improved = await ImprovedVersion.create({
                reportId: report._id,
                improvedText,
            });
            improvedData = {
                _id: improved._id,
                improvedText: improved.improvedText,
                createdAt: improved.createdAt,
            };
        } else {
            improvedData = {
                _id: 'iv_' + Date.now().toString(36),
                improvedText,
                createdAt: new Date(),
            };
            memoryStore.improved[reportId] = improvedData;
        }

        res.json({ success: true, improvedVersion: improvedData });
    } catch (error) {
        console.error('Optimize Error:', error);
        res.status(500).json({ error: error.message || 'AI optimization failed' });
    }
});

/**
 * GET /api/history
 * Get all past analysis reports
 */
router.get('/history', async (req, res) => {
    try {
        if (global.dbConnected) {
            const reports = await AnalysisReport.find()
                .populate('resumeId', 'fileName fileType uploadedAt')
                .sort({ createdAt: -1 })
                .limit(50);

            res.json({
                success: true,
                reports: reports.map(r => ({
                    _id: r._id,
                    fileName: r.resumeId?.fileName || 'Unknown',
                    score: r.score,
                    createdAt: r.createdAt,
                })),
            });
        } else {
            // In-Memory
            const reports = Object.values(memoryStore.reports)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 50)
                .map(r => ({
                    _id: r._id,
                    fileName: r.fileName,
                    score: r.score,
                    createdAt: r.createdAt,
                }));

            res.json({ success: true, reports });
        }
    } catch (error) {
        console.error('History Error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

/**
 * GET /api/report/:id
 * Get a single report with improved version
 */
router.get('/report/:id', async (req, res) => {
    try {
        if (global.dbConnected) {
            const report = await AnalysisReport.findById(req.params.id);
            if (!report) return res.status(404).json({ error: 'Report not found' });

            const resume = await Resume.findById(report.resumeId);
            const improved = await ImprovedVersion.findOne({ reportId: report._id });

            res.json({
                success: true,
                report: {
                    _id: report._id,
                    fileName: resume?.fileName || 'Unknown',
                    originalText: resume?.originalText || '',
                    jobDescription: report.jobDescription,
                    score: report.score,
                    breakdown: report.breakdown,
                    matchedKeywords: report.matchedKeywords,
                    missingKeywords: report.missingKeywords,
                    weakSections: report.weakSections,
                    formattingIssues: report.formattingIssues,
                    suggestions: report.suggestions,
                    createdAt: report.createdAt,
                    improvedVersion: improved ? {
                        _id: improved._id,
                        improvedText: improved.improvedText,
                        createdAt: improved.createdAt,
                    } : null,
                },
            });
        } else {
            // In-Memory
            const report = memoryStore.reports[req.params.id];
            if (!report) return res.status(404).json({ error: 'Report not found' });

            const improved = memoryStore.improved[req.params.id] || null;

            res.json({
                success: true,
                report: {
                    ...report,
                    improvedVersion: improved,
                },
            });
        }
    } catch (error) {
        console.error('Report Error:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

module.exports = router;
