import React from 'react';

/**
 * Keyword badges showing matched (green) and missing (red) keywords.
 * @param {{ matched: string[], missing: string[] }} props
 */
export default function KeywordBadges({ matched = [], missing = [] }) {
    return (
        <div className="space-y-6">
            {/* Matched Keywords */}
            <div>
                <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    Matched Keywords ({matched.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                    {matched.slice(0, 30).map((kw, i) => (
                        <span key={i} className="keyword-matched px-3 py-1 rounded-full text-xs font-medium">
                            ✓ {kw}
                        </span>
                    ))}
                    {matched.length === 0 && (
                        <span className="text-gray-500 text-sm">No keywords matched</span>
                    )}
                </div>
            </div>

            {/* Missing Keywords */}
            <div>
                <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    Missing Keywords ({missing.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                    {missing.slice(0, 30).map((kw, i) => (
                        <span key={i} className="keyword-missing px-3 py-1 rounded-full text-xs font-medium">
                            ✗ {kw}
                        </span>
                    ))}
                    {missing.length === 0 && (
                        <span className="text-gray-500 text-sm">All keywords covered! 🎉</span>
                    )}
                </div>
            </div>
        </div>
    );
}
