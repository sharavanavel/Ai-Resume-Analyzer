const mongoose = require('mongoose');

const analysisReportSchema = new mongoose.Schema({
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: true,
    },
    jobDescription: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    breakdown: {
        keywordScore: { type: Number, default: 0 },
        sectionScore: { type: Number, default: 0 },
        formattingScore: { type: Number, default: 0 },
        experienceScore: { type: Number, default: 0 },
    },
    matchedKeywords: [String],
    missingKeywords: [String],
    weakSections: [String],
    formattingIssues: [String],
    suggestions: [String],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('AnalysisReport', analysisReportSchema);
