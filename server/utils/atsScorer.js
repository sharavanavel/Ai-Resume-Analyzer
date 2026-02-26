/**
 * ATS Scoring Algorithm
 *
 * Calculates ATS compatibility score based on:
 *  - Keyword match score (50%)
 *  - Section completeness score (20%)
 *  - Formatting compatibility score (20%)
 *  - Experience relevance score (10%)
 *
 * Final Score = (0.5 * keyword) + (0.2 * section) + (0.2 * formatting) + (0.1 * experience)
 */

// Common ATS-expected sections
const EXPECTED_SECTIONS = [
    { name: 'Summary', patterns: ['summary', 'objective', 'profile', 'about me', 'professional summary'] },
    { name: 'Experience', patterns: ['experience', 'work experience', 'employment', 'work history', 'professional experience'] },
    { name: 'Education', patterns: ['education', 'academic', 'qualification', 'degree'] },
    { name: 'Skills', patterns: ['skills', 'technical skills', 'core competencies', 'technologies', 'tools'] },
    { name: 'Projects', patterns: ['projects', 'personal projects', 'academic projects', 'key projects'] },
    { name: 'Certifications', patterns: ['certifications', 'certificates', 'licenses'] },
];

// Common formatting red flags for ATS
const FORMATTING_ISSUES_CHECKS = [
    { issue: 'Contains table-like structures', pattern: /(\|.*\|.*\|)/i },
    { issue: 'Contains image references', pattern: /(\.png|\.jpg|\.jpeg|\.gif|\.svg|\.bmp|\[image\])/i },
    { issue: 'Contains special unicode characters', pattern: /[^\x00-\x7F\u00C0-\u024F\u1E00-\u1EFF]/g },
    { issue: 'Uses excessive capitalization', pattern: /[A-Z]{20,}/ },
    { issue: 'Contains URLs without context', pattern: /https?:\/\/[^\s]+(?!\))/g },
];

/**
 * Extract keywords from job description
 * @param {string} jobDescription - The job description text
 * @returns {string[]} Array of keywords
 */
