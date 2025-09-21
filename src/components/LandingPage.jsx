import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Satellite, Globe, Activity, Play } from 'lucide-react'

const LandingPage = () => {
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleEnterMissionControl = () => {
    navigate('/mission-control')
  }

  return (
    <div className="real-photo-landing">
      {/* Real Space Photo Background */}
      <div className="space-photo-background"></div>
      <div className="photo-overlay"></div>

      {/* NASA Logo */}
      <motion.div
        className="nasa-logo-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : -30 }}
        transition={{ duration: 1.2 }}
      >
        <div className="logo-container">
          <div className="nasa-badge">
            <Satellite className="w-6 h-6" />
          </div>
          <span className="nasa-title">DSL SATOPS</span>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="main-content-container">
        <motion.div
          className="hero-text-section"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 0.95 }}
          transition={{ duration: 1.8, delay: 0.4 }}
        >
          <h1 className="main-headline">EYES ON THE SATELLITES</h1>
          <p className="main-description">
            Fly along with Earth's orbital infrastructure in real-time, monitor vital satellite 
            operations like GPS, Weather, and Communications, and see live mission data in an 
            immersive, 3D environment.
          </p>
        </motion.div>

        <motion.div
          className="launch-section"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 40 }}
          transition={{ duration: 1.5, delay: 1.2 }}
        >
          <button className="launch-button" onClick={handleEnterMissionControl}>
            <Play className="w-5 h-5" />
            <span>LAUNCH MISSION CONTROL</span>
          </button>
        </motion.div>
      </div>

      {/* Loading Indicator */}
      {!loaded && (
        <div className="loading-container">
          <div className="loading-circle"></div>
          <span>LOADING</span>
        </div>
      )}
    </div>
  )
}

export default LandingPage
