import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return [h, m, s]
        .map((v) => v.toString().padStart(2, "0"))
        .join(":");
}

export default function Timer() {

    const { t } = useTranslation()

    const [remaining, setRemaining] = useState(0);
    const [running, setRunning] = useState(false);
    const [editing, setEditing] = useState(false);
    const [inputH, setInputH] = useState(0);
    const [inputM, setInputM] = useState(0);
    const [inputS, setInputS] = useState(0);
    const [wasStarted, setWasStarted] = useState(false); // For showing the complete text only if started
    const [showTimer, setShowTimer] = useState(true); // For hiding the timer when the complete text is shown
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLDivElement | null>(null);
    const minInputRef = useRef<HTMLInputElement | null>(null);

    // Countdown management
    useEffect(() => {
        if (running && remaining > 0) {
            intervalRef.current = setInterval(() => {
                setRemaining((prev) => {
                    if (prev <= 1) {
                        setRunning(false);
                        setTimeout(() => setShowTimer(false), 100); // hide the timer to show COMPLETE
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [running]);

    useEffect(() => {
        if (!running && intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }, [running]);

    // Click outside to validate
    useEffect(() => {
        if (!editing) return;
        function handleClickOutside(e: MouseEvent) {
            if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
                startTimerFromInputs();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [editing, inputH, inputM, inputS]);

    // Focus minutes input when editing
    useEffect(() => {
        if (editing && minInputRef.current) {
            minInputRef.current.focus();
        }
    }, [editing]);

    // Handle Enter key
    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter") {
            startTimerFromInputs();
        }
    }

    function startTimerFromInputs() {
        const total = inputH * 3600 + inputM * 60 + inputS;
        setRemaining(total);
        setRunning(true);
        setEditing(false);
        if (total > 0) {
            setWasStarted(true);
            setShowTimer(true);
        }
    }

    function handleTimerClick(e: React.MouseEvent) {
        if (running) {
            // Pause and edit remaining time
            setRunning(false);
            // Fill inputs with remaining time
            const h = Math.floor(remaining / 3600);
            const m = Math.floor((remaining % 3600) / 60);
            const s = remaining % 60;
            setInputH(h);
            setInputM(m);
            setInputS(s);
            setEditing(true);
        } else {
            setEditing(true);
        }
    }

    function handleCompleteClick() {
        setShowTimer(true);
        setEditing(true);
        setInputH(0);
        setInputM(0);
        setInputS(0);
        setWasStarted(false);
        setRemaining(0);
    }

    // Show timer
    return (
        <div
            className="text-2xl text-center w-full py-2 font-mono select-none border-t border-slate-800"
            title={running ? "Timer en cours" : "Cliquez pour configurer"}
        >
            {wasStarted && remaining === 0 && !editing && !showTimer ? (
                <>
                    <span
                        onClick={handleCompleteClick}
                        className="text-cyan-400 font-bold cursor-pointer animate-glow"
                        style={{ animation: "glow 1.2s ease-in-out infinite alternate" }}
                    >
                        COMPLETE
                    </span>
                    <style>{`
                        @keyframes glow {
                            from {
                                text-shadow: 0 0 0px #22d3ee, 0 0 0px #fff;
                            }
                            to {
                                text-shadow: 0 0 16px #22d3ee, 0 0 8px #fff;
                            }
                        }
                    `}</style>
                </>
            ) : showTimer && (
                editing ? (
                    <div
                        ref={inputRef}
                        className="flex gap-1 justify-center items-center"
                        tabIndex={-1}
                        onKeyDown={handleKeyDown}
                    >
                        <input
                            type="number"
                            min={0}
                            max={99}
                            value={inputH}
                            onChange={e => setInputH(Math.max(0, Math.min(99, Number(e.target.value))))}
                            className="w-10 text-right"
                        />
                        :
                        <input
                            type="number"
                            min={0}
                            max={59}
                            value={inputM}
                            onChange={e => setInputM(Math.max(0, Math.min(59, Number(e.target.value))))}
                            className="w-10 text-right"
                            ref={minInputRef}
                        />
                        :
                        <input
                            type="number"
                            min={0}
                            max={59}
                            value={inputS}
                            onChange={e => setInputS(Math.max(0, Math.min(59, Number(e.target.value))))}
                            className="w-10 text-right"
                        />
                    </div>
                ) : (
                    <span onClick={handleTimerClick} className={running ? "cursor-not-allowed" : "cursor-pointer"}>
                        {formatTime(remaining)}
                    </span>
                )
            )}
        </div>
    );
}