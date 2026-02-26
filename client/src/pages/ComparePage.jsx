import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DiffViewer from '../components/DiffViewer.jsx';

export default function ComparePage() {
    const { reportId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [originalText, setOriginalText] = useState(location.state?.originalText || '');
    const [improvedText, setImprovedText] = useState(location.state?.improvedText || '');
    const [report, setReport] = useState(location.state?.report || null);
    const [loading, setLoading] = useState(!location.state?.improvedText);

    useEffect(() => {
        if (!improvedText) {
            fetchData();
        }
    }, [reportId]);

    const fetchData = async () => {
        try {
            const res = await axios.get(`/api/report/${reportId}`);
            if (res.data.success) {
                const r = res.data.report;
                setReport(r);
                setOriginalText(r.originalText);
                if (r.improvedVersion) {
                    setImprovedText(r.improvedVersion.improvedText);
                }
            }
        } catch (err) {
            console.error('Error fetching comparison data:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Generate and download the improved resume as a properly formatted PDF
     */
    const handleDownloadPDF = () => {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const marginLeft = 20;
            const marginRight = 20;
            const marginTop = 25;
            const marginBottom = 20;
            const maxWidth = pageWidth - marginLeft - marginRight;
            let currentY = marginTop;

            // Split text into lines
            const lines = improvedText.split('\n');

            lines.forEach((line) => {
                const trimmed = line.trim();

                // Detect section headers (ALL CAPS lines or lines ending with :)
                const isHeader = /^[A-Z][A-Z\s&\/\-]{2,}$/.test(trimmed) ||
                    /^[A-Z][A-Z\s&\/\-]{2,}:$/.test(trimmed);

                // Detect sub-headers (like company names, roles)
                const isSubHeader = /^[A-Z]/.test(trimmed) && trimmed.length < 60 && !trimmed.startsWith('-') && !trimmed.startsWith('•');

                // Set font styles based on line type
                if (isHeader) {
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(13);
                    doc.setTextColor(30, 30, 120);
                    currentY += 3; // Extra space before headers
                } else if (isSubHeader && trimmed.length > 3) {
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(10.5);
                    doc.setTextColor(40, 40, 40);
                } else {
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10);
                    doc.setTextColor(50, 50, 50);
                }

                // Handle bullet points
                let textLine = trimmed;
                let indent = 0;
                if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
                    textLine = '•  ' + trimmed.substring(2);
                    indent = 3;
                }

                // Empty line = spacing
                if (trimmed === '') {
                    currentY += 3;
                    return;
                }

                // Word wrap
                const wrappedLines = doc.splitTextToSize(textLine, maxWidth - indent);

                // Check if we need a new page
                const lineHeight = doc.getTextDimensions('A').h * 1.6;
                const blockHeight = wrappedLines.length * lineHeight;

                if (currentY + blockHeight > pageHeight - marginBottom) {
                    doc.addPage();
                    currentY = marginTop;
                }

                // Draw text
                wrappedLines.forEach((wLine) => {
                    doc.text(wLine, marginLeft + indent, currentY);
                    currentY += lineHeight;
                });

                // Add line under headers
                if (isHeader) {
                    doc.setDrawColor(100, 100, 200);
                    doc.setLineWidth(0.3);
                    doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
                    currentY += 3;
                }
            });

            // Add page numbers
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(
                    `Page ${i} of ${totalPages}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: 'center' }
                );
            }

            // Download
            const fileName = report?.fileName?.replace(/\.[^.]+$/, '') || 'resume';
            doc.save(`${fileName}_ATS_Optimized.pdf`);
        } catch (err) {
            console.error('PDF generation error:', err);
            alert('PDF generation failed. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black gradient-text">Side-by-Side Comparison</h1>
                <p className="text-gray-400">
                    Original vs AI-Optimized Resume — Changes highlighted
                </p>
            </div>

            {/* Score Badge */}
            {report && (
                <div className="text-center">
                    <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass-card text-sm">
                        <span className="text-primary-300 font-bold">ATS Score:</span>
                        <span className="text-2xl font-black text-white">{report.score}</span>
                        <span className="text-gray-400">/100</span>
                    </span>
                </div>
            )}

            {/* Diff Viewer */}
            {improvedText ? (
                <DiffViewer original={originalText} improved={improvedText} />
            ) : (
                <div className="glass-card p-12 text-center">
                    <span className="text-5xl mb-4 block">⏳</span>
                    <p className="text-gray-400">No AI-optimized version available yet.</p>
                    <button
                        onClick={() => navigate(`/results/${reportId}`)}
                        className="mt-6 btn-primary px-8 py-3 rounded-xl text-white font-semibold"
                    >
                        Go to Results → Optimize
                    </button>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
                {improvedText && (
                    <button
                        onClick={handleDownloadPDF}
                        className="btn-primary flex-1 py-4 rounded-xl text-white font-bold text-lg hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
                    >
                        📄 Download as PDF
                    </button>
                )}
                <button
                    onClick={() => navigate('/')}
                    className="flex-1 py-4 rounded-xl font-bold text-lg border border-primary-500/30 text-primary-200 hover:bg-primary-500/10 transition-all"
                >
                    🔄 Analyze Another Resume
                </button>
            </div>
        </div>
    );
}
