import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import MissionControl from './components/MissionControl'
import './styles/globals.css'
import './styles/landing.css'
import './styles/dashboard.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/mission-control" element={<MissionControl />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
