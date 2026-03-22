import { useState, useContext } from 'react'
import Sidebar from './components/Sidebar'
import { Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import View from './pages/View'
import Statistics from './pages/Statistics'
import About from './pages/About'
import Setting from './pages/Setting'
import { SettingsContext } from './context/SettingsContext'

const App = () => {
   const { theme } = useContext(SettingsContext);
   const bgClass = theme === 'dark' 
    ? 'bg-black' 
    : '';
  return ( 
    <div className="md:flex">
      <Sidebar />
      <div className={`h-screen flex-1 p-6 ${bgClass} overflow-y-auto`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/view" element={<View />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/about" element={<About />}/>
          {/* <Route path="/setting" element={<Setting />}/> */}
        </Routes>
      </div>
    </div>
  )
}


export default App
