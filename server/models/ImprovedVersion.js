const mongoose = require('mongoose');

const improvedVersionSchema = new mongoose.Schema({
    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AnalysisReport',
        required: true,
    },
    improvedText: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('ImprovedVersion', improvedVersionSchema);
