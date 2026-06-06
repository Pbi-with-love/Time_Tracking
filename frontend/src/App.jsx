import { useState, useContext } from 'react'
import Sidebar from './components/Sidebar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import View from './pages/View'
import Statistics from './pages/Statistics'
import About from './pages/About'
import Setting from './pages/Setting'
import Authpage from './pages/Authpage'
import Otppage from './pages/Otppage'
import { SettingsContext } from './context/SettingsContext'

const App = () => {
  const { theme } = useContext(SettingsContext);
  const bgClass = theme === 'dark'
    ? 'bg-black'
    : '';
  const location = useLocation();

  const isAuthPage = location.pathname === "/auth" || location.pathname === "/otppage";

  return isAuthPage ? (
    <Routes>
      <Route path="/auth" element={<Authpage />} />
      <Route path="/otppage" element={<Otppage />} />
    </Routes>
  ) : (
    <div className="md:flex">
      <Sidebar />
      <div className={`h-screen flex-1 p-6 ${bgClass} overflow-y-auto`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/view" element={<View />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/about" element={<About />} />
          {/* <Route path="/setting" element={<Setting />}/> */}
        </Routes>
      </div>
    </div>
  )
}


export default App
