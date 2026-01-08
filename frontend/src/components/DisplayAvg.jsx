import React from 'react'
import { formattedTime } from '../utils/Time'

const DisplayAvg = ({ className, totalTime, startTime, endTime, breakTime }) => {
    return (
        <div className={`${className}`}>
            <div 
                style={{ boxShadow: "0 -3px 6px rgba(6,182,212,0.3), 0 2px 6px rgba(0,255,255,0.25), -1px 0 3px rgba(6,182,212,0.2), 1px 0 3px rgba(0,255,255,0.2)"}} 
                className="bg-neutral-600 rounded-lg p-4 border border-neutral-500"
            >
                <div className="text-xs text-neutral-400">Avg Total Time</div>
                <div className="text-lg lg:text-xl font-bold">{formattedTime(totalTime)}</div>
            </div>
            <div 
                style={{ boxShadow: "0 -3px 6px rgba(6,182,212,0.3), 0 2px 6px rgba(0,255,255,0.25), -1px 0 3px rgba(6,182,212,0.2), 1px 0 3px rgba(0,255,255,0.2)"}} 
                className="bg-neutral-600 rounded-lg p-4 border border-neutral-500"
            >
                <div className="text-xs text-neutral-400">Avg Start Time</div>
                <div className="text-lg lg:text-xl font-bold">{formattedTime(startTime)}</div>
            </div>
            <div 
                style={{ boxShadow: "0 -3px 6px rgba(6,182,212,0.3), 0 2px 6px rgba(0,255,255,0.25), -1px 0 3px rgba(6,182,212,0.2), 1px 0 3px rgba(0,255,255,0.2)"}} 
                className="bg-neutral-600 rounded-lg p-4 border border-neutral-500"
            >
                <div className="text-xs text-neutral-400">Avg End Time</div>
                <div className="text-lg lg:text-xl font-bold">{formattedTime(endTime)}</div>
            </div>
            <div 
                style={{ boxShadow: "0 -3px 6px rgba(6,182,212,0.3), 0 2px 6px rgba(0,255,255,0.25), -1px 0 3px rgba(6,182,212,0.2), 1px 0 3px rgba(0,255,255,0.2)"}} 
                className="bg-neutral-600 rounded-lg p-4 border border-neutral-500"
            >
                <div className="text-xs text-neutral-400">Avg Break Time</div>
                <div className="text-lg lg:text-xl font-bold">{formattedTime(breakTime)}</div>
            </div>
        </div>
    )
}

export default DisplayAvg