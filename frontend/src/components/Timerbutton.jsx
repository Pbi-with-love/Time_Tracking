import React, { useContext, useEffect } from 'react'
import { Pause, Play } from 'lucide-react'
import { useState } from 'react'
import { createTimestamps, getTimestampById, getTimestampByTaskId } from '../api/Timestamps'
import { TasksAndTagsContext } from '../context/TasksAndTagsContext'
import { SettingsContext } from '../context/SettingsContext'
import { useRef } from "react";

const Timerbutton = ({ id, colors, activeTimers, setActiveTimers, toggleStartStop, setToggleStartStop }) => {

    const { setTimestamps, fetchData } = useContext(TasksAndTagsContext);

    const { alternative } = useContext(SettingsContext);

    // Prevent boucing
    const lastToggleTimeRef = useRef({});
    useEffect(() => {
        const checkActiveTimer = async () => {
            try {
                const taskTimestamps = await getTimestampByTaskId(id);
                taskTimestamps.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                let startTime = null;
                let running = false;

                taskTimestamps.forEach(ts => {
                    if (ts.type === "start") {
                        startTime = new Date(ts.timestamp);
                        running = true;
                    } else if (ts.type === "end" && startTime) {
                        startTime = null;
                        running = false;
                    }
                });

                setActiveTimers(prev => ({
                    ...prev,
                    [id]: {
                        running,
                        startTime: running ? Date.now() : null
                    }
                }));
            } catch (error) {
                console.error(error);
            }
        }

        checkActiveTimer();
    }, []);

    const toggleTimer = async (id) => {
        const now = Date.now();
        const lastTime = lastToggleTimeRef.current[id] || 0;

        if (now - lastTime < 200) {
            return;
        }

        lastToggleTimeRef.current[id] = now;
        setToggleStartStop(!toggleStartStop);
        const prevTimer = activeTimers[id] || { running: false, startTime: null };
        const isRunning = !prevTimer.running;

        try {
            // if (isRunning && alternative) {
            //     for (const [tid, t] of Object.entries(activeTimers)) {
            //         console.log(tid, t)
            //         if (tid !== String(id) && t.running) {
            //             const stopTsData = await createTimestamps(tid, "end");
            //             setTimestamps(prev => [...prev, stopTsData]);
            //         }
            //     }
            //     setActiveTimers(prev => {
            //         const newState = Object.fromEntries(
            //             Object.entries(prev).map(([tid, t]) => [tid, { ...t, running: tid === String(id) ? true : false }])
            //         );
            //         console.log(newState);
            //         return newState;
            //     });
            // }


            const newTs = await createTimestamps(id, isRunning ? "start" : "end");

            setTimestamps(prev => [...prev, newTs]);
            setActiveTimers(prev => ({
                ...prev,
                [id]: {
                    running: isRunning,
                    startTime: isRunning ? Date.now() : null
                }
            }));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <button
            type='button'
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => toggleTimer(id)}
            className="relative group w-35 h-35 lg:w-30 lg:h-30 xs:w-27 xs:h-27 cursor-pointer"
        >
            {/* Outer rotating ring */}
            {activeTimers[id]?.running && (
                <>
                    <div className="absolute inset-0 w-35 h-35 lg:w-30 lg:h-30 xs:w-27 xs:h-27 animate-spin">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 blur-md opacity-60"></div>
                    </div>
                    <div className="absolute inset-0 w-35 h-35 lg:w-30 lg:h-30 xs:w-27 xs:h-27 animate-ping">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 opacity-30"></div>
                    </div>
                </>
            )}

            {/* Pulsing glow effect */}
            <div className={`absolute inset-0 ${colors.glow} rounded-full blur-xl transition-all duration-500 ${activeTimers[id]?.running
                ? 'opacity-50 animate-pulse scale-110'
                : 'opacity-20 group-hover:opacity-40 group-hover:scale-105'
                }`}>
            </div>

            {/* Main button with smooth transitions */}
            <div className={`relative w-35 h-35 lg:w-30 lg:h-30 xs:w-27 xs:h-27 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ease-out ${activeTimers[id]?.running
                ? `bg-gradient-to-br ${colors.button} scale-105`
                : `${colors.buttonInactive} group-hover:scale-105`
                }`}>
                {/* Inner glow when active */}
                {activeTimers[id]?.running && (
                    <div className="absolute inset-2 rounded-full bg-white/20 blur-sm"></div>
                )}

                {/* Icon with smooth transition */}
                <div className="relative transition-transform duration-200 ease-out group-hover:scale-110">
                    {activeTimers[id]?.running ? (
                        <Pause className="w-8 h-8 xs:w-8 xs:h-8 text-neutral-900 transition-all duration-200" fill="currentColor" />
                    ) : (
                        <Play className="w-8 h-8 xs:w-8 xs:h-8 text-white ml-1 transition-all duration-200" fill="currentColor" />
                    )}
                </div>
            </div>
        </button>
    )
}

export default Timerbutton