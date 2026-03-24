import React from 'react';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const startYear = 2026;

    const displayYear = currentYear > startYear ? `${startYear} - ${currentYear}` : `${startYear}`;
    return (
        <footer className="w-full border-t border-cyan-900/50 bg-slate-900 backdrop-blur-md py-8 flex flex-col items-center justify-center gap-2">
            <span className="text-xs text-center text-slate-400 tracking-wide select-none">
                Copyright © {displayYear} <span className="text-cyan-400 font-semibold">Star Mine Atlas</span>
            </span>
            <span className="text-xs text-center text-slate-400 tracking-wide select-none">
                Developped by <span className="text-cyan-400 font-semibold">DorianMB</span>
            </span>
        </footer>
    );
}
