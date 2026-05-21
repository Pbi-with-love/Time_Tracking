import React, { useContext, useState, useEffect, useRef } from 'react'
import { ChevronDown, Clock, Calendar, TrendingUp, CircleCheckBig, Clock9, ChartColumn, Tag, CalendarClock } from 'lucide-react'
import { TasksAndTagsContext } from '@/context/TasksAndTagsContext'
import { AuthContext } from '@/context/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar
} from "recharts"
import { totalTimeActiveForAllTask, getMostProductive, getMostActiveStreak, getTaskStartStats, totalTimeActiveForEachTag, totalTimeActiveForAllTasksPerHour, totalTimeActiveForAllTasksDaily, getTaskDailyBarChart } from '../api/Timestamps'
import { formattedTime } from '../utils/Time'
import { IntervalContext } from '../context/IntervalContext'
import Alert from '../components/Alert'
import { SettingsContext } from "../context/SettingsContext";

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
        <CalendarClock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-hover:text-cyan-400 transition-colors" />

        <input
          ref={inputRef}
          type="date"
          step="1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full cursor-pointer pl-10 pr-3 py-3 bg-black text-sm text-white rounded-xl border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent hover:border-cyan-500/30 transition-all placeholder-neutral-500"
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

const Statistics = () => {
  const { user, loading } = useContext(AuthContext);

    const { theme } = useContext(SettingsContext);
  const bgClass = theme === 'dark'
    ? 'bg-neutral-900'
    : '';

  const { tasks, tags, fetchData, timestamps } = useContext(TasksAndTagsContext)

  const period = [
    { label: "All time", functionInput: "all" },
    { label: "Today", functionInput: "today" },
    { label: "This week", functionInput: "thisWeek" },
    { label: "This month", functionInput: "thisMonth" }
  ]

  const [periodOption, setPeriodOption] = useState(period[0])
  const [cardsData, setCardsData] = useState([])

  const [timeByTag, setTimeByTag] = useState([])

  const [timeByTask, setTimeByTask] = useState([])

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        let total, productive, streak, activeTimes;

        let totalTaskInStreak;

        let dailyActivityData = [];

        if (periodOption.functionInput === "today") {
          const perHour = await totalTimeActiveForAllTasksPerHour();
          dailyActivityData = perHour.map((ms, i) => ({
            day: `${i}:00`,
            hours: ms / (1000 * 60 * 60)
          }));
        } else {
          const perDay = await totalTimeActiveForAllTasksDaily({period: periodOption.functionInput});
          dailyActivityData = Object.entries(perDay)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .map(([date, ms]) => ({
              day: date,
              hours: ms / (1000 * 60 * 60)
            }));
        }

        setTimeByTask(dailyActivityData);

        if (periodOption.functionInput === "today") {
          total = await totalTimeActiveForAllTask({period: "today"});
          productive = await getMostProductive({ period: "today" });

          const streakData = await getMostActiveStreak({ period: "today" });
          streak = streakData.maxStreak;
          totalTaskInStreak = streakData.maxTotalTaskActiveDuringStreak;

          activeTimes = await getTaskStartStats({ period: "today" });
        } else {
          total = await totalTimeActiveForAllTask({period: periodOption.functionInput});
          productive = await getMostProductive({period: periodOption.functionInput});

          const streakData = await getMostActiveStreak({period: periodOption.functionInput});
          streak = streakData.maxStreak;
          totalTaskInStreak = streakData.maxTotalTaskActiveDuringStreak;

          activeTimes = await getTaskStartStats({period: periodOption.functionInput});

        }

        const mostProductiveValue =
          periodOption.functionInput === "today"
            ? "-"
            : periodOption.functionInput === "thisWeek"
              ? (productive ? productive.weekday : "-")
              : (productive ? productive.day : "-");

        const totalHours = total / (1000 * 60 * 60);
        const roundedHours = Math.round(totalHours);
        setCardsData([
          {
            name: "Total Time Tracked",
            value: total,
            icon: Clock,
            bg: "bg-gradient-to-r from-violet-500 via-purple-400 to-pink-300",
            desc: totalHours >= 1
              ? `Tracking ${roundedHours} ${roundedHours === 1 ? "hour" : "hours"} in this period`
              : "Tracking less than 1 hour in this period"
          },
          {
            name: "Most Productive Day",
            value: mostProductiveValue,
            icon: Calendar,
            bg: "bg-gradient-to-r from-cyan-500 to-blue-500",
            desc: periodOption.functionInput === "today"
              ? "-"
              : `Tracking ${productive.count} ${productive.count === 1 ? "time interval" : "time intervals"}`
          },
          {
            name: "Most Active Streak",
            value: streak,
            icon: TrendingUp,
            bg: "bg-gradient-to-br from-pink-500 to-red-400",
            desc:
              `${totalTaskInStreak} tasks active during the longest streak`
          },
          {
            name: "Total Tasks Active",
            value: activeTimes.totalActiveStarts,
            icon: CircleCheckBig,
            bg: "bg-gradient-to-r from-teal-400 to-lime-200",
            desc: (periodOption.functionInput === "today" ? "-" : Math.round(activeTimes.avgTasksPerDay) + (Math.round(activeTimes.avgTasksPerDay) > 1 ? " tasks/day avg" : " task/day avg"))
          }
        ]);

        // ---- Time by Tag ----
        const tagTotals = await totalTimeActiveForEachTag(periodOption.functionInput);
        const tagData = tags
          .filter(tag => tagTotals[tag._id] > 0)
          .map((tag, i) => ({
            name: tag.title,
            value: tagTotals[tag._id],
            color: `hsl(${(i * 137.5) % 360}, 70%, 55%)`
          }));
        setTimeByTag(tagData);

      } catch (err) {
        console.error(err);
      }
    }

    if (loading || !user) return;

    fetchStatistics();
  }, [periodOption, tasks, timestamps, tags, loading, user]);


  const [isExpanded, setIsExpanded] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const { dateBarChart, setDateBarChart } = useContext(IntervalContext);
  const [dailyChartData, setDailyChartData] = useState([]);

  const [isExpandedDateInput, setIsExpandedDateInput] = useState(false);

  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const onSuccess = (message) => setNotification({ show: true, message, type: 'success' });
  const onError = (message) => setNotification({ show: true, message, type: 'error' });

  const handleApplyDailyChart = async () => {
    if (!selectedTask) {
      onError("Please select a task!")
      return;
    }
    if (new Date(dateBarChart.start) >= new Date(dateBarChart.end)) {
      onError("Start time must be before end time!")
      return;
    }
    if (!dateBarChart.start || !dateBarChart.end) {
      onError("Please select both start and end times!")
      return;
    }
    try {
      const result = await getTaskDailyBarChart({
        task: selectedTask._id,
        start: dateBarChart.start,
        end: dateBarChart.end
      });

      const formattedData = result.dailyData.map(item => ({
        displayDate: item.date,
        hours: item.hours
      }));

      setDailyChartData(formattedData);
    } catch (err) {
      console.error(err);
      onError("Failed to load chart data.");
    }
  }

  return (
    <div className={`${bgClass} text-white p-6 xs:p-8 rounded-lg h-full overflow-y-auto`}>

      {/* ----- Active time trackers header ----- */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-gradient-to-b from-purple-400 via-blue-400 to-cyan-400 rounded-full"></div>
          <div className="flex flex-col">
            <p className='text-lg xs:text-2xl font-semibold bg-gradient-to-r from-lime-100 via-cyan-500 to-blue-400 bg-clip-text text-transparent'>Active Time Trackers</p>
            <p className='text-sm text-neutral-500'>Track every second. Master your time.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">

          <DropdownMenu onOpenChange={setIsExpanded}>
            <DropdownMenuTrigger asChild>
              <button
                className='px-4 py-2 bg-neutral-700 rounded-md xs:rounded-lg flex items-center gap-2 hover:bg-neutral-600 transition-colors duration-300 cursor-pointer'
              >
                <span className="text-sm xs:text-base">{periodOption.label}</span>
                <ChevronDown
                  size={18}
                  className={`w-5 h-5 text-neutral-400 transform transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="bottom"
              align="end"
              className="mt-3 flex items-center w-[120px] flex-wrap"
              onMouseLeave={() => setIsExpanded(false)} // Reset khi menu đóng
            >
              {period.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.functionInput}
                  onSelect={(e) => e.preventDefault()}
                  checked={periodOption.functionInput === option.functionInput}
                  onCheckedChange={() => setPeriodOption(option)}
                  className="cursor-pointer w-full"
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>

      {/* ----- Statistic & Insight title ----- */}
      <div className="mb-6">
        <p className="text-2xl md:text-3xl font-medium text-white">
          Statistic &{' '}
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Insight
          </span>
        </p>
        <p className="text-neutral-500 text-sm mt-1">
          Discover trends and productivity patterns across all your tasks and tags.
        </p>
      </div>

      {/* ----- Statistic cards ----- */}
      <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-4 gap-6 mt-6 xs:mt-10">
        {cardsData.map(item => (
          <div key={item.name}
            style={{ boxShadow: `0 -6px 12px rgba(168,85,247,0.4), 0 4px 12px rgba(6,182,212,0.4), -2px 0 6px rgba(168,85,247,0.2), 2px 0 6px rgba(6,182,212,0.2) ` }}
            className="flex items-start bg-neutral-800 p-6 rounded-2xl transition-all hover:bg-neutral-700/60">
            <div className="flex flex-col gap-4">
              <div className="flex flex-row items-center gap-3 xs:gap-4">
                <div className={`flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 rounded-lg ${item.bg || 'bg-neutral-700'}`}>
                  {item.icon && <item.icon className="w-5 h-5 xs:w-6 xs:h-6 text-white" />}
                </div>
                <p className="text-lg xs:text-xl font-semibold text-white text-right">
                  {typeof item.value === "number" && item.name !== "Total Tasks Active"
                    ? formattedTime(item.value)
                    : item.value}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-neutral-400">{item.name}</p>
                <p className="text-sm text-rose-300">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ----- Statistic graphs ----- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {/* Pie Chart */}
        <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Tag className="w-5 h-5 text-cyan-400" />
            Time by Tags
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={timeByTag}
                cx="50%"
                cy="50%"
                innerRadius="50%"
                outerRadius="80%"
                paddingAngle={5}
                dataKey="value"
                minAngle={5}
              >
                {timeByTag.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload
                    return (
                      <div
                        className="p-2 rounded-lg shadow-md"
                        style={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      >
                        <p className="text-white text-sm font-semibold">{item.name}</p>
                        <p className="text-cyan-400 text-xs">
                          {formattedTime(item.value)}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />

            </PieChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-2">
            {timeByTag.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Activity Bar Chart */}
        <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Daily Activity
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeByTask}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value) => formattedTime(value * 3600 * 1000)}
              />

              <Bar dataKey="hours" name="Times" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </BarChart>

          </ResponsiveContainer>
          {/* Gradient Legend for BarChart */}
          <div className="flex items-center gap-2 mt-4">
            {/* Gradient bar */}
            <div
              className="h-3 w-6 rounded-full"
              style={{ background: 'linear-gradient(to right, #8B5CF6, #06B6D4)' }}
            ></div>
            {/* Label */}
            <span className="text-sm text-gray-400">Time intervals</span>
          </div>

        </div>

      </div>

      {/* ----- Daily Activity Chart for Selected Task ----- */}
      <div className="mt-10 bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-8">
          <ChartColumn className="w-5 h-5 text-amber-400" />
          Selected Task Daily Activity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col gap-3">
            <label className="text-sm text-neutral-400 font-medium">Select task</label>
            <DropdownMenu onOpenChange={setIsExpandedDateInput}>
              <DropdownMenuTrigger asChild>
                <button className="px-3 xs:px-5 w-full py-2 ml-auto bg-gradient-to-r border border-neutral-700 from-neutral-500 to-orange-400 rounded-lg flex items-center gap-2 hover:from-neutral-400 hover:to-orange-300 transition-colors duration-300 cursor-pointer">
                  <span className="flex-1 text-base truncate text-left overflow-hidden whitespace-nowrap">
                    {selectedTask ? selectedTask.title.charAt(0).toUpperCase() + selectedTask.title.slice(1) : "-- Select a task --"}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`w-5 h-5 text-neutral-500 transform transition-transform ${isExpandedDateInput ? 'rotate-180' : 'rotate-0'}`}
                  />
                </button>


              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" className="max-h-[200px] mt-3 flex max-w-[200px] flex-wrap">
                {tasks.map((task) => (
                  <DropdownMenuCheckboxItem
                    key={task._id}
                    onSelect={(e) => e.preventDefault()}
                    checked={selectedTask?._id === task._id}
                    onCheckedChange={() => setSelectedTask(task)}
                    className="cursor-pointer w-full"
                  >
                    {task.title.charAt(0).toUpperCase() + task.title.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}

              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <DateTimeInput
            label="Start Date"
            value={dateBarChart.start}
            onChange={(val) => setDateBarChart(prev => ({ ...prev, start: val }))}
          />

          <DateTimeInput
            label="End Date"
            value={dateBarChart.end}
            onChange={(val) => setDateBarChart(prev => ({ ...prev, end: val }))}
          />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleApplyDailyChart}
            className="ml-auto px-6 py-2 bg-gradient-to-r from-teal-500 to-lime-200 rounded-lg text-white font-medium hover:from-teal-600 hover:to-lime-300 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>

        {dailyChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="displayDate"
                stroke="#9ca3af"
                angle={dailyChartData.length > 15 ? -45 : 0}
                textAnchor={dailyChartData.length > 15 ? "end" : "middle"}
                height={dailyChartData.length > 15 ? 60 : 30}
              />
              <YAxis
                stroke="#9ca3af"
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                formatter={(value) => formattedTime(value * 3600 * 1000)}
              />
              <Bar
                dataKey="hours"
                name="Times"
                fill="url(#dailyGradient)"
                radius={[8, 8, 0, 0]}
                animationDuration={800}
              />
              <defs>
                <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Clock9 className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No data to display</p>
            <p className="text-sm">
              {!selectedTask ? 'Select a task and date range' : 'Click "Apply" to generate the chart'}
            </p>
          </div>
        )}
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

export default Statistics
