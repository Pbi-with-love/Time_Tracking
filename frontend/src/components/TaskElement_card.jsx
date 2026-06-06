import React, { useState, useEffect, useMemo } from 'react';
import { Tag, SquarePen, Trash, Ellipsis } from 'lucide-react';
import Timerbutton from './Timerbutton';
import { getOrderedTasks, getTaskStats } from '../api/Timestamps';
import { calculateTotalTime, formattedTime } from '../utils/Time';
import DisplayAvg from './DisplayAvg';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import EditTaskForm from './EditTaskForm';
import DeleteDialog from './DeleteDialog';
import Alert from './Alert';

import SortableItem from './SortableItem';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';

// id is for frontend dnd-kit usage
// _id is for backend database usage
import { normalizeTaskId } from '../utils/NormalizeTaskId';

const TaskElement_card = ({
  tasks,
  tags,
  timestamps,
  setTimestamps,
  colors,
  selectedTagsFilter,
  sortOrder,
  setSortOrder,
}) => {
  const [editTaskId, setEditTaskId] = useState(null);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const onSuccess = (message) => setNotification({ show: true, message, type: 'success' });
  const onError = (message) => setNotification({ show: true, message, type: 'error' });

  // Drag and drop
  const [items, setItems] = useState([]);

  const sensors = useSensors(useSensor(PointerSensor));

  // Make sure user change UI to default or draging
  const [isDragging, setIsDragging] = useState(false);

  // Set the time button
  const [activeTimers, setActiveTimers] = useState({});

  const [stats, setStats] = useState({
    averageActiveTimePerDay: {},
    timeConsistency: {},
    activeDayCount: {},
    activityFrequency: {}
  });

  useEffect(() => {
    const fetchAvgStats = async () => {
      try {
        const statsMap = await getTaskStats();
        setStats(statsMap || {
          averageActiveTimePerDay: {},
          timeConsistency: {},
          activeDayCount: {},
          activityFrequency: {},
        });
      } catch {
        setStats({
          averageActiveTimePerDay: {},
          timeConsistency: {},
          activeDayCount: {},
          activityFrequency: {},
        });
      }
    };

    fetchAvgStats();
  }, [tasks, timestamps]);

  useEffect(() => {
    const storageKey = selectedTagsFilter?.length
      ? `taskOrder_tag_${selectedTagsFilter.map(t => t._id).join('_')}`
      : 'taskOrder_all';

    const storedOrder = JSON.parse(localStorage.getItem(storageKey) || '[]');

    const normalizedTasks = normalizeTaskId(tasks);

    if (storedOrder.length) {
      const orderedTasks = storedOrder
        .map(id => normalizedTasks.find(t => t.id === id))
        .filter(Boolean);

      const remainingTasks = normalizedTasks.filter(t => !storedOrder.includes(t.id));
      setItems([...orderedTasks, ...remainingTasks]);
    } else {
      setItems(normalizedTasks);
    }
  }, [tasks, selectedTagsFilter]);

  const [toggleStartStop, setToggleStartStop] = useState(false);

  useEffect(() => {
    if (isDragging || !sortOrder) return;
    const sortTasks = async () => {
      const baseTasks = [...tasks];
      const normalizedBaseTasks = normalizeTaskId(baseTasks);

      const { earliestTasks, latestTasks } = await getOrderedTasks(tasks);

      const normalizedEarliestTasks = normalizeTaskId(earliestTasks);
      const normalizedLatestTasks = normalizeTaskId(latestTasks);

      if (sortOrder === 'Earliest') {
        setItems(normalizedEarliestTasks);
      } else if (sortOrder === 'Latest') {
        setItems(normalizedLatestTasks);
      } else if (sortOrder === 'Default') {
        setItems(normalizedBaseTasks);
      }
    };

    sortTasks();
  }, [sortOrder]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id && sortOrder) {
      setSortOrder(null);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setIsDragging(false);
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      const storageKey = selectedTagsFilter?.length
        ? `taskOrder_tag_${selectedTagsFilter.map(t => t._id).sort().join('_')}`
        : 'taskOrder_all';

      localStorage.setItem(
        storageKey,
        JSON.stringify(newItems.map(t => t.id))
      );
    }
  };


  const totalTimes = useMemo(() => calculateTotalTime(tasks, timestamps), [tasks, timestamps]);


  const getDisplayTime = (taskId) => {
    const timer = activeTimers[taskId];
    if (timer?.running) {
      return (totalTimes[taskId] || 0) + (Date.now() - timer.startTime);
    }
    return totalTimes[taskId] || 0;
  };


  useEffect(() => {
    let animationFrameId;

    const updateTimer = () => {

      setActiveTimers((prev) => {
        if (Object.values(prev).some((t) => t.running)) {
          return { ...prev };
        }
        return prev;
      });

      animationFrameId = requestAnimationFrame(updateTimer);
    };

    animationFrameId = requestAnimationFrame(updateTimer);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <>
      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((task, index) => (
            <SortableItem key={task._id} task={task}>
              <div
                style={{
                  boxShadow: activeTimers[task._id]?.running
                    ? '0 -6px 12px rgba(168,85,247,0.4), 0 4px 12px rgba(6,182,212,0.4), -2px 0 6px rgba(168,85,247,0.2), 2px 0 6px rgba(6,182,212,0.2)'
                    : '',
                }}
                className={`relative flex flex-col bg-neutral-800 p-8 xs:p-6 rounded-2xl ${index !== items.length - 1 ? 'mb-15 xs:mb-8' : ''
                  }`}
              >
                <div className="flex flex-col h-full xs:flex-row gap-4 lg:gap-8 items-start justify-center">
                  {/* ----- Left side ----- */}
                  <div className="flex flex-col items-center xs:ml-2 mb-8 gap-8 xs:gap-2 w-full xs:max-w-[200px]">
                    <div
                      className={`text-4xl xs:text-3xl lg:text-4xl font-bold tracking-wider ${colors.timer} mb-0 xs:mb-5`}
                    >
                      {formattedTime(getDisplayTime(task._id))}
                    </div>

                    <div className="absolute top-0 right-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="cursor-pointer p-2 bg-transparent hover:bg-neutral-700 text-white text-sm rounded-md">
                            <Ellipsis />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          onPointerDown={(e) => e.stopPropagation()}
                          side="bottom"
                          align="end"
                        >
                          <DropdownMenuItem
                            onSelect={() => setEditTaskId(task._id)}
                            className="text-black data-[highlighted]:bg-gradient-to-r from-cyan-500 to-blue-500 data-[highlighted]:text-white cursor-pointer"
                          >
                            <SquarePen className="focus:text-white" />
                            <p className="text-sm">Edit</p>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setDeleteTaskId(task._id)}
                            className="text-black data-[highlighted]:bg-gradient-to-br from-red-600 via-red-500 to-yellow-200 data-[highlighted]:text-white  cursor-pointer"
                          >
                            <Trash className="focus:text-white" />
                            <p className="text-sm">Delete</p>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <Timerbutton
                      id={task._id}
                      colors={colors}
                      activeTimers={activeTimers}
                      setActiveTimers={setActiveTimers}
                      toggleStartStop={toggleStartStop}
                      setToggleStartStop={setToggleStartStop}
                    />
                  </div>

                  {/* ----- Right side ----- */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`min-w-1 min-h-6 self-start translate-y-0.5 rounded-full ${colors.accent}`}
                      ></div>
                      <h1 className="text-xl font-semibold">
                        {(task.title || "").charAt(0).toUpperCase() + (task.title || "").slice(1)}
                      </h1>
                    </div>

                    {/* Tags section */}
                    <div className="flex gap-2 flex-wrap mb-8">
                      {Array.isArray(task.tags) && task.tags.length > 0 ? (
                        task.tags.map((tagId) => {
                          const tag = tags.find(t => t._id === tagId);
                          if (!tag) return null;
                          return (
                            <Tooltip key={tag._id}>
                              <TooltipTrigger asChild>
                                <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-teal-300 border border-emerald-500/30 rounded-full text-sm font-medium flex items-center gap-1 cursor-pointer">
                                  <Tag size={14} />
                                  {tag.title}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                align="start"
                                className="inline-block max-w-xs bg-white text-black border border-gray-200 rounded-lg shadow-lg px-3 py-2"
                              >
                                <p className="leading-relaxed flex-1">
                                  {tag.description || 'No additional data'}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })
                      ) : (
                        <span className="text-gray-400 italic text-sm">No tags</span>
                      )}
                    </div>

                    <p className="xs:block text-sm text-gray-400 leading-relaxed mb-3">
                      {task.description || 'No additional data'}
                    </p>


                    <DisplayAvg
                      className={'hidden lg:grid grid-cols-2 mt-8 xl:grid-cols-4 gap-4'}
                      averageActiveTimePerDay={stats?.averageActiveTimePerDay?.[task._id] ?? "None"}
                      timeConsistency={stats?.timeConsistency?.[task._id]?.level ?? "None"}
                      activeDayCount={stats?.activeDayCount?.[task._id] ?? 0}
                      activityFrequency={stats?.activityFrequency?.[task._id] ?? 0}
                    />

                  </div>
                </div>

                <DisplayAvg
                  className={'lg:hidden mt-4 grid grid-cols-2 gap-4 w-full'}
                  averageActiveTimePerDay={stats?.averageActiveTimePerDay?.[task._id] ?? "None"}
                  timeConsistency={stats?.timeConsistency?.[task._id]?.level ?? "None"}
                  activeDayCount={stats?.activeDayCount?.[task._id] ?? 0}
                  activityFrequency={stats?.activityFrequency?.[task._id] ?? 0}
                />

                {notification.show && (
                  <Alert
                    onClose={() => setNotification({ ...notification, show: false })}
                    message={notification.message}
                    type={notification.type}
                  />
                )}
              </div>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>

      {/* Edit Task Modal */}
      {editTaskId && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-1000">
          <div className="bg-neutral-900 px-6 py-3 md:p-3 rounded-2xl shadow-lg w-[90%] md:w-[500px] relative">
            <EditTaskForm
              onClose={() => setEditTaskId(null)}
              onSuccess={onSuccess}
              onError={onError}
              taskId={editTaskId}
            />
          </div>
        </div>
      )}

      {/* Delete Task Modal */}
      {deleteTaskId && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-1000">
          <div className="bg-neutral-900 px-6 py-3 md:p-3 rounded-2xl shadow-lg w-[90%] xs:w-[70%] md:w-[500px] relative">
            <DeleteDialog
              type="task"
              onClose={() => setDeleteTaskId(null)}
              onSuccess={onSuccess}
              onError={onError}
              id={deleteTaskId}
              message="Delete Task"
              subMessage="Are you sure you want to delete this task?"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TaskElement_card;
