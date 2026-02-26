import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function HistoryPage() {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('/api/history');
            if (res.data.success) {
                setReports(res.data.reports);
            }
        } catch (err) {
            setError('Failed to load history. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-400 bg-green-500/10 border-green-500/30';
        if (score >= 60) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
        if (score >= 40) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
        return 'text-red-400 bg-red-500/10 border-red-500/30';
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black gradient-text">Analysis History</h1>
                <p className="text-gray-400">Your past resume analyses</p>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm">
                    ❌ {error}
                </div>
            )}

            {/* Empty State */}
            {reports.length === 0 && !error && (
                <div className="glass-card p-12 text-center">
                    <span className="text-5xl mb-4 block">📋</span>
                    <p className="text-gray-400 mb-6">No analyses yet. Upload a resume to get started!</p>
                    <button
                        onClick={() => navigate('/')}
                        className="btn-primary px-8 py-3 rounded-xl text-white font-semibold"
                    >
                        🚀 Analyze Resume
                    </button>
                </div>
            )}

            {/* History List */}
            <div className="space-y-3">
                {reports.map((report, i) => (
                    <div
                        key={report._id}
                        onClick={() => navigate(`/results/${report._id}`)}
                        className="glass-card p-5 flex items-center gap-4 cursor-pointer hover:bg-dark-600/50 hover:scale-[1.01] transition-all animate-slide-up"
                        style={{ animationDelay: `${i * 0.05}s` }}
                    >
                        {/* Index */}
                        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-300 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {i + 1}
                        </span>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{report.fileName}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(report.createdAt)}</p>
                        </div>

                        {/* Score */}
                        <div className={`px-4 py-2 rounded-xl border font-bold text-lg ${getScoreColor(report.score)}`}>
                            {report.score}
                        </div>

                        {/* Arrow */}
                        <span className="text-gray-500 text-xl">→</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
