import React, { useEffect, useState, useContext } from 'react'
import avatar from '../assets/avatar.jpg';
import { Zap, AlarmClockCheck, NotepadText, Handshake } from 'lucide-react';
import { SettingsContext } from '../context/SettingsContext'


const About = () => {
    const { theme } = useContext(SettingsContext);
    const bgClass = theme === 'dark' 
    ? 'bg-neutral-900' 
    : '';

  const [cardsData, setCardsData] = useState([])
  useEffect(() => {
    setCardsData([
      {
        name: "Efficient",
        icon: AlarmClockCheck,
        bg: "bg-gradient-to-r from-violet-500 via-purple-400 to-pink-300",
        desc: "Optimize your time and focus on what truly matters, boosting productivity effortlessly."
      },
      {
        name: "Fast",
        icon: Zap,
        bg: "bg-gradient-to-r from-cyan-500 to-blue-500",
        desc: "Track your tasks and active time instantly with minimal clicks and maximum speed."
      },
      {
        name: "Management",
        icon: NotepadText,
        bg: "bg-gradient-to-br from-pink-500 to-red-400",
        desc: "Organize tasks, monitor progress, and gain clear insights into your daily activities."
      },
      {
        name: "Friendly UI",
        icon: Handshake,
        bg: "bg-gradient-to-r from-teal-400 to-lime-200",
        desc: "User-friendly interface designed for ease of use, making time tracking simple and enjoyable."
      }
    ]);
  }, [])


  return (
    <div className={`${bgClass} text-white p-6 xs:p-8 rounded-lg h-full overflow-y-auto`}>
      {/* ----- Header ----- */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-gradient-to-b from-purple-400 via-blue-400 to-cyan-400 rounded-full"></div>
          <div className="flex flex-col">
            <p className='text-lg xs:text-2xl font-semibold bg-gradient-to-r from-lime-100 via-cyan-500 to-blue-400 bg-clip-text text-transparent'>Active Time Trackers</p>
            <p className='text-sm text-neutral-500'>Track every second. Master your time.</p>
          </div>
        </div>
      </div>

      {/* ----- About me main content ----- */}
      <div className="flex flex-col items-start mb-6 gap-3">
        {/* ----- About me title ----- */}
        <div className="mb-6">
          <p className="text-2xl md:text-3xl font-medium text-white">
            About{' '}
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Me
            </span>
          </p>
          <p className="text-neutral-500 text-sm mt-1">
            Get to know me and learn how to make the most of this app.
          </p>
        </div>

        {/* ----- About me description ----- */}
        <div className="flex gap-6 flex-col items-center xs:flex-row">
          <div className="h-[160px] w-[160px] xs:mr-6 shrink-0">
            <img style={{ boxShadow: `0 -6px 12px rgba(168,85,247,0.4), 0 4px 12px rgba(6,182,212,0.4), -2px 0 6px rgba(168,85,247,0.2), 2px 0 6px rgba(6,182,212,0.2) ` }} src={avatar} alt="My Avatar" className="rounded-full object-cover w-full h-full" />
          </div>
          <div className="flex flex-col justify-center max-xs:mt-4 max-xs:text-center text-lg text-white">
            <p>Hello! I'm Tai Mai, a software engineering student at TAMK.</p>
            <br />
            <p>This web app helps you track your active time on tasks and analyze productivity trends.</p>
          </div>
        </div>
      </div>

      {/* ----- Features cards ----- */}
      <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-4 gap-6 w-full mt-15 mb-6">
        {cardsData.map(item => (
          <div key={item.name}
            style={{ boxShadow: `0 -6px 12px rgba(168,85,247,0.4), 0 4px 12px rgba(6,182,212,0.4), -2px 0 6px rgba(168,85,247,0.2), 2px 0 6px rgba(6,182,212,0.2) ` }}
            className="flex items-start bg-neutral-800 p-6 rounded-2xl transition-all hover:bg-neutral-700/60">
            <div className="flex flex-col gap-4">
              <div className="flex flex-row items-center justify-start gap-3 xs:gap-3">
                <div className={`flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 rounded-lg ${item.bg || 'bg-neutral-700'}`}>
                  {item.icon && <item.icon className="w-5 h-5 xs:w-6 xs:h-6 text-white" />}
                </div>
                <p className="text-lg xs:text-xl font-semibold text-white text-right">
                  {item.name}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-rose-300">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ----- Instruction Document ----- */}
      <div className="flex flex-col items-start mt-16 mb-10 gap-6">
        <p className='text-cyan-400 text-2xl md:text-3xl font-medium'>Instruction</p>

        <div className="space-y-6 w-full">
          {/* Dashboard */}
          <div className="bg-neutral-800/60 p-5 rounded-xl border border-neutral-700 hover:bg-neutral-800 transition-all">
            <p className="text-lg font-semibold text-white mb-2">Dashboard Page</p>
            <div className="text-sm text-neutral-400 space-y-2">
              <p>• Displays all your tasks and allows you to start or stop tracking time for any task instantly.</p>
              <p>•You can use the New Task/Tags button to create a new task or tag.
                Use the … button at the top-right corner of a task card to edit or delete a task.
                Click the Tags button to view all available tags — you can also click the … button  at the top-right corner of a tag card to edit or delete it.</p>
              <p>• You can sort or filter tasks using the buttons, and drag and drop task cards to rearrange them as you like.
                Note: When you perform drag and drop, any active sort order will be cleared.
              </p>
              <p>• You can view four types of average statistics for each task:
                Average Total Time shows the average active duration per day,
                Average Start Time indicates the typical time you begin the task,
                Average End Time represents the usual time you finish the task,
                and Average Break Time displays the average duration between two working sessions of that task.</p>
            </div>
          </div>

          {/* View Page */}
          <div className="bg-neutral-800/60 p-5 rounded-xl border border-neutral-700 hover:bg-neutral-800 transition-all">
            <p className="text-lg font-semibold text-white mb-2">View Page</p>
            <div className="text-sm text-neutral-400 space-y-2">
              <p>• You can choose a specific time period, then click Apply Interval in the Tasks of Interest or Tags of Interest section to view the summary for the selected period.</p>
              <p>• You can choose a specific time period and a specific task, then click Apply Interval in the Task Activity Details section to view the list of activity intervals for that task.
                You can also click New Interval to create a new active time interval for the selected task(or delete it). Each interval must be unique — if there is any overlap, an error warning will appear.
                Additionally, you can click the … button at the top-right corner of an activity card to modify the start time or end time of that interval.
                If overlapping intervals are detected, an error warning will be displayed so you can easily understand what went wrong, you can click cancel button (from the left of the save change button) to reset</p>
            </div>
          </div>

          {/* Statistics Page */}
          <div className="bg-neutral-800/60 p-5 rounded-xl border border-neutral-700 hover:bg-neutral-800 transition-all">
            <p className="text-lg font-semibold text-white mb-2">Statistics Page</p>
            <div className="text-sm text-neutral-400 space-y-2">
              <p>• You can select the top-right period to view statistical calculations and graph demonstrations for the time range you choose.</p>
              <p>• You can choose a specific time period and a specific task, then click Apply in the Selected Task Daily Activity section to view a bar chart visualizing the active time of that task during the selected period.</p>
            </div>
          </div>

          {/* Setting Page */}
          <div className="bg-neutral-800/60 p-5 rounded-xl border border-neutral-700 hover:bg-neutral-800 transition-all">
            <p className="text-lg font-semibold text-white mb-2">Setting Page</p>
            <div className="text-sm text-neutral-400 space-y-2">
              <p>• You can choose a different theme color or enable multi-task/single-task mode on the Settings page.</p>
            </div>
          </div>

          {/* Author and License Info */}
          <div className="bg-neutral-800/60 p-5 rounded-xl border border-neutral-700 hover:bg-neutral-800 transition-all">
            <p className="text-lg font-semibold text-white mb-2">Author & Content Information</p>
            <div className="text-sm text-neutral-400 space-y-2">
              <p>• Author: <span className="text-cyan-400 font-medium">Tai Mai</span>, Software Engineering Student at TAMK.</p>
              <p>• The UI and icons (from Lucide React) are open-source, and Claude AI was used to suggest some layouts; all are used under their respective licenses.</p>
              <p>• The avatar image and all illustrations used in this app are created by the author.</p>
            </div>
          </div>

          {/* AI use */}
          <div className="bg-neutral-800/60 p-5 rounded-xl border border-neutral-700 hover:bg-neutral-800 transition-all">
            <p className="text-lg font-semibold text-white mb-2">AI tools</p>
            <div className="text-sm text-neutral-400 space-y-2">
              <p>• I used Claude AI to suggest some UI structures and ChatGPT for the calculation functions. The basic idea is that I first created a structured workflow for each function (something similar to thinking through a solution for a LeetCode problem) and then used ChatGPT to implement it based on my ideas.</p>
            </div>
          </div>
        </div>
      </div>



    </div>
  )
}

export default About