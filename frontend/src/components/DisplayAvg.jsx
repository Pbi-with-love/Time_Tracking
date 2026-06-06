import React from 'react'
import { formattedTime } from '../utils/Time'

const DisplayAvg = ({ className, averageActiveTimePerDay, timeConsistency, activeDayCount, activityFrequency }) => {
    const displayAverageTime =
        typeof averageActiveTimePerDay === 'number' && !Number.isNaN(averageActiveTimePerDay)
            ? formattedTime(averageActiveTimePerDay)
            : 'None';

    return (
        <div className={`${className}`}>
            <div 
                style={{ boxShadow: "0 -3px 6px rgba(6,182,212,0.3), 0 2px 6px rgba(0,255,255,0.25), -1px 0 3px rgba(6,182,212,0.2), 1px 0 3px rgba(0,255,255,0.2)"}} 
                className="bg-neutral-600 rounded-lg p-4 border border-neutral-500"
            >
                <div className="text-xs text-neutral-400">Activity Frequency</div>
                <div className="text-lg lg:text-xl font-bold">{(activityFrequency)}</div>
            </div>
            <div 
                style={{ boxShadow: "0 -3px 6px rgba(6,182,212,0.3), 0 2px 6px rgba(0,255,255,0.25), -1px 0 3px rgba(6,182,212,0.2), 1px 0 3px rgba(0,255,255,0.2)"}} 
                className="bg-neutral-600 rounded-lg p-4 border border-neutral-500"
            >
                <div className="text-xs text-neutral-400">Active Day Count</div>
                <div className="text-lg lg:text-xl font-bold">{(activeDayCount)}</div>
            </div>
            <div 
                style={{ boxShadow: "0 -3px 6px rgba(6,182,212,0.3), 0 2px 6px rgba(0,255,255,0.25), -1px 0 3px rgba(6,182,212,0.2), 1px 0 3px rgba(0,255,255,0.2)"}} 
                className="bg-neutral-600 rounded-lg p-4 border border-neutral-500"
            >
                <div className="text-xs text-neutral-400">Time consistency</div>
                <div className="text-lg lg:text-xl font-bold">{(timeConsistency)}</div>
            </div>
            <div 
                style={{ boxShadow: "0 -3px 6px rgba(6,182,212,0.3), 0 2px 6px rgba(0,255,255,0.25), -1px 0 3px rgba(6,182,212,0.2), 1px 0 3px rgba(0,255,255,0.2)"}} 
                className="bg-neutral-600 rounded-lg p-4 border border-neutral-500"
            >
                <div className="text-xs text-neutral-400">Avg Active Time Per Day</div>
                <div className="text-lg lg:text-xl font-bold">{displayAverageTime}</div>
            </div>
        </div>
    )
}

export default DisplayAvg
