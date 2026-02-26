/**
 * Text Extraction Utility
 * Extracts and cleans text from PDF and DOCX files.
 */
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} Extracted text
 */
async function extractFromPDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return cleanText(data.text);
}

/**
 * Extract text from a DOCX file
 * @param {string} filePath - Path to the DOCX file
 * @returns {Promise<string>} Extracted text
 */
async function extractFromDOCX(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return cleanText(result.value);
}

/**
 * Clean and normalize extracted text
 * @param {string} text - Raw text
 * @returns {string} Cleaned text
 */
function cleanText(text) {
    return text
        .replace(/\r\n/g, '\n')           // Normalize line endings
        .replace(/\t/g, ' ')               // Replace tabs with spaces
        .replace(/ {2,}/g, ' ')            // Collapse multiple spaces
        .replace(/\n{3,}/g, '\n\n')        // Max 2 consecutive newlines
        .trim();
}

/**
 * Extract text based on file type
 * @param {string} filePath - Path to file
 * @param {string} fileType - 'pdf' or 'docx'
 * @returns {Promise<string>} Extracted text
 */
async function extractText(filePath, fileType) {
    if (fileType === 'pdf') {
        return extractFromPDF(filePath);
    } else if (fileType === 'docx') {
        return extractFromDOCX(filePath);
    } else {
        throw new Error(`Unsupported file type: ${fileType}`);
    }
}

module.exports = { extractText, cleanText };
