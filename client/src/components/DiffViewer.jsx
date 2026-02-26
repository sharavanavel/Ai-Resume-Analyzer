import React, { useMemo } from 'react';

/**
 * Side-by-side diff viewer comparing original vs improved resume text.
 * Uses simple line-based diffing.
 * @param {{ original: string, improved: string }} props
 */
export default function DiffViewer({ original = '', improved = '' }) {
    const diff = useMemo(() => {
        const origLines = original.split('\n');
        const impLines = improved.split('\n');
        const results = [];

        const maxLen = Math.max(origLines.length, impLines.length);

        // Simple line-by-line comparison
        let oi = 0, ii = 0;
        while (oi < origLines.length || ii < impLines.length) {
            const origLine = oi < origLines.length ? origLines[oi] : null;
            const impLine = ii < impLines.length ? impLines[ii] : null;

            if (origLine !== null && impLine !== null) {
                if (origLine.trim() === impLine.trim()) {
                    results.push({ type: 'unchanged', origLine, impLine });
                    oi++;
                    ii++;
                } else {
                    // Check if original line exists later in improved (means new lines were added)
                    const foundInImp = impLines.indexOf(origLine, ii);
                    if (foundInImp !== -1 && foundInImp - ii < 5) {
                        while (ii < foundInImp) {
                            results.push({ type: 'added', origLine: '', impLine: impLines[ii] });
                            ii++;
                        }
                    } else {
                        results.push({ type: 'modified', origLine, impLine });
                        oi++;
                        ii++;
                    }
                }
            } else if (origLine !== null) {
                results.push({ type: 'removed', origLine, impLine: '' });
                oi++;
            } else {
                results.push({ type: 'added', origLine: '', impLine });
                ii++;
            }
        }

        return results;
    }, [original, improved]);

    const stats = useMemo(() => {
        const added = diff.filter(d => d.type === 'added').length;
        const removed = diff.filter(d => d.type === 'removed').length;
        const modified = diff.filter(d => d.type === 'modified').length;
        return { added, removed, modified };
    }, [diff]);

    return (
        <div className="space-y-4">
            {/* Stats Bar */}
            <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-green-500/30 border border-green-500" />
                    <span className="text-green-400">{stats.added} added</span>
                </span>
                <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-red-500/30 border border-red-500" />
                    <span className="text-red-400">{stats.removed} removed</span>
                </span>
                <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-yellow-500/30 border border-yellow-500" />
                    <span className="text-yellow-400">{stats.modified} modified</span>
                </span>
            </div>

            {/* Diff Content - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
                {/* Original Column */}
                <div>
                    <div className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                        📄 Original Resume
                    </div>
                    <div className="glass-card p-4 max-h-[600px] overflow-y-auto text-sm font-mono leading-relaxed">
                        {diff.map((line, i) => (
                            <div
                                key={i}
                                className={
                                    line.type === 'removed' ? 'diff-removed' :
                                        line.type === 'modified' ? 'diff-removed' :
                                            line.type === 'added' ? 'opacity-0 h-6' :
                                                'diff-unchanged'
                                }
                            >
                                {line.origLine || '\u00A0'}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Improved Column */}
                <div>
                    <div className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                        ✨ Improved Resume
                    </div>
                    <div className="glass-card p-4 max-h-[600px] overflow-y-auto text-sm font-mono leading-relaxed">
                        {diff.map((line, i) => (
                            <div
                                key={i}
                                className={
                                    line.type === 'added' ? 'diff-added' :
                                        line.type === 'modified' ? 'diff-added' :
                                            line.type === 'removed' ? 'opacity-0 h-6' :
                                                'diff-unchanged'
                                }
                            >
                                {line.impLine || '\u00A0'}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
