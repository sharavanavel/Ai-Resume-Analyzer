import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ScoreGauge from '../components/ScoreGauge.jsx';
import KeywordBadges from '../components/KeywordBadges.jsx';

const CHART_COLORS = ['#6c5ce7', '#00cec9', '#fdcb6e', '#fd79a8'];

export default function ResultsPage() {
    const { reportId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [report, setReport] = useState(location.state?.report || null);
    const [optimizing, setOptimizing] = useState(false);
    const [error, setError] = useState('');

    // Fetch report if not passed via state
    useEffect(() => {
        if (!report) {
            fetchReport();
        }
    }, [reportId]);

    const fetchReport = async () => {
        try {
            const res = await axios.get(`/api/report/${reportId}`);
            if (res.data.success) {
                setReport(res.data.report);
            }
        } catch (err) {
            setError('Failed to load report');
        }
    };

    // AI Optimization
    const handleOptimize = async () => {
        setOptimizing(true);
        setError('');
        try {
            const res = await axios.post('/api/optimize', { reportId: report._id });
            if (res.data.success) {
                navigate(`/compare/${report._id}`, {
                    state: {
                        originalText: report.originalText,
                        improvedText: res.data.improvedVersion.improvedText,
                        report,
                    },
                });
            }
        } catch (err) {
            setError(err.response?.data?.error || 'AI optimization failed');
        } finally {
            setOptimizing(false);
        }
    };

    if (!report) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="spinner" />
            </div>
        );
    }

    // Chart data
    const chartData = [
        { name: 'Keywords', score: report.breakdown.keywordScore, weight: '50%' },
        { name: 'Sections', score: report.breakdown.sectionScore, weight: '20%' },
        { name: 'Formatting', score: report.breakdown.formattingScore, weight: '20%' },
        { name: 'Experience', score: report.breakdown.experienceScore, weight: '10%' },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black gradient-text">Analysis Results</h1>
                <p className="text-gray-400">{report.fileName}</p>
            </div>

            {/* Main Score + Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score Gauge */}
                <div className="glass-card p-8 flex flex-col items-center justify-center">
                    <ScoreGauge score={report.score} size={220} />
                </div>

                {/* Score Breakdown Chart */}
                <div className="glass-card p-8">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        📊 Score Breakdown
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData} layout="vertical" barCategoryGap="20%">
                            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#a0a0cc', fontSize: 12 }} axisLine={false} />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={90}
                                tick={{ fill: '#f0f0ff', fontSize: 13, fontWeight: 500 }}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: '#1a1a3e',
                                    border: '1px solid rgba(108,92,231,0.3)',
                                    borderRadius: '12px',
                                    color: '#f0f0ff',
                                }}
                                formatter={(value, name, props) => [`${value}/100 (weight: ${props.payload.weight})`, 'Score']}
                            />
                            <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={24}>
                                {chartData.map((entry, i) => (
                                    <Cell key={i} fill={CHART_COLORS[i]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Keywords */}
            <div className="glass-card p-8">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    🔑 Keyword Analysis
                </h3>
                <KeywordBadges
                    matched={report.matchedKeywords}
                    missing={report.missingKeywords}
                />
            </div>

            {/* Issues & Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weak Sections & Formatting Issues */}
                <div className="glass-card p-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        ⚠️ Issues Found
                    </h3>
                    <div className="space-y-3">
                        {report.weakSections?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-yellow-400 mb-2">Missing Sections</h4>
                                {report.weakSections.map((s, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-gray-300 py-1">
                                        <span className="text-yellow-400">◈</span> {s}
                                    </div>
                                ))}
                            </div>
                        )}
                        {report.formattingIssues?.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-orange-400 mb-2">Formatting Issues</h4>
                                {report.formattingIssues.map((issue, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-gray-300 py-1">
                                        <span className="text-orange-400">◈</span> {issue}
                                    </div>
                                ))}
                            </div>
                        )}
                        {(!report.weakSections?.length && !report.formattingIssues?.length) && (
                            <p className="text-green-400 text-sm">✅ No major issues found!</p>
                        )}
                    </div>
                </div>

                {/* Suggestions */}
                <div className="glass-card p-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        💡 Improvement Suggestions
                    </h3>
                    <div className="space-y-3">
                        {report.suggestions?.map((sug, i) => (
                            <div key={i} className="flex gap-3 text-sm text-gray-300 py-2 border-b border-white/5 last:border-0">
                                <span className="text-primary-300 font-bold mt-0.5">{i + 1}.</span>
                                <span>{sug}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm">
                    ❌ {error}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleOptimize}
                    disabled={optimizing}
                    className="btn-primary flex-1 py-4 rounded-xl text-white font-bold text-lg disabled:opacity-40 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-primary-500/20"
                >
                    {optimizing ? (
                        <span className="flex items-center justify-center gap-3">
                            <span className="spinner !w-5 !h-5 !border-2" />
                            AI is Optimizing...
                        </span>
                    ) : (
                        '✨ Optimize with AI'
                    )}
                </button>

                <button
                    onClick={() => navigate('/')}
                    className="flex-1 py-4 rounded-xl font-bold text-lg border border-primary-500/30 text-primary-200 hover:bg-primary-500/10 transition-all"
                >
                    🔄 Analyze Another
                </button>
            </div>
        </div>
    );
}
