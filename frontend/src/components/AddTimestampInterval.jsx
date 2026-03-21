import React, { useContext, useEffect, useState, useRef } from 'react'
import { CalendarClock } from 'lucide-react'
import { createTimestampWithCustomTime, checkNewIntervalOverlap, getTaskDetailsIntervals, getTimestampById } from '../api/Timestamps'
import { formatTimestampForDB } from '../utils/Time'
import { TasksAndTagsContext } from '../context/TasksAndTagsContext'

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


const AddTimestampInterval = ({ onClose, taskId, onSuccess, onError, taskActivityDetails, setTaskActivityDetails, taskDetails, setTaskDetails }) => {

    const { setTimestamps } = useContext(TasksAndTagsContext);

    const [intervalCreateInput, setIntervalCreateInput] = useState({
        start: "",
        end: ""
    });
    const [isLoading, setIsLoading] = useState(false);

    const createInterval = async (start, end, taskId) => {
        if (new Date(start) >= new Date(end)) {
            onError("Start time must be before end time!");
            return;
        }

        if (!start || !end) {
            onError("Please select both start and end times!");
            return;
        }
        if (isLoading) return;
        setIsLoading(true)
        try {
            const isOverlapping = await checkNewIntervalOverlap({start: new Date(start), end: new Date(end), taskId});
            if (isOverlapping) {
                setIsLoading(false);
                onError("The new interval overlaps with existing intervals!");
                return;
            }
            const formattedStart = formatTimestampForDB(start);
            const formattedEnd = formatTimestampForDB(end);
            const createStartTimeProcess = await createTimestampWithCustomTime(taskId, formattedStart, "start");
            const createStartTime = await getTimestampById(createStartTimeProcess._id);
            setTimestamps(prev => [...prev, createStartTime]);

            const createEndTimeProcess = await createTimestampWithCustomTime(taskId, formattedEnd, "end");
            const createEndTime = await getTimestampById(createEndTimeProcess._id);
            setTimestamps(prev => [...prev, createEndTime]);


            const taskInfo = await getTaskDetailsIntervals({
                start: new Date(start),
                end: new Date(end),
                task: taskDetails.id
            });

            setTaskActivityDetails(taskInfo.activityIntervals || []);
            setTaskDetails(taskInfo);
            onSuccess("Interval successfully created!");
            onClose();
        } catch (error) {
            console.error(error);
            onError("Failed to create interval!");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div
            className="h-auto rounded-lg bg-neutral-900 p-6 xs:p-8 flex flex-col items-start gap-5"
        >
            {/* Time input */}
            <div className="flex w-full flex-col gap-5">
                <DateTimeInput label="Start Time" value={intervalCreateInput.start} onChange={(val) => setIntervalCreateInput(prev => ({ ...prev, start: val }))} />
                <DateTimeInput label="End Time" value={intervalCreateInput.end} onChange={(val) => setIntervalCreateInput(prev => ({ ...prev, end: val }))} />
            </div>

            <div className="self-end translate-x-4 flex gap-3">
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); onClose(); }}
                    className="mt-8 cursor-pointer px-5 py-2 border border-neutral-400 text-neutral-400 rounded-lg font-medium hover:bg-neutral-800 hover:text-white transition-all"
                >
                    Cancel
                </button>

                {/* Submit Button */}
                <button
                    onClick={() => {
                        createInterval(intervalCreateInput.start, intervalCreateInput.end, taskId);
                    }}
                    className="mt-8 cursor-pointer px-5 py-2 bg-white text-black rounded-lg font-medium hover:bg-neutral-300 transition-all"
                >
                    Create Interval
                </button>
            </div>
        </div>
    )
}

export default AddTimestampInterval