"use client"

import { Header } from "@/components/Header";

export default function MiningLasersPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-cyan-50">
            <Header />
            <main className="max-w-4xl mx-auto py-12 px-4">
                <h1 className="text-3xl font-bold mb-4 text-cyan-400">Mining Lasers</h1>
                <p className="text-slate-300 mb-8">Explore the different mining lasers available in the verse. More details coming soon.</p>
            </main>
        </div>
    );
}