function extractKeywords(jobDescription) {
    // Common stop words to filter out
    const stopWords = new Set([
        'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
        'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'must',
        'this', 'that', 'these', 'those', 'it', 'its', 'we', 'you', 'they',
        'our', 'your', 'their', 'not', 'no', 'if', 'as', 'so', 'up', 'out',
        'about', 'into', 'over', 'after', 'under', 'between', 'through',
        'during', 'before', 'above', 'below', 'also', 'just', 'than', 'then',
        'now', 'here', 'there', 'when', 'where', 'how', 'all', 'each', 'every',
        'both', 'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own',
        'same', 'very', 'any', 'who', 'what', 'which', 'while', 'still',
        'able', 'well', 'work', 'working', 'role', 'join', 'team', 'company',
        'looking', 'experience', 'years', 'strong', 'good', 'etc', 'including',
        'required', 'preferred', 'plus', 'minimum', 'using', 'used',
    ]);

    // Extract words and multi-word phrases
    const text = jobDescription.toLowerCase();

    // Extract individual meaningful words (3+ chars)
    const words = text
        .replace(/[^a-z0-9\s\+\#\.\/\-]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 3 && !stopWords.has(w));

    // Extract common tech phrases (2-3 word combos)
    const phrases = [];
    const wordArray = text.replace(/[^a-z0-9\s\+\#\.\/\-]/g, ' ').split(/\s+/);
    for (let i = 0; i < wordArray.length - 1; i++) {
        const twoWord = `${wordArray[i]} ${wordArray[i + 1]}`;
        phrases.push(twoWord);
        if (i < wordArray.length - 2) {
            phrases.push(`${twoWord} ${wordArray[i + 2]}`);
        }
    }

    // Combine and deduplicate
    const allKeywords = [...new Set([...words, ...phrases])];

    // Score by frequency and return top keywords
    const freq = {};
    allKeywords.forEach(kw => {
        const count = (text.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
        if (count > 0) freq[kw] = count;
    });

    // Sort by frequency and filter
    return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .map(([kw]) => kw)
        .filter(kw => kw.length >= 3)
        .slice(0, 50); // Top 50 keywords
}

/**
 * Calculate keyword match score (50% weight)
 * @param {string} resumeText - Resume text
 * @param {string[]} keywords - JD keywords
 * @returns {{ score: number, matched: string[], missing: string[] }}
 */
function calculateKeywordScore(resumeText, keywords) {
    const resumeLower = resumeText.toLowerCase();
    const matched = [];
    const missing = [];

    keywords.forEach(keyword => {
        const escapedKw = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (new RegExp(`\\b${escapedKw}\\b`, 'i').test(resumeLower) || resumeLower.includes(keyword)) {
            matched.push(keyword);
        } else {
            missing.push(keyword);
        }
    });

    const score = keywords.length > 0 ? Math.round((matched.length / keywords.length) * 100) : 0;
    return { score, matched, missing };
}

/**
 * Calculate section completeness score (20% weight)
 * @param {string} resumeText - Resume text
 * @returns {{ score: number, weakSections: string[] }}
 */
function calculateSectionScore(resumeText) {
    const resumeLower = resumeText.toLowerCase();
    const foundSections = [];
    const weakSections = [];

    EXPECTED_SECTIONS.forEach(section => {
        const found = section.patterns.some(pattern => resumeLower.includes(pattern));
        if (found) {
            foundSections.push(section.name);
        } else {
            weakSections.push(section.name);
        }
    });

    const score = Math.round((foundSections.length / EXPECTED_SECTIONS.length) * 100);
    return { score, weakSections };
}

/**
 * Calculate formatting compatibility score (20% weight)
 * @param {string} resumeText - Resume text
 * @returns {{ score: number, issues: string[] }}
 */
function calculateFormattingScore(resumeText) {
    const issues = [];
    let penaltyCount = 0;

    FORMATTING_ISSUES_CHECKS.forEach(check => {
        if (check.pattern.test(resumeText)) {
            issues.push(check.issue);
            penaltyCount++;
        }
        // Reset regex lastIndex
        check.pattern.lastIndex = 0;
    });

    // Check for reasonable length
    const wordCount = resumeText.split(/\s+/).length;
    if (wordCount < 100) {
        issues.push('Resume appears too short (less than 100 words)');
        penaltyCount++;
    }
    if (wordCount > 2000) {
        issues.push('Resume appears too long (more than 2000 words)');
        penaltyCount++;
    }

    // Check for bullet points or structured content
    const hasBullets = /[•\-\*\►\→]/.test(resumeText);
    if (!hasBullets) {
        issues.push('No bullet points detected — use bullet points for better readability');
        penaltyCount++;
    }

    const maxPenalties = FORMATTING_ISSUES_CHECKS.length + 3;
    const score = Math.max(0, Math.round(((maxPenalties - penaltyCount) / maxPenalties) * 100));
    return { score, issues };
}

/**
 * Calculate experience relevance score (10% weight)
 * @param {string} resumeText - Resume text
 * @param {string} jobDescription - Job description text
 * @returns {{ score: number }}
 */
function calculateExperienceScore(resumeText, jobDescription) {
    const resumeLower = resumeText.toLowerCase();
    const jdLower = jobDescription.toLowerCase();

    // Extract action verbs and technical terms from JD
    const actionVerbs = [
        'managed', 'developed', 'designed', 'implemented', 'led', 'created',
        'built', 'optimized', 'deployed', 'maintained', 'architected',
        'analyzed', 'delivered', 'improved', 'reduced', 'increased',
        'automated', 'mentored', 'collaborated', 'integrated', 'tested',
    ];

    // Check action verbs in resume
    const verbsUsed = actionVerbs.filter(v => resumeLower.includes(v));
    const verbScore = Math.min(100, (verbsUsed.length / 8) * 100);

    // Check for quantified achievements
    const hasNumbers = /\d+%|\d+\+|\$\d+|\d+ (users|clients|projects|team|members)/i.test(resumeText);
    const quantScore = hasNumbers ? 100 : 30;

    // Check JD-specific terms in experience sections
    const jdWords = jdLower.split(/\s+/).filter(w => w.length > 4);
    const jdInResume = jdWords.filter(w => resumeLower.includes(w));
    const relevanceScore = Math.min(100, Math.round((jdInResume.length / Math.max(jdWords.length, 1)) * 150));

    const score = Math.round((verbScore * 0.3) + (quantScore * 0.3) + (relevanceScore * 0.4));
    return { score: Math.min(100, score) };
}

/**
 * Generate improvement suggestions
 * @param {Object} analysis - All score breakdowns
 * @returns {string[]} Array of suggestions
 */
function generateSuggestions(analysis) {
    const suggestions = [];

    if (analysis.keywordResult.missing.length > 0) {
        const topMissing = analysis.keywordResult.missing.slice(0, 10).join(', ');
        suggestions.push(`Add these missing keywords: ${topMissing}`);
    }

    if (analysis.sectionResult.weakSections.length > 0) {
        suggestions.push(`Add missing sections: ${analysis.sectionResult.weakSections.join(', ')}`);
    }

    analysis.formattingResult.issues.forEach(issue => {
        suggestions.push(`Fix formatting: ${issue}`);
    });

    if (analysis.experienceResult.score < 50) {
        suggestions.push('Add more quantified achievements (numbers, percentages, metrics)');
        suggestions.push('Use strong action verbs (developed, implemented, optimized, etc.)');
    }

    if (suggestions.length === 0) {
        suggestions.push('Resume looks strong! Minor tweaks may still improve your score.');
    }

    return suggestions;
}

/**
 * Main ATS scoring function
 * @param {string} resumeText - Extracted resume text
 * @param {string} jobDescription - Job description text
 * @returns {Object} Complete ATS analysis report
 */
function calculateATSScore(resumeText, jobDescription) {
    // Extract keywords from JD
    const keywords = extractKeywords(jobDescription);

    // Calculate individual scores
    const keywordResult = calculateKeywordScore(resumeText, keywords);
    const sectionResult = calculateSectionScore(resumeText);
    const formattingResult = calculateFormattingScore(resumeText);
    const experienceResult = calculateExperienceScore(resumeText, jobDescription);

    // Calculate final weighted score
    const finalScore = Math.round(
        (0.5 * keywordResult.score) +
        (0.2 * sectionResult.score) +
        (0.2 * formattingResult.score) +
        (0.1 * experienceResult.score)
    );

    // Generate suggestions
    const analysis = { keywordResult, sectionResult, formattingResult, experienceResult };
    const suggestions = generateSuggestions(analysis);

    return {
        score: finalScore,
        breakdown: {
            keywordScore: keywordResult.score,
            sectionScore: sectionResult.score,
            formattingScore: formattingResult.score,
            experienceScore: experienceResult.score,
        },
        matchedKeywords: keywordResult.matched,
        missingKeywords: keywordResult.missing,
        weakSections: sectionResult.weakSections,
        formattingIssues: formattingResult.issues,
        suggestions,
    };
}

module.exports = { calculateATSScore };
