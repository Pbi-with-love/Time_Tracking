import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TasksAndTagsContextProvider from './context/TasksAndTagsContext'
import IntervalContextProvider from './context/IntervalContext'
import { SettingsProvider } from './context/SettingsContext'
import AuthContextProvider from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthContextProvider>
      <TasksAndTagsContextProvider>
        <IntervalContextProvider>
          <SettingsProvider>
            <App />
          </SettingsProvider>
        </IntervalContextProvider>
      </TasksAndTagsContextProvider>
    </AuthContextProvider>
  </BrowserRouter>
)
