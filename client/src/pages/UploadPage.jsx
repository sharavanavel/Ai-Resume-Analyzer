import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function UploadPage() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Dropzone config
    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        if (rejectedFiles.length > 0) {
            setError('Only PDF and DOCX files are allowed (max 5MB)');
            return;
        }
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setError('');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxSize: 5 * 1024 * 1024,
        maxFiles: 1,
    });

    // Submit for analysis
    const handleAnalyze = async () => {
        if (!file) {
            setError('Please upload a resume file');
            return;
        }
        if (jobDescription.trim().length < 20) {
            setError('Please enter a job description (at least 20 characters)');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('resume', file);
            formData.append('jobDescription', jobDescription);

            const response = await axios.post('/api/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                // Navigate to results page
                navigate(`/results/${response.data.report._id}`, {
                    state: { report: response.data.report },
                });
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-300 text-4xl mb-4 animate-pulse-glow">
                    🎯
                </div>
                <h1 className="text-4xl font-black gradient-text">ATS Resume Analyzer</h1>
                <p className="text-gray-400 text-lg max-w-xl mx-auto">
                    Upload your resume and paste the job description to get an instant ATS compatibility score with AI-powered optimization
                </p>
            </div>

            {/* Upload Section */}
            <div className="glass-card p-8 animate-slide-up">
                <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-300 flex items-center justify-center text-sm font-bold">1</span>
                    <h2 className="text-lg font-semibold">Upload Resume</h2>
                </div>
                <p className="text-gray-400 text-sm mb-6 ml-11">PDF or DOCX file (max 5MB)</p>

                {!file ? (
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragActive
                                ? 'border-primary-400 bg-primary-500/10 scale-[1.01]'
                                : 'border-primary-500/20 hover:border-primary-400/50 hover:bg-primary-500/5'
                            }`}
                    >
                        <input {...getInputProps()} />
                        <div className="text-5xl mb-4">📁</div>
                        <p className="text-white font-medium mb-2">
                            {isDragActive ? 'Drop your resume here...' : 'Drag & drop your resume here'}
                        </p>
                        <p className="text-gray-500 text-sm">or click to browse files</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                        <span className="text-3xl">📊</span>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-sm text-gray-400">
                                {(file.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                            className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>

            {/* Job Description */}
            <div className="glass-card p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-teal to-primary-500 flex items-center justify-center text-sm font-bold">2</span>
                    <h2 className="text-lg font-semibold">Paste Job Description</h2>
                </div>
                <p className="text-gray-400 text-sm mb-6 ml-11">Copy the full job description from the listing</p>

                <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the complete job description here...&#10;&#10;Example:&#10;We are looking for a Senior React Developer with 3+ years of experience in..."
                    rows={8}
                    className="w-full bg-dark-800 border border-primary-500/20 rounded-xl p-4 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all text-sm leading-relaxed"
                />
                <div className="text-right mt-2">
                    <span className={`text-xs ${jobDescription.length < 20 ? 'text-gray-600' : 'text-green-400'}`}>
                        {jobDescription.length} characters
                    </span>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm animate-slide-up">
                    ❌ {error}
                </div>
            )}

            {/* Analyze Button */}
            <button
                onClick={handleAnalyze}
                disabled={loading || !file || jobDescription.length < 20}
                className="btn-primary w-full py-4 rounded-xl text-white font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-primary-500/20"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-3">
                        <span className="spinner !w-5 !h-5 !border-2" />
                        Analyzing Resume...
                    </span>
                ) : (
                    '🚀 Analyze Resume'
                )}
            </button>
        </div>
    );
}
