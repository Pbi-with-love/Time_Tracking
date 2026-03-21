import React, { useState, useRef, useContext, useEffect, use } from "react";
import {
  ChevronDown,
  CalendarClock,
  Play,
  Pause,
  Ellipsis,
  SquarePen,
  Trash,
  TriangleAlert,
  CircleFadingPlus,
  Plus,
} from "lucide-react";
import { TasksAndTagsContext } from "../context/TasksAndTagsContext";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  getTaskDetailsIntervals,
  checkOverlap,
  updateTimestampById,
  getTimestampById,
  createTimestampWithCustomTime
} from "../api/Timestamps";
import {
  formattedTime,
  formatDateForInput,
  formatTimestampForDB,
} from "../utils/Time";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import EditTaskDetailsInterval from "./EditTaskDetailsInterval";
import DeleteDialog from "./DeleteDialog";
import AddTimestampInterval from "./AddTimestampInterval";

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
        <div
          className="fixed inset-0 z-10 bg-black/20"
          onClick={() => setIsPickerOpen(false)}
        />
      )}
    </div>
  );
};

const IntervalSelectorActivityList = ({
  title,
  startTime,
  endTime,
  onStartChange,
  onEndChange,
  selectedTask,
  setSelectedTask,
  icon: Icon,
  onSuccess,
  onError,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { tags } = useContext(TasksAndTagsContext);

  // Specific format for this card display
  const formatDateTimeForDisplay = (date) => {
    const d = new Date(date);
    return {
      dayStr: d.toLocaleDateString(), // local browser format
      timeStr: d.toLocaleTimeString(), // local browser format
    };
  };

  const [hasSearched, setHasSearched] = useState(false);

  const [editingIntervalDisplay, setEditingIntervalDisplay] = useState(false);
  const [deletingInterval, setDeletingInterval] = useState(null);

  // Bad way to handle re-fetching after edit, there will be a better way later
  const [taskActivityDetails, setTaskActivityDetails] = useState([]);
  const [taskDetails, setTaskDetails] = useState(null);

  const [submitEditForm, setSubmitEditForm] = useState(0);
  const [editingInterval, setEditingInterval] = useState(null);

  const [intervalEditForm, setIntervalEditForm] = useState({
    start: formatDateForInput(startTime),
    end: formatDateForInput(endTime),
  });
  const [originalInterval, setOriginalInterval] = useState({
    start: formatDateForInput(startTime),
    end: formatDateForInput(endTime),
  });

  // State for create apply button
  const [isCreateTimestampInterval, setIsCreateTimestampInterval] =
    useState(false);

  // State for open create interval modal
  const [isCreateIntervalOpen, setIsCreateIntervalOpen] = useState(false);

  // Apply Interval Button Handler
  const toggleApplyInterval = async () => {
    if (!selectedTask) {
      onError("Please select a task!");
      return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      onError("Start time must be before end time!");
      return;
    }
    if (!startTime || !endTime) {
      onError("Please select both start and end times!");
      return;
    }

    try {
      const taskInfo = await getTaskDetailsIntervals({
        start: startTime,
        end: endTime,
        task: selectedTask._id,
      });

      setTaskActivityDetails(taskInfo.activityIntervals || []);
      setTaskDetails(taskInfo);
      setHasSearched(true);
      setIsCreateTimestampInterval(true);
    } catch (err) {
      console.error("Failed to fetch task details intervals", err);
      setTaskActivityDetails([]);
      onError?.("Failed to fetch task intervals");
    }
  };

  // State for edit apply button
  const [isChanged, setIsChanged] = useState(false);

  const { timestamps, setTimestamps } = useContext(TasksAndTagsContext);

  const handleUpdateInterval = async () => {
    if (
      new Date(intervalEditForm.start).getTime() ===
        new Date(editingInterval.startTime).getTime() &&
      new Date(intervalEditForm.end).getTime() ===
        new Date(editingInterval.endTime).getTime()
    ) {
      onError("No changes detected, interval was not updated");
      return;
    }
    try {
      const tempIntervals = taskActivityDetails.map((i) => {
        const isEditingThis =
          editingInterval &&
          (editingInterval.startTsId === i.startTsId ||
            editingInterval.endTsId === i.endTsId);

        const startVal =
          isEditingThis && intervalEditForm.start
            ? intervalEditForm.start
            : i.startTime;
        const endVal =
          isEditingThis && intervalEditForm.end
            ? intervalEditForm.end
            : i.endTime;

        return {
          start: new Date(startVal).getTime(),
          end: endVal ? new Date(endVal).getTime() : Date.now(),
        };
      });

      const overlapFlags = checkOverlap(tempIntervals);
      const thisIntervalOverlap = !!overlapFlags.find((flag, idx) => {
        const i = taskActivityDetails[idx];
        return (
          (i.startTsId === editingInterval.startTsId ||
            i.endTsId === editingInterval.endTsId) &&
          flag
        );
      });

      if (thisIntervalOverlap) {
        onError("Cannot update interval: overlapping detected!");
        return;
      }
      const formattedStart = formatTimestampForDB(intervalEditForm.start);
      const updatedProcess = await updateTimestampById(
        editingInterval.startTsId,
        { timestamp: formattedStart }
      );
      const updatedTs = await getTimestampById(updatedProcess._id);
      setTimestamps((prev) =>
        prev.map((t) => (t._id === updatedTs._id ? updatedTs : t))
      );

      if (intervalEditForm.end) {
        const formattedEnd = formatTimestampForDB(intervalEditForm.end);

        if (!editingInterval.endTsId) {
          const newTs = await createTimestampWithCustomTime(
            taskDetails.id,
            formattedEnd,
            1
          );
          editingInterval.endTsId = newTs._id;
          setTimestamps((prev) => [...prev, newTs]);
        } else {
          const updatedProcess = await updateTimestampById(
            editingInterval.endTsId,
            { timestamp: formattedEnd }
          );
          const updatedTs = await getTimestampById(updatedProcess._id);
          setTimestamps((prev) =>
            prev.map((t) => (t._id === updatedTs._id ? updatedTs : t))
          );
        }
      }

      const taskInfo = await getTaskDetailsIntervals({
        start: startTime,
        end: endTime,
        task: selectedTask._id,
      });

      setTaskActivityDetails(taskInfo.activityIntervals || []);
      setTaskDetails(taskInfo);
      setSubmitEditForm((prev) => prev + 1);
      setIsChanged(false);
      onSuccess("Interval successfully updated!");
      setEditingInterval(null);
    } catch (err) {
      console.error(err);
      onError("Failed to update interval!");
    }
  };

  // Make sure synchronize when timestamps change
  useEffect(() => {
    if (!selectedTask) return;

    const fetchIntervals = async () => {
      try {
        const taskInfo = await getTaskDetailsIntervals({
          start: startTime,
          end: endTime,
          task: selectedTask._id,
        });
        setTaskActivityDetails(taskInfo.activityIntervals || []);
        setTaskDetails(taskInfo);
      } catch (err) {
        console.error(err);
        onError("Failed to fetch intervals");
      }
    };

    fetchIntervals();
  }, [timestamps]);

  return (
    <>
      <div
        style={{
          boxShadow: `0 2px 6px rgba(168,85,247,0.3), 0 4px 12px rgba(6,182,212,0.4)`,
        }}
        className="relative bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-neutral-700 overflow-hidden transition-all duration-300"
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full cursor-pointer px-5 py-4 flex items-center justify-between bg-gradient-to-r from-purple-600/30 to-cyan-600/20 hover:from-purple-600/40 hover:to-cyan-600/30 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 shadow-sm">
              <Icon className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base xs:text-lg font-semibold text-white">
              {title}
            </h3>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-neutral-400 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {isExpanded && (
          <div className="px-4 pb-5 space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DateTimeInput
                label="Start Time"
                value={startTime}
                onChange={onStartChange}
              />
              <DateTimeInput
                label="End Time"
                value={endTime}
                onChange={onEndChange}
              />
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={toggleApplyInterval}
                className="flex-1 mb-4 cursor-pointer px-4 py-2 bg-gradient-to-r from-sky-300 to-cyan-500 rounded-lg text-white text-sm font-medium hover:from-sky-400 hover:to-cyan-600 transition-all"
              >
                Apply Interval
              </button>
            </div>
            <div className="flex items-center mt-4 justify-end">
              {isCreateTimestampInterval && (
                <button
                  onClick={() => {
                    setIsCreateIntervalOpen(true);
                  }}
                  className="cursor-pointer mr-3 xs:px-5 xs:py-3 px-2 py-2 flex gap-2 bg-gradient-to-r from-purple-500 to-blue-500  hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all"
                >
                  <span className="max-xs:hidden xs:text-base">
                    New Interval
                  </span>
                  <CircleFadingPlus className="w-6 h-6" />
                </button>
              )}
              {isChanged && (
                <div className="flex ml-auto">
                  <button
                    onClick={() => {
                      toggleApplyInterval();
                      setIsChanged(false);
                    }}
                    className="cursor-pointer mr-3 px-5 py-2 border border-neutral-400 text-neutral-400 rounded-lg font-medium hover:bg-neutral-800 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateInterval();
                    }}
                    className="px-4 cursor-pointer py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium hover:from-emerald-600 hover:to-green-700 transition-all shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              {taskActivityDetails.length === 0 && hasSearched ? (
                <div className="text-center py-8 text-neutral-500 italic">
                  No activity intervals found in selected range.
                </div>
              ) : (
                taskActivityDetails.map((interval, idx) => {
                  const displayedStart = interval.startTime;
                  const displayedEnd = interval.endTime;
                  const { dayStr: startDayStr, timeStr: startTimeStr } =
                    formatDateTimeForDisplay(displayedStart);
                  const { dayStr: endDayStr, timeStr: endTimeStr } =
                    displayedEnd
                      ? formatDateTimeForDisplay(displayedEnd)
                      : { dayStr: "--", timeStr: "--" };

                  const tempIntervals = taskActivityDetails.map((i) => {
                    return {
                      start: new Date(i.startTime).getTime(),
                      end: i.endTime
                        ? new Date(i.endTime).getTime()
                        : Date.now(),
                    };
                  });

                  const overlapFlags = checkOverlap(tempIntervals);
                  const thisIntervalOverlap = !!overlapFlags[idx];

                  return (
                    <div
                      key={idx}
                      className={`relative ${
                        thisIntervalOverlap
                          ? "bg-gradient-to-r from-red-500 via-orange-600 to-yellow-500"
                          : "bg-neutral-800"
                      } rounded-xl p-5 border border-neutral-700 hover:border-cyan-400 transition-all group hover`}
                    >
                      <div className="absolute top-0 right-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="cursor-pointer p-2 bg-transparent hover:bg-neutral-700 text-white text-sm rounded-md">
                              <Ellipsis />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="bottom" align="end">
                            <DropdownMenuItem
                              onSelect={() => {
                                const intervalToEdit = taskActivityDetails.find(
                                  (i) =>
                                    i.startTsId === interval.startTsId ||
                                    i.endTsId === interval.endTsId
                                );
                                setEditingInterval(intervalToEdit);
                                setEditingIntervalDisplay(true);
                                setIntervalEditForm({
                                  start: formatDateForInput(
                                    intervalToEdit.startTime
                                  ),
                                  end: intervalToEdit.endTime
                                    ? formatDateForInput(intervalToEdit.endTime)
                                    : "",
                                });
                              }}
                              className="text-black data-[highlighted]:bg-gradient-to-r from-cyan-500 to-blue-500 data-[highlighted]:text-white cursor-pointer"
                            >
                              <SquarePen className="focus:text-white" />
                              <p className="text-sm">Edit</p>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onSelect={() => {
                                const intervalToEdit = taskActivityDetails.find(
                                  (i) =>
                                    i.startTsId === interval.startTsId ||
                                    i.endTsId === interval.endTsId
                                );
                                setDeletingInterval(intervalToEdit);
                              }}
                              className="text-black data-[highlighted]:bg-gradient-to-br from-red-600 via-red-500 to-yellow-200 data-[highlighted]:text-white  cursor-pointer"
                            >
                              <Trash className="focus:text-white" />
                              <p className="text-sm">Delete</p>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {thisIntervalOverlap && (
                        <div className="flex flex-row items-center gap-2 mb-4">
                          <TriangleAlert className="w-6 h-6 text-red-700" />
                          <p className="text-white">
                            Warning: Overlapping intervals detected!
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between items-center sm:mr-5">
                        <div className="flex items-start flex-1 gap-4">
                          <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-neutral-300 font-bold">
                            #{idx + 1}
                          </div>
                          <div className="flex flex-1 flex-col-reverse sm:flex-row">
                            <div className="flex flex-row gap-5">
                              <div className="flex flex-row items-start gap-5 text-base">
                                <div className="flex flex-col items-start">
                                  <div className="flex flex-row items-center gap-2 mr-2">
                                    <Play className="w-4 h-4 text-green-400" />
                                    <span className="text-gray-400">
                                      Start:
                                    </span>
                                  </div>

                                  <span className="text-white text-lg font-semibold mr-1">
                                    {startDayStr}
                                  </span>
                                  <span className=" text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-br from-green-400 via-cyan-400 to-blue-600">
                                    {startTimeStr}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-row items-start gap-5 text-base">
                                <div className="flex flex-col items-start">
                                  <div className="flex flex-row items-center gap-2 mr-2">
                                    <Pause className="w-4 h-4 text-red-400" />
                                    <span className="text-gray-400">End:</span>
                                  </div>
                                  <span className="text-white text-lg font-semibold mr-1">
                                    {endDayStr}
                                  </span>
                                  <span className="bg-clip-text text-transparent bg-gradient-to-br from-pink-500 to-orange-400 text-lg font-semibold">
                                    {endTimeStr}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-start mb-5 sm:mb-0 sm:ml-auto sm:items-end text-left sm:text-right text-base">
                              {interval.status === "Ongoing" ? (
                                <div className="flex flex-row items-center gap-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                  <span className="text-red-400 font-semibold">
                                    ONGOING
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-row items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                  <span className="text-green-400 font-semibold">
                                    COMPLETED
                                  </span>
                                </div>
                              )}
                              <span className="text-sm text-neutral-400">
                                Active Duration
                              </span>
                              <span className="text-2xl font-mono font-bold text-cyan-400">
                                {formattedTime(interval.duration)}
                              </span>
                              <span className="text-sm text-neutral-400">
                                {interval.status === "Ongoing"
                                  ? "(On Progress...)"
                                  : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      {/* ----- Edit Task Modal ----- */}
      {editingIntervalDisplay && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-1000">
          <div className="bg-neutral-900 px-6 py-3 md:p-3 rounded-2xl shadow-lg w-[90%] md:w-[500px] relative">
            <EditTaskDetailsInterval
              onClose={() => setEditingIntervalDisplay(false)}
              onError={onError}
              startTsId={editingInterval.startTsId}
              endTsId={editingInterval.endTsId}
              setTaskActivityDetails={setTaskActivityDetails}
              intervalEditForm={intervalEditForm}
              setIntervalEditForm={setIntervalEditForm}
              isChanged={isChanged}
              setIsChanged={setIsChanged}
            />
          </div>
        </div>
      )}

      {/* ----- Create Timestamp Model ----- */}
      {isCreateIntervalOpen && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-1000">
          <div className="bg-neutral-900 px-6 py-3 md:p-3 rounded-2xl shadow-lg w-[90%] md:w-[500px] relative">
            <AddTimestampInterval
              onClose={() => setIsCreateIntervalOpen(false)}
              taskId={taskDetails.id}
              onSuccess={onSuccess}
              onError={onError}
              taskActivityDetails={taskActivityDetails}
              setTaskActivityDetails={setTaskActivityDetails}
              taskDetails={taskDetails}
              setTaskDetails={setTaskDetails}
            />
          </div>
        </div>
      )}

      {/* ----- Delete Timestamp Modal ----- */}
      {deletingInterval && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-1000">
          <div className="bg-neutral-900 px-6 py-3 md:p-3 rounded-2xl shadow-lg w-[90%] xs:w-[70%] md:w-[500px] relative">
            <DeleteDialog
              type="interval"
              onClose={() => setDeletingInterval(null)}
              onSuccess={onSuccess}
              onError={onError}
              id={{
                startTsId: deletingInterval.startTsId,
                endTsId: deletingInterval.endTsId,
              }}
              message="Delete Active Interval"
              subMessage="Are you sure you want to delete this active interval?"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default IntervalSelectorActivityList;
