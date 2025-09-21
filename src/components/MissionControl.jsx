import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Satellite, 
  Activity, 
  Terminal as TerminalIcon,
  Globe2,
  Zap,
  Camera,
  Navigation,
  BarChart3,
  Clock
} from 'lucide-react'
import PhotorealisticEarthViewer from './PhotorealisticEarthViewer'
import CommandInterface from './CommandInterface'
import FleetStatusPanel from './FleetStatusPanel'
import MissionAnalyticsPanel from './MissionAnalyticsPanel'
import DataViewer from './DataViewer'

const MissionControl = () => {
  const [satellites, setSatellites] = useState([])
  const [selectedSatellite, setSelectedSatellite] = useState(null)
  const [activeMissions, setActiveMissions] = useState([])
  const [systemMetrics, setSystemMetrics] = useState({
    operational: true,
    totalSatellites: 0,
    activeMissions: 0,
    dataRate: 0,
    powerEfficiency: 98.5,
    lastUpdate: new Date()
  })
  const [commandHistory, setCommandHistory] = useState([])
  const [analyticsData, setAnalyticsData] = useState(null)
  
  const earthViewerRef = useRef(null)

  // Initialize realistic satellite constellation
  useEffect(() => {
    const constellation = [
      {
        id: 'ISS',
        name: 'International Space Station',
        type: 'crewed',
        position: { lat: 25.7617, lon: -80.1918, alt: 408 },
        velocity: 27600,
        status: 'active',
        health: 98,
        power: 85.3,
        batteryLife: 18.2,
        dataRate: 125.8,
        mission: null,
        lastContact: new Date(),
        model3D: 'iss-model'
      },
      {
        id: 'LANDSAT8',
        name: 'Landsat 8',
        type: 'earth-observation',
        position: { lat: -15.7975, lon: 47.4737, alt: 705 },
        velocity: 24890,
        status: 'active',
        health: 95,
        power: 92.1,
        batteryLife: 22.7,
        dataRate: 384.0,
        mission: 'imaging',
        target: { lat: -15.7975, lon: 47.4737, name: 'Madagascar Forest' },
        lastContact: new Date(),
        model3D: 'landsat-model'
      },
      {
        id: 'GOES16',
        name: 'GOES-16',
        type: 'weather',
        position: { lat: 0, lon: -75.2, alt: 35786 },
        velocity: 11070,
        status: 'active',
        health: 97,
        power: 88.7,
        batteryLife: 45.1,
        dataRate: 267.3,
        mission: 'monitoring',
        target: { lat: 25.7617, lon: -80.1918, name: 'Hurricane Watch' },
        lastContact: new Date(),
        model3D: 'goes-model'
      },
      {
        id: 'SENTINEL2A',
        name: 'Sentinel-2A',
        type: 'earth-observation',
        position: { lat: 37.7749, lon: -122.4194, alt: 786 },
        velocity: 25200,
        status: 'active',
        health: 94,
        power: 91.2,
        batteryLife: 19.8,
        dataRate: 520.0,
        mission: null,
        lastContact: new Date(),
        model3D: 'sentinel-model'
      }
    ]
    
    setSatellites(constellation)
    setActiveMissions([
      {
        id: 'IMG_001',
        type: 'imaging',
        satellite: 'LANDSAT8',
        target: 'Madagascar Forest',
        status: 'executing',
        progress: 67,
        startTime: new Date(Date.now() - 1800000),
        estimatedCompletion: new Date(Date.now() + 900000)
      },
      {
        id: 'MON_002',
        type: 'monitoring',
        satellite: 'GOES16',
        target: 'Hurricane Watch',
        status: 'active',
        progress: 100,
        startTime: new Date(Date.now() - 3600000),
        estimatedCompletion: null
      }
    ])
  }, [])

  // Real-time system updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update satellite positions (simulate orbital motion)
      setSatellites(prev => prev.map(sat => {
        const newLon = sat.position.lon + (sat.velocity / sat.position.alt) * 0.001
        return {
          ...sat,
          position: {
            ...sat.position,
            lon: newLon > 180 ? newLon - 360 : newLon
          },
          power: Math.max(75, sat.power + (Math.random() - 0.5) * 2),
          dataRate: sat.dataRate + (Math.random() - 0.5) * 10,
          lastContact: new Date()
        }
      }))

      // Update system metrics
      setSystemMetrics(prev => ({
        ...prev,
        totalSatellites: satellites.length,
        activeMissions: activeMissions.filter(m => m.status === 'executing').length,
        dataRate: satellites.reduce((sum, sat) => sum + sat.dataRate, 0),
        powerEfficiency: 95 + Math.random() * 5,
        lastUpdate: new Date()
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [satellites, activeMissions])

  const handleCommand = async (command) => {
    const timestamp = new Date()
    const commandEntry = {
      id: Date.now(),
      command,
      timestamp,
      status: 'executing',
      result: null
    }

    setCommandHistory(prev => [...prev, commandEntry])

    // Process DSL commands
    try {
      const result = await processDSLCommand(command)
      setCommandHistory(prev => 
        prev.map(cmd => 
          cmd.id === commandEntry.id 
            ? { ...cmd, status: 'success', result }
            : cmd
        )
      )
    } catch (error) {
      setCommandHistory(prev => 
        prev.map(cmd => 
          cmd.id === commandEntry.id 
            ? { ...cmd, status: 'error', result: error.message }
            : cmd
        )
      )
    }
  }

  const processDSLCommand = async (command) => {
    const parts = command.toLowerCase().split(' ')
    
    switch (parts[0]) {
      case 'track':
        if (parts[1]) {
          const sat = satellites.find(s => s.id.toLowerCase() === parts[1])
          if (sat) {
            setSelectedSatellite(sat)
            earthViewerRef.current?.focusOnSatellite(sat)
            return `Now tracking ${sat.name}`
          }
        }
        throw new Error('Satellite not found')

      case 'taskimaging':
        if (parts[1]) {
          const sat = satellites.find(s => s.id.toLowerCase() === parts[1])
          if (sat) {
            const newMission = {
              id: `IMG_${Date.now()}`,
              type: 'imaging',
              satellite: sat.id,
              target: 'User Defined Target',
              status: 'executing',
              progress: 0,
              startTime: new Date(),
              estimatedCompletion: new Date(Date.now() + 1800000)
            }
            setActiveMissions(prev => [...prev, newMission])
            return `Imaging mission started for ${sat.name}`
          }
        }
        throw new Error('Invalid satellite for imaging mission')

      case 'getdata':
        if (parts[1]) {
          const sat = satellites.find(s => s.id.toLowerCase() === parts[1])
          if (sat) {
            // Simulate data retrieval
            const mockData = {
              type: 'satellite-image',
              satellite: sat.name,
              timestamp: new Date(),
              resolution: '30m/pixel',
              coverage: '185km x 185km',
              bands: ['Visible', 'NIR', 'SWIR'],
              cloudCover: Math.round(Math.random() * 30),
              quality: 'Excellent'
            }
            setAnalyticsData(mockData)
            return `Data retrieved from ${sat.name}`
          }
        }
        throw new Error('No data available for specified satellite')

      case 'getpowerstatus':
        if (parts[1]) {
          const sat = satellites.find(s => s.id.toLowerCase() === parts[1])
          if (sat) {
            // Generate power prediction chart
            const powerPrediction = Array.from({ length: 24 }, (_, i) => ({
              hour: i,
              power: 75 + Math.sin(i * 0.5) * 15 + Math.random() * 5,
              eclipse: i > 6 && i < 18 ? false : Math.random() > 0.7
            }))
            setAnalyticsData({ type: 'power-chart', data: powerPrediction, satellite: sat.name })
            return `Power status analysis for ${sat.name}`
          }
        }
        throw new Error('Satellite not found for power analysis')

      default:
        throw new Error(`Unknown command: ${parts[0]}`)
    }
  }

  return (
    <div className="mission-control-dashboard">
      {/* LEFT PANEL - Command & Fleet Status */}
      <motion.div 
        className="left-panel"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="panel-header">
          <div className="header-icon">
            <TerminalIcon className="w-5 h-5" />
          </div>
          <div className="header-content">
            <h2 className="header-title">Command & Control</h2>
            <div className="header-status">
              <div className="status-dot online"></div>
              <span>System Operational</span>
            </div>
          </div>
        </div>

        {/* Command Interface */}
        <div className="command-section">
          <CommandInterface 
            onCommand={handleCommand}
            commandHistory={commandHistory}
          />
        </div>

        {/* Fleet Status */}
        <div className="fleet-section">
          <FleetStatusPanel 
            satellites={satellites}
            selectedSatellite={selectedSatellite}
            onSelectSatellite={setSelectedSatellite}
            systemMetrics={systemMetrics}
          />
        </div>
      </motion.div>

      {/* CENTER PANEL - 3D Globe */}
      <motion.div 
        className="center-panel"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        {/* Globe Header */}
        <div className="globe-header">
          <div className="globe-title">
            <Globe2 className="w-5 h-5 mr-2" />
            <span>Photorealistic Earth View</span>
          </div>
          <div className="globe-controls">
            <div className="time-display">
              {systemMetrics.lastUpdate.toLocaleTimeString()} UTC
            </div>
          </div>
        </div>

        {/* 3D Earth Viewer */}
        <div className="globe-container">
          <PhotorealisticEarthViewer
            ref={earthViewerRef}
            satellites={satellites}
            selectedSatellite={selectedSatellite}
            activeMissions={activeMissions}
            onSatelliteSelect={setSelectedSatellite}
          />
        </div>

        {/* Mission Status Overlay */}
        <AnimatePresence>
          {activeMissions.filter(m => m.status === 'executing').length > 0 && (
            <motion.div
              className="mission-overlay"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="mission-header">
                <Activity className="w-4 h-4" />
                <span>Active Missions</span>
              </div>
              {activeMissions.filter(m => m.status === 'executing').map(mission => (
                <div key={mission.id} className="mission-item">
                  <div className="mission-info">
                    <span className="mission-type">{mission.type.toUpperCase()}</span>
                    <span className="mission-target">{mission.target}</span>
                  </div>
                  <div className="mission-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${mission.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{mission.progress}%</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* RIGHT PANEL - Mission & Data Analytics */}
      <motion.div 
        className="right-panel"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        {/* Analytics Header */}
        <div className="panel-header">
          <div className="header-icon">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="header-content">
            <h2 className="header-title">Mission Analytics</h2>
            <div className="header-status">
              <Clock className="w-4 h-4 mr-1" />
              <span>Live Data</span>
            </div>
          </div>
        </div>

        {/* Mission Analytics Panel */}
        <div className="analytics-section">
          <MissionAnalyticsPanel 
            missions={activeMissions}
            satellites={satellites}
            selectedSatellite={selectedSatellite}
          />
        </div>

        {/* Data Viewer */}
        <div className="data-section">
          <DataViewer 
            analyticsData={analyticsData}
            selectedSatellite={selectedSatellite}
          />
        </div>
      </motion.div>
    </div>
  )
}

export default MissionControl
