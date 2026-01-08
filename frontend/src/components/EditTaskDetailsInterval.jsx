import React, { useContext, useEffect, useState, useRef } from 'react'
import { CalendarClock } from 'lucide-react'

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


const EditTaskDetailsInterval = ({ onClose, onError, startTsId, endTsId, setTaskActivityDetails, intervalEditForm, setIntervalEditForm, setIsChanged}) => {

    const updateIntervalDisplay = (start, end, startTsId, endTsId) => {
        if (new Date(start) >= new Date(end)) {
            onError("Start time must be before end time!");
            setIsChanged(false);
            return;
        }


        setTaskActivityDetails(prev =>
            prev.map(interval =>
                interval.startTsId === startTsId
                    ? {
                        ...interval,
                        startTime: new Date(start),
                        endTime: end ? new Date(end) : interval.endTime,
                        duration: end
                            ? new Date(end) - new Date(start)
                            : interval.status === "Ongoing"
                                ? Date.now() - new Date(start)
                                : interval.duration
                    }
                    : interval
            )
        );

        setIsChanged(true);
    };


    return (
        <div
            className="h-auto rounded-lg bg-neutral-900 p-6 xs:p-8 flex flex-col items-start gap-5"
        >
            {/* Time input */}
            <div className="flex w-full flex-col gap-5">
                <DateTimeInput label="Start Time" value={intervalEditForm.start} onChange={(val) => setIntervalEditForm(prev => ({ ...prev, start: val }))} />
                <DateTimeInput label="End Time" value={intervalEditForm.end} onChange={(val) => setIntervalEditForm(prev => ({ ...prev, end: val }))} />
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
                        updateIntervalDisplay(intervalEditForm.start, intervalEditForm.end, startTsId, endTsId);
                        onClose();
                    }}
                    className="mt-8 cursor-pointer px-5 py-2 bg-white text-black rounded-lg font-medium hover:bg-neutral-300 transition-all"
                >
                    Edit Interval
                </button>
            </div>
        </div>
    )
}

export default EditTaskDetailsInterval