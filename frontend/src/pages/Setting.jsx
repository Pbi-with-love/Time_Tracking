// src/pages/Setting.jsx
import React, { useContext } from "react";
import { SettingsContext } from "../context/SettingsContext";
import { Sun, Moon, Layers, Layers2 } from "lucide-react";
  
const Setting = () => {
  const { theme, toggleTheme, alternative, toggleAlternative, loading } =
    useContext(SettingsContext);

  const bgClass = theme === 'dark'
    ? 'bg-neutral-900'
    : '';

  if (loading) return <div>Loading settings...</div>;


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
      {/* ----- Option title ----- */}
      <div className="mb-6">
        <p className="text-2xl md:text-3xl font-medium text-white">
          Settings{' '}
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Option
          </span>
        </p>
        <p className="text-neutral-500 text-sm mt-1">
          Configure theme and task mode preferences.
        </p>
      </div>


      {/* Toggle controls */}
      <div className="flex flex-col items-center xs:flex-row gap-4 mt-4">
        {/* Theme toggle */}
        <div className="relative w-fit flex bg-neutral-800 rounded-lg py-1 cursor-pointer">
          {/* slider */}
          <div
            className={`w-1/2 absolute top-1 bottom-1 rounded-md transition-all duration-300 bg-gradient-to-b 
            from-purple-400 via-blue-400 to-cyan-400 ${theme === "light" ? "left-0" : "left-1/2"
              }`}
          ></div>

          {["light", "dark"].map((item) => (
            <div
              key={item}
              onClick={() => toggleTheme(item)}
              className={`text-center z-10 py-2 px-4 w-32 text-sm font-medium transition-colors duration-300 
                ${theme === item ? "text-white" : "text-gray-300"} flex items-center justify-center gap-2`}
            >
              {item === "light" ? <Sun /> : <Moon />}
              {item === "light" ? "Light Theme" : "Dark Theme"}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Setting;

