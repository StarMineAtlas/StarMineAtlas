import { FC, useEffect, useState } from "react";
import { Circle } from "lucide-react";


// Orbit Configuration: distance, size, color, speed
const solarConfig = [
    {
        icon: Circle, // Lucide component
        color: "#fbbf24", // yellow sun
        size: 20,
        distance: 0, // center
        speed: 0, // no rotation
    },
    {
        icon: Circle,
        color: "#da5c5c", // Hurston
        size: 4,
        distance: 22,
        speed: 1, // seconds per orbit
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
        distance: 54,
        speed: 4,
    },
    {
        icon: Circle,
        color: "#7bcbd7", // Microtech
        size: 4,
        distance: 70,
        speed: 6,
    },
];

type LoaderProps = {
    textAnimation?: "dots" | "shimmer"
    loaderText?: string
};

export const Loader: FC<LoaderProps> = ({ textAnimation = "shimmer", loaderText = "Loading data" }) => {
    // To animate the orbits
    // We use Date.now() to avoid SSR/hydration issues
    const now = typeof window !== "undefined" ? Date.now() : 0;
    const [tick, setTick] = useState(now);

    // Dynamic calculation of max radius and padding
    const maxDistance = Math.max(...solarConfig.map(p => p.distance + p.size / 2));
    const padding = 16;
    const svgSize = (maxDistance + padding) * 2;
    const center = svgSize / 2;

    useEffect(() => {
        const interval = setInterval(() => setTick(Date.now()), 16);
        return () => clearInterval(interval);
    }, []);


    // Animation dots
    const [dotStep, setDotStep] = useState(0);
    useEffect(() => {
        if (textAnimation !== "dots") return;
        const interval = setInterval(() => setDotStep(s => (s + 1) % 4), 400);
        return () => clearInterval(interval);
    }, [textAnimation]);

    const baseText = loaderText;
    const animatedText = textAnimation === "dots"
        ? baseText + ".".repeat(dotStep)
        : baseText + "...";

    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-900/30 py-8 w-full mt-8">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 120 }}>
                <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} style={{ display: "block" }}>
                    {/* Orbits */}
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
                            suppressHydrationWarning
                        />
                    ))}
                    {/* Center (Sun) and planets */}
                    {solarConfig.map((obj, i) => {
                        const Icon = obj.icon;
                        if (obj.distance === 0) {
                            // Center
                            return (
                                <g key="center">
                                    <circle cx={center} cy={center} r={obj.size / 2} fill={obj.color} filter="url(#glow)" suppressHydrationWarning />
                                    <Icon x={center - obj.size / 2} y={center - obj.size / 2} width={obj.size} height={obj.size} color="#fff" style={{ position: 'absolute' }} suppressHydrationWarning />
                                </g>
                            );
                        }
                        // Planets
                        // Calculate animated angle with ease-in-out (even smoother)
                        // Uses an easeInOutSine curve for very smooth movement
                        const t = ((tick / 1000) % obj.speed) / obj.speed;
                        // easeInOutSine
                        const easedT = -(Math.cos(Math.PI * t) - 1) / 2;
                        const angle = (easedT * 360) % 360;
                        const rad = (angle * Math.PI) / 180;
                        const x = center + obj.distance * Math.cos(rad);
                        const y = center + obj.distance * Math.sin(rad);
                        return (
                            <g key={"planet-" + i}>
                                <circle cx={x} cy={y} r={obj.size / 2} fill={obj.color} filter="url(#shadow)" suppressHydrationWarning />
                                <Icon x={x - obj.size / 2} y={y - obj.size / 2} width={obj.size} height={obj.size} color="#fff" suppressHydrationWarning />
                            </g>
                        );
                    })}
                    {/* Glow/Shadow effect */}
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
            {textAnimation === "shimmer" ? (
                <span
                    className="text-lg text-slate-400 relative overflow-hidden inline-block"
                    style={{
                        background: "linear-gradient(90deg, #94a3b8 0%, #f1f5f9 50%, #94a3b8 100%)",
                        backgroundSize: "200% 100%",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        animation: "shimmer 1.5s infinite linear"
                    }}
                    suppressHydrationWarning
                >
                    {animatedText}
                </span>
            ) : (
                <span className="text-lg text-slate-400" suppressHydrationWarning>{animatedText}</span>
            )}
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
};
