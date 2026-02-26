import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const location = useLocation();

    const links = [
        { to: '/', label: 'Analyze', icon: '🔍' },
        { to: '/history', label: 'History', icon: '📋' },
    ];

    return (
        <nav className="glass-card mx-4 mt-4 px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-300 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    📄
                </div>
                <span className="text-xl font-bold gradient-text hidden sm:block">
                    ATS Analyzer Pro
                </span>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-2">
                {links.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${location.pathname === link.to
                                ? 'bg-primary-500/20 text-primary-200 border border-primary-500/30'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <span>{link.icon}</span>
                        <span className="hidden sm:inline">{link.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
