import React, { useState, useRef, useContext, useEffect } from 'react'
import { ChevronDown, CalendarClock, Tag as TagIcon } from 'lucide-react'
import { getTasksOfInterest } from '../api/Timestamps'
import { TasksAndTagsContext } from '../context/TasksAndTagsContext'
import { formattedTime } from '../utils/Time'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip' // adjust import path if needed

const DateTimeInput = ({ label, value, onChange }) => {
    const inputRef = useRef(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const handleOpen = () => {
        inputRef.current?.showPicker?.();
        setIsPickerOpen(true);
    };

    return (
        <div className="flex flex-col gap-2 relative">
            <label className="text-sm text-neutral-400 font-medium">{label}</label>

            <div className="relative group cursor-text" onClick={handleOpen}>
                <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-hover:text-cyan-400 transition-colors" />

                <input
                    ref={inputRef}
                    type="datetime-local"
                    step="1"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full cursor-pointer pl-9 pr-3 py-2 bg-black text-sm text-white rounded-xl border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent hover:border-cyan-500/30 transition-all placeholder-neutral-500"
                />

                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-[2px]" />
                </div>
            </div>

            {isPickerOpen && (
                <div className="fixed inset-0 z-10 bg-black/20" onClick={() => setIsPickerOpen(false)} />
            )}
        </div>
    );
};

const IntervalSelectorTasks = ({ title, startTime, endTime, totalTimeForInterestTasks, setTotalTimeForInterestTasks, onStartChange, onEndChange, icon: Icon, onSuccess, onError }) => {
    const [isExpanded, setIsExpanded] = useState(true)
    const [tasksOfInterest, setTasksOfInterest] = useState([])
    const { tags } = useContext(TasksAndTagsContext)
    const [hasSearched, setHasSearched] = useState(false);

    const toggleApplyInterval = async () => {
        if (new Date(startTime) >= new Date(endTime)) {
            onError("Start time must be before end time!")
            return;
        }
        if (!startTime || !endTime) {
            onError("Please select both start and end times!")
            return;
        }
        try {
            let tasks = await getTasksOfInterest({ start: startTime, end: endTime })
            tasks = tasks
                .filter(t => t.activeTime > 0)
                .sort((a, b) => b.activeTime - a.activeTime);

            setTasksOfInterest(tasks)
            setHasSearched(true)

            const totalTime = tasks.reduce((sum, t) => sum + (t.activeTime || 0), 0)
            setTotalTimeForInterestTasks(totalTime)

        } catch (err) {
            console.error('Failed to fetch tasks of interest', err)
            setTasksOfInterest([])
        }
    }



    return (
        <div style={{ boxShadow: `0 2px 6px rgba(168,85,247,0.3), 0 4px 12px rgba(6,182,212,0.4)` }} className="relative bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-neutral-700 overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full cursor-pointer px-5 py-4 flex items-center justify-between bg-gradient-to-r from-purple-600/30 to-cyan-600/20 hover:from-purple-600/40 hover:to-cyan-600/30 transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 shadow-sm">
                        <Icon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-base xs:text-lg font-semibold text-white">{title}</h3>
                </div>
                <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isExpanded && (
                <div className="px-4 pb-5 space-y-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DateTimeInput label="Start Time" value={startTime} onChange={onStartChange} />
                        <DateTimeInput label="End Time" value={endTime} onChange={onEndChange} />
                    </div>

                    <div className="flex items-center gap-3 mt-8">
                        <button
                            onClick={toggleApplyInterval}
                            className="flex-1 cursor-pointer px-4 py-2 bg-gradient-to-r from-sky-300 to-cyan-500 rounded-lg text-white text-sm font-medium hover:from-sky-400 hover:to-cyan-600 transition-all"
                        >
                            Apply Interval
                        </button>
                    </div>

                    {/* Tasks list */}
                    <div className="mt-6 space-y-4">
                        {tasksOfInterest.length === 0 && hasSearched ? (
                            <p className="text-center py-8 text-neutral-500 italic">No active tasks in this interval</p>
                        ) : (
                            tasksOfInterest.map((task, idx) => {
                        
                                const percentage = totalTimeForInterestTasks ? (task.activeTime / totalTimeForInterestTasks) * 100 : 0
                                const taskTags = task.tags || [];
                                const color = task.color || '#06b6d4' // fallback color

                                return (
                                    <div key={task.id} className="bg-neutral-800 rounded-xl p-5 border border-neutral-700 hover:border-neutral-400 transition-all group">
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-neutral-300 font-bold">
                                                    #{idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex flex-col-reverse sm:flex-row items-start gap-4">
                                                        <div className="flex flex-col gap-3 mr-3">
                                                            <h4 className="text-lg font-semibold text-white">{task.title.charAt(0).toUpperCase() + task.title.slice(1)}</h4>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                {taskTags.length > 0 ? (
                                                                    taskTags.map((tagIdStr) => {
                                                                        const tagObj = Array.isArray(tags) ? tags.find(t => t._id === tagIdStr) : null;
                                                                        if (!tagObj) return null
                                                                        return (
                                                                            <Tooltip key={tagIdStr}>
                                                                                <TooltipTrigger asChild>
                                                                                    <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-teal-300 border border-emerald-500/30 rounded-full text-sm font-medium flex items-center gap-1 cursor-pointer">
                                                                                        <TagIcon size={14} />
                                                                                        {tagObj.title}
                                                                                    </span>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent side="bottom" align="start" className="inline-block max-w-xs bg-white text-black border border-gray-200 rounded-lg shadow-lg px-3 py-2">
                                                                                    <p className="leading-relaxed">{tagObj.description || 'No additional data'}</p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        )
                                                                    })
                                                                ) : (
                                                                    <span className="text-neutral-400 italic text-sm">No tags</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="sm:ml-auto text-left sm:text-right">
                                                            <div className="text-2xl font-mono font-bold text-cyan-400">
                                                                {formattedTime(task.activeTime)}
                                                            </div>
                                                            <div className="text-sm text-neutral-400">{percentage.toFixed(2)}% of total</div>
                                                        </div>
                                                    </div>
                                                    <p className="leading-relaxed flex-1 mt-3 text-neutral-400 italic">
                                                        {task.description ? task.description : "No additional data"}
                                                    </p>

                                                </div>
                                            </div>


                                        </div>

                                        <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${percentage}%`,
                                                    background: `linear-gradient(to right, ${color}, ${color}99)`
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default IntervalSelectorTasks
