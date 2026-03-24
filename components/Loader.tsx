import { FC, useEffect, useState } from "react";
import { Circle } from "lucide-react";


// Configuration des planètes et du centre
const solarConfig = [
    {
        icon: Circle, // composant Lucide
        color: "#fbbf24", // jaune soleil
        size: 20,
        distance: 0, // centre
        speed: 0, // pas de rotation
    },
    {
        icon: Circle,
        color: "#da5c5c", // Hurston
        size: 4,
        distance: 28,
        speed: 1, // secondes pour un tour
    },
    {
        icon: Circle,
        color: "#fe6bb7", // Crusader
        size: 10,
        distance: 40,
        speed: 2,
    },
    {
        icon: Circle,
        color: "#639764", // ArcCorp
        size: 6,
        distance: 56,
        speed: 4,
    },
    {
        icon: Circle,
        color: "#7bcbd7", // Microtech
        size: 4,
        distance: 80,
        speed: 6,
    },
];


export const Loader: FC = () => {
    // Pour animer les orbites
    // On utilise Date.now() pour éviter les problèmes de SSR/hydratation
    const now = typeof window !== "undefined" ? Date.now() : 0;
    const [tick, setTick] = useState(now);

    // Calcul dynamique du rayon max et padding
    const maxDistance = Math.max(...solarConfig.map(p => p.distance + p.size / 2));
    const padding = 16;
    const svgSize = (maxDistance + padding) * 2;
    const center = svgSize / 2;

    useEffect(() => {
        const interval = setInterval(() => setTick(Date.now()), 16);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 120 }}>
            <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} style={{ display: "block" }}>
                {/* Orbites */}
                {solarConfig.filter(p => p.distance > 0).map((planet, i) => (
                    <circle
                        key={"orbit-" + i}
                        cx={center}
                        cy={center}
                        r={planet.distance}
                        fill="none"
                        stroke="#334155"
                        strokeDasharray="2 3"
                        strokeWidth={0.7}
                    />
                ))}
                {/* Centre (Soleil) et planètes */}
                {solarConfig.map((obj, i) => {
                    const Icon = obj.icon;
                    if (obj.distance === 0) {
                        // Centre
                        return (
                            <g key="center">
                                <circle cx={center} cy={center} r={obj.size / 2} fill={obj.color} filter="url(#glow)" />
                                <Icon x={center - obj.size / 2} y={center - obj.size / 2} width={obj.size} height={obj.size} color="#fff" style={{ position: 'absolute' }} />
                            </g>
                        );
                    }
                    // Planètes
                    // Calcul de l'angle animé avec ease-in-out
                    // Utilise une courbe easeInOutCubic pour un mouvement plus naturel
                    const t = ((tick / 1000) % obj.speed) / obj.speed;
                    // easeInOutCubic
                    const easedT = t < 0.5
                        ? 4 * t * t * t
                        : 1 - Math.pow(-2 * t + 2, 3) / 2;
                    const angle = (easedT * 360) % 360;
                    const rad = (angle * Math.PI) / 180;
                    const x = center + obj.distance * Math.cos(rad);
                    const y = center + obj.distance * Math.sin(rad);
                    return (
                        <g key={"planet-" + i}>
                            <circle cx={x} cy={y} r={obj.size / 2} fill={obj.color} filter="url(#shadow)" />
                            <Icon x={x - obj.size / 2} y={y - obj.size / 2} width={obj.size} height={obj.size} color="#fff" />
                        </g>
                    );
                })}
                {/* Effet glow/ombre */}
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#000" floodOpacity="0.3" />
                    </filter>
                </defs>
            </svg>
        </div>
    );
};
