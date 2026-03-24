"use client";

import { Header } from '@/components/Header/Header';
import { Moon, Rocket, Satellite, Star, Telescope, Globe, Gem, CircleDot, Layers, MapPin, Earth, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
    return (
        <>
            <main className="min-h-[90vh] bg-slate-950 text-slate-100 relative overflow-hidden">
                {/* Arrière-plan animé d'icônes Lucide */}
                <div className="pointer-events-none absolute inset-0 z-0">
                    {/* Étoiles et variantes */}
                    <Star className="absolute animate-spin-slow text-yellow-300 opacity-30 left-[10%] top-[15%] w-16 h-16" />
                    <Star className="absolute animate-spin-slow text-yellow-200 opacity-20 left-[15%] top-[30%] w-10 h-10" />
                    <Star className="absolute animate-spin-slow text-yellow-400 opacity-10 left-[80%] top-[60%] w-24 h-24" />
                    <CircleDot className="absolute animate-twinkle text-yellow-100 opacity-20 left-[25%] top-[10%] w-8 h-8" />
                    <CircleDot className="absolute animate-twinkle2 text-cyan-100 opacity-10 left-[60%] top-[20%] w-6 h-6" />
                    {/* Planètes et lunes */}
                    <Moon className="absolute animate-float-moon text-slate-200 opacity-20 left-[60%] top-[70%] w-14 h-14" />
                    <Globe className="absolute animate-float-moon text-blue-300 opacity-10 left-[30%] top-[80%] w-20 h-20" />
                    <Earth className="absolute animate-float-moon text-green-300 opacity-10 left-[80%] top-[80%] w-16 h-16" />
                    {/* Fusées et satellites */}
                    <Rocket className="absolute animate-float-rocket text-cyan-400 opacity-20 left-[70%] top-[30%] w-20 h-20" />
                    <Rocket className="absolute animate-float-rocket2 text-pink-400 opacity-10 left-[50%] top-[10%] w-10 h-10 rotate-45" />
                    <Satellite className="absolute animate-float-satellite text-cyan-200 opacity-20 left-[20%] top-[60%] w-12 h-12" />
                    <Satellite className="absolute animate-float-satellite2 text-indigo-200 opacity-10 left-[90%] top-[40%] w-10 h-10" />
                    {/* Télescopes */}
                    <Telescope className="absolute animate-float-telescope text-indigo-300 opacity-20 left-[80%] top-[10%] w-14 h-14" />
                    <Telescope className="absolute animate-float-telescope2 text-indigo-400 opacity-10 left-[5%] top-[80%] w-10 h-10" />
                    {/* Astéroïdes (détournement de Gem/Layers) */}
                    <Gem className="absolute animate-spin-slow text-fuchsia-300 opacity-10 left-[40%] top-[60%] w-10 h-10" />
                    <Layers className="absolute animate-float-asteroid text-slate-400 opacity-10 left-[55%] top-[50%] w-12 h-12" />
                    {/* Points de repère (MapPin) */}
                    <MapPin className="absolute animate-float-mappin text-cyan-300 opacity-10 left-[35%] top-[25%] w-8 h-8" />
                    {/* Chevrons pour effet de comète */}
                    <ChevronDown className="absolute animate-comet text-white opacity-10 left-[75%] top-[50%] w-16 h-16 rotate-45" />
                </div>
                <Header />
                <div className="flex flex-col items-center justify-center px-4 py-12 relative z-10">
                    <div className='max-w-xl w-full items-center justify-center rounded-lg border border-slate-800 bg-slate-900/30 p-8 text-center'>
                        <h1 className="text-5xl font-bold text-cyan-400 mb-4 text-center">404</h1>
                        <h2 className="text-2xl font-semibold mb-2 text-center">Page non trouvée</h2>
                        <p className="mb-8 text-slate-400 text-center">La page que vous recherchez n'existe pas ou a été déplacée.</p>
                        <Link href="/" className="inline-block px-6 py-3 rounded-md bg-cyan-600 text-white font-medium shadow hover:bg-cyan-500 transition-colors">
                            Retour à l'accueil
                        </Link>
                    </div>
                </div>
            </main>
            {/* Animations personnalisées pour les icônes Lucide */}
            <style jsx global>{`
                @keyframes spin-slow {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 18s linear infinite;
                }
                @keyframes float-rocket {
                    0%, 100% { transform: translateY(0) rotate(-10deg); }
                    50% { transform: translateY(-30px) rotate(10deg); }
                }
                .animate-float-rocket {
                    animation: float-rocket 8s ease-in-out infinite;
                }
                @keyframes float-moon {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-20px) scale(1.1); }
                }
                .animate-float-moon {
                    animation: float-moon 10s ease-in-out infinite;
                }
                @keyframes float-satellite {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(15px) scale(1.08); }
                }
                .animate-float-satellite {
                    animation: float-satellite 12s ease-in-out infinite;
                }
                @keyframes float-telescope {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-18px) rotate(8deg); }
                }
                .animate-float-telescope {
                    animation: float-telescope 14s ease-in-out infinite;
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 0.5; }
                }
                .animate-twinkle {
                    animation: twinkle 3.5s ease-in-out infinite;
                }
                @keyframes twinkle2 {
                    0%, 100% { opacity: 0.1; }
                    50% { opacity: 0.4; }
                }
                .animate-twinkle2 {
                    animation: twinkle2 4.2s ease-in-out infinite;
                }
                @keyframes float-rocket2 {
                    0%, 100% { transform: translateY(0) rotate(45deg); }
                    50% { transform: translateY(-18px) rotate(60deg); }
                }
                .animate-float-rocket2 {
                    animation: float-rocket2 7s ease-in-out infinite;
                }
                @keyframes float-satellite2 {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(10px) scale(1.12); }
                }
                .animate-float-satellite2 {
                    animation: float-satellite2 9s ease-in-out infinite;
                }
                @keyframes float-telescope2 {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(-8deg); }
                }
                .animate-float-telescope2 {
                    animation: float-telescope2 11s ease-in-out infinite;
                }
                @keyframes float-asteroid {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(12px) scale(1.08) rotate(8deg); }
                }
                .animate-float-asteroid {
                    animation: float-asteroid 13s ease-in-out infinite;
                }
                @keyframes float-mappin {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-8px) scale(1.12); }
                }
                .animate-float-mappin {
                    animation: float-mappin 8s ease-in-out infinite;
                }
                @keyframes comet {
                    0% { opacity: 0.1; transform: translateY(0) scale(1) rotate(45deg); }
                    40% { opacity: 0.5; transform: translateY(-40px) scale(1.2) rotate(45deg); }
                    100% { opacity: 0.1; transform: translateY(0) scale(1) rotate(45deg); }
                }
                .animate-comet {
                    animation: comet 10s linear infinite;
                }
            `}</style>
        </>
    );
}
