import React, { useState, useRef, useEffect } from "react";
import type { WorkOrderTimerState } from "@/models/WorkOrder";
import { useTranslation } from "react-i18next";

function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return [h, m, s]
        .map((v) => v.toString().padStart(2, "0"))
        .join(":");
}

interface TimerProps {
    timerState: WorkOrderTimerState;
    updateTimerState: React.Dispatch<React.SetStateAction<WorkOrderTimerState>>;
}

export default function Timer({ timerState, updateTimerState }: TimerProps) {

    const { t } = useTranslation()

    const [remaining, setRemaining] = useState(0);
    const [running, setRunning] = useState(false);
    const [editing, setEditing] = useState(false);
    const [inputH, setInputH] = useState(0);
    const [inputM, setInputM] = useState(0);
    const [inputS, setInputS] = useState(0);
    const [wasStarted, setWasStarted] = useState(false); // For showing the complete text only if started
    const [showTimer, setShowTimer] = useState(true); // For hiding the timer when the complete text is shown
    const [endTimestamp, setEndTimestamp] = useState<number | null>(null);
    const [hasRestoredState, setHasRestoredState] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLDivElement | null>(null);
    const minInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const savedEndTimestamp = typeof timerState?.endTimestamp === "number" ? timerState.endTimestamp : null
        const savedWasStarted = Boolean(timerState?.wasStarted)

        if (savedEndTimestamp) {
            const restoredRemaining = Math.max(0, Math.ceil((savedEndTimestamp - Date.now()) / 1000))

            setEndTimestamp(savedEndTimestamp)
            setRemaining(restoredRemaining)
            setWasStarted(savedWasStarted)

            if (restoredRemaining > 0) {
                setRunning(true)
                setShowTimer(true)
            } else if (savedWasStarted) {
                setRunning(false)
                setShowTimer(false)
            }
        } else if (savedWasStarted) {
            setWasStarted(true)
            setShowTimer(false)
        }

        setHasRestoredState(true)
    }, [])

    useEffect(() => {
        if (!running || !endTimestamp) {
            return () => {
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        }

        const syncRemaining = () => {
            const nextRemaining = Math.max(0, Math.ceil((endTimestamp - Date.now()) / 1000))

            setRemaining(nextRemaining)

            if (nextRemaining === 0) {
                setRunning(false)
                setEndTimestamp(null)
                setTimeout(() => setShowTimer(false), 100)
            }
        }

        syncRemaining()
        intervalRef.current = setInterval(syncRemaining, 1000)

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [endTimestamp, running]);

    useEffect(() => {
        if (!running && intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }, [running]);

    useEffect(() => {
        if (!hasRestoredState) {
            return
        }

        updateTimerState(previousState => {
            if (previousState.endTimestamp === endTimestamp && previousState.wasStarted === wasStarted) {
                return previousState
            }

            return {
                endTimestamp,
                wasStarted
            }
        })
    }, [endTimestamp, hasRestoredState, updateTimerState, wasStarted])

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
        setEditing(false);

        if (total > 0) {
            const nextEndTimestamp = Date.now() + total * 1000

            setRemaining(total);
            setEndTimestamp(nextEndTimestamp)
            setRunning(true);
            setWasStarted(true);
            setShowTimer(true);
        } else {
            setRemaining(0)
            setEndTimestamp(null)
            setRunning(false)
        }
    }

    function handleTimerClick(e: React.MouseEvent) {
        if (running) {
            // Pause and edit remaining time
            setRunning(false);
            setEndTimestamp(null)
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
        setRunning(false)
        setEndTimestamp(null)
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