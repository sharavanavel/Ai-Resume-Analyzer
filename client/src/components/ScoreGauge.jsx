import React from 'react';

/**
 * Animated radial score gauge with gradient ring.
 * @param {{ score: number, size?: number, label?: string }} props
 */
export default function ScoreGauge({ score = 0, size = 200, label = 'ATS Score' }) {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    // Color based on score
    const getColor = () => {
        if (score >= 80) return { stroke: '#00b894', text: 'text-green-400', bg: 'bg-green-500/10' };
        if (score >= 60) return { stroke: '#fdcb6e', text: 'text-yellow-400', bg: 'bg-yellow-500/10' };
        if (score >= 40) return { stroke: '#e17055', text: 'text-orange-400', bg: 'bg-orange-500/10' };
        return { stroke: '#fd79a8', text: 'text-red-400', bg: 'bg-red-500/10' };
    };

    const color = getColor();

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    className="transform -rotate-90"
                >
                    {/* Background ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(108, 92, 231, 0.15)"
                        strokeWidth="12"
                    />
                    {/* Score ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color.stroke}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="score-ring"
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-5xl font-black ${color.text}`}>
                        {score}
                    </span>
                    <span className="text-sm text-gray-400 mt-1">{label}</span>
                </div>
            </div>

            {/* Status badge */}
            <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${color.bg} ${color.text}`}>
                {score >= 80 ? '🎯 Excellent' : score >= 60 ? '⚡ Good' : score >= 40 ? '⚠️ Needs Work' : '🔴 Poor'}
            </div>
        </div>
    );
}
