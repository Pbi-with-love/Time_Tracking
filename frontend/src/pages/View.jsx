import React, { useState, useContext } from 'react'
import { Clock, Tag, ChevronDown } from 'lucide-react'
import IntervalSelectorTasks from '../components/IntervalSelectorTasks'
import InterestSectionCard from '../components/InterestSectionCard'
import IntervalSelectorTags from '../components/IntervalSelectorTags'
import IntervalSelectorActivityList from '../components/IntervalSelectorActivityList'
import IntervalActivityListSectionCard from '../components/IntervalActivityListSectionCard'
import { formattedTime } from '../utils/Time'
import Alert from '../components/Alert'
import { IntervalContext } from '../context/IntervalContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import { SettingsContext } from '../context/SettingsContext'


export default function View() {

  const { theme } = useContext(SettingsContext);
  const bgClass = theme === 'dark'
    ? 'bg-neutral-900'
    : '';


  const {
    taskInterval, setTaskInterval,
    tagInterval, setTagInterval,
    taskActivityInterval, setTaskActivityInterval,
    totalTimeForInterestTasks, setTotalTimeForInterestTasks,
    totalTimeForInterestTags, setTotalTimeForInterestTags,
  } = useContext(IntervalContext);


  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const onSuccess = (message) => setNotification({ show: true, message, type: 'success' });
  const onError = (message) => setNotification({ show: true, message, type: 'error' });

  const [selectedTask, setSelectedTask] = useState(null);


  return (
    <div className={`${bgClass} text-white p-6 xs:p-8 rounded-lg h-full overflow-y-auto`}>
      {/* ----- Header ----- */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-gradient-to-b from-purple-400 via-blue-400 to-cyan-400 rounded-full"></div>
          <div>
            <p className="text-lg xs:text-2xl font-semibold bg-gradient-to-r from-lime-100 via-cyan-500 to-blue-400 bg-clip-text text-transparent">
              Active Time Trackers
            </p>
            <p className="text-sm text-neutral-500">Track every second. Master your time.</p>
          </div>
        </div>
      </div>

      {/* ----- Observation View Title ----- */}
      <div className="mb-6">
        <p className="text-2xl md:text-3xl font-medium text-white">
          Observation{' '}
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            View
          </span>
        </p>
        <p className="text-neutral-500 text-sm mt-1">
          Analyze tasks and tags within custom time intervals.
        </p>
      </div>

      {/* ----- Task Observation Interval ----- */}
      <div className="mb-15">
        <div className="mb-6">
          <InterestSectionCard
            title="Tasks of Interest"
            subtitle="Tasks active during the observation interval"
            total={formattedTime(totalTimeForInterestTasks)}
            colorFrom="from-cyan-400"
            colorTo="to-blue-400"
          />
        </div>
        <IntervalSelectorTasks
          title="Task Observation Interval"
          startTime={taskInterval.start}
          endTime={taskInterval.end}
          totalTimeForInterestTasks={totalTimeForInterestTasks}
          setTotalTimeForInterestTasks={setTotalTimeForInterestTasks}
          onStartChange={(val) => setTaskInterval(prev => ({ ...prev, start: val }))}
          onEndChange={(val) => setTaskInterval(prev => ({ ...prev, end: val }))}
          icon={Clock}
          onSuccess={onSuccess}
          onError={onError}
        />

      </div>

      {/* ----- Tag Observation Interval ----- */}
      <div className="mb-15">
        <div className="mb-6">
          <InterestSectionCard
            title="Tags of Interest"
            subtitle="Tags tracked during the observation interval"
            total={formattedTime(totalTimeForInterestTags)}
            colorFrom="from-purple-400"
            colorTo="to-pink-400"
          />
        </div>
        <IntervalSelectorTags
          title="Tag Observation Interval"
          startTime={tagInterval.start}
          endTime={tagInterval.end}
          totalTimeForInterestTags={totalTimeForInterestTags}
          setTotalTimeForInterestTags={setTotalTimeForInterestTags}
          onStartChange={(val) => setTagInterval(prev => ({ ...prev, start: val }))}
          onEndChange={(val) => setTagInterval(prev => ({ ...prev, end: val }))}
          icon={Clock}
          onSuccess={onSuccess}
          onError={onError}
        />
      </div>

      {/* ----- Activity List Observation Interval ----- */}
      <div className="mb-15">
        <div className="mb-6">
          <IntervalActivityListSectionCard
            title="Task Activity Details"
            subtitle="View detailed activity intervals for individual tasks"
            selectedTask={selectedTask}
            setSelectedTask={setSelectedTask}
          />
        </div>
        <IntervalSelectorActivityList
          title="Task Details Interval"
          startTime={taskActivityInterval.start}
          endTime={taskActivityInterval.end}
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          onStartChange={(val) => setTaskActivityInterval(prev => ({ ...prev, start: val }))}
          onEndChange={(val) => setTaskActivityInterval(prev => ({ ...prev, end: val }))}
          icon={Clock}
          onSuccess={onSuccess}
          onError={onError}
        />
      </div>

      {/* ----- Notification ----- */}
      {
        notification.show && (
          <Alert
            onClose={() => setNotification({ ...notification, show: false })}
            message={notification.message}
            type={notification.type}
          />
        )
      }
    </div>
  )
}
