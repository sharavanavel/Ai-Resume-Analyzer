/**
 * AI Resume Optimizer
 * Uses Groq API (LLaMA model) to optimize resumes based on ATS analysis.
 */
const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Build the optimization prompt for the AI
 * @param {string} resumeText - Original resume text
 * @param {string} jobDescription - Target job description
 * @param {string[]} missingKeywords - Keywords to add
 * @param {string[]} suggestions - Improvement suggestions
 * @returns {string} AI prompt
 */
function buildPrompt(resumeText, jobDescription, missingKeywords, suggestions) {
    return `You are an expert ATS Resume Optimizer. Your task is to improve the following resume to maximize its ATS (Applicant Tracking System) compatibility score for the given job description.

## RULES:
1. Add the missing keywords NATURALLY into relevant sections — do NOT list them randomly
2. Improve bullet points with strong action verbs and quantified achievements
3. Ensure all important sections exist: Summary, Experience, Skills, Education, Projects
4. Keep the resume ATS-friendly: NO tables, NO graphics, NO columns
5. Use a clean, professional format with clear section headers
6. Maintain truthful content — enhance wording but do NOT fabricate experience
7. Keep the resume concise (ideally 1-2 pages worth of text)
8. Use consistent formatting throughout

## JOB DESCRIPTION:
${jobDescription}

## MISSING KEYWORDS TO INCORPORATE:
${missingKeywords.slice(0, 20).join(', ')}

## IMPROVEMENT SUGGESTIONS:
${suggestions.join('\n')}

## ORIGINAL RESUME:
${resumeText}

## INSTRUCTIONS:
Return ONLY the improved resume text. Do not include any explanations, comments, or metadata. Start directly with the resume content. Use plain text format with clear section headers in UPPERCASE.`;
}

/**
 * Optimize resume using AI
 * @param {string} resumeText - Original resume text
 * @param {string} jobDescription - Target job description
 * @param {string[]} missingKeywords - Keywords missing from resume
 * @param {string[]} suggestions - Improvement suggestions from ATS analysis
 * @returns {Promise<string>} Optimized resume text
 */
async function optimizeResume(resumeText, jobDescription, missingKeywords, suggestions) {
    const prompt = buildPrompt(resumeText, jobDescription, missingKeywords, suggestions);

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional resume writer and ATS optimization expert. You optimize resumes to score higher on Applicant Tracking Systems while keeping the content truthful and professional.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 4096,
            top_p: 0.9,
        });

        const improvedText = chatCompletion.choices[0]?.message?.content;

        if (!improvedText) {
            throw new Error('AI returned empty response');
        }

        return improvedText.trim();
    } catch (error) {
        console.error('AI Optimization Error:', error.message);
        throw new Error(`AI optimization failed: ${error.message}`);
    }
}

module.exports = { optimizeResume };
