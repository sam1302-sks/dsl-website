import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  AlertCircle,
  Calendar,
  Filter
} from 'lucide-react'

const MissionAnalyticsPanel = ({ missions, satellites, selectedSatellite }) => {
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  const getMissionIcon = (type) => {
    switch (type) {
      case 'imaging': return <Target className="w-4 h-4" />
      case 'monitoring': return <BarChart3 className="w-4 h-4" />
      case 'communication': return <Radio className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'executing': return <PlayCircle className="w-4 h-4 text-mission-warning" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-mission-success" />
      case 'paused': return <PauseCircle className="w-4 h-4 text-mission-accent" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-mission-error" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getProgressColor = (progress) => {
    if (progress >= 90) return 'bg-mission-success'
    if (progress >= 60) return 'bg-mission-accent'
    if (progress >= 30) return 'bg-mission-warning'
    return 'bg-mission-error'
  }

  const formatDuration = (startTime, endTime) => {
    const duration = endTime ? endTime.getTime() - startTime.getTime() : Date.now() - startTime.getTime()
    const hours = Math.floor(duration / 3600000)
    const minutes = Math.floor((duration % 3600000) / 60000)
    return `${hours}h ${minutes}m`
  }

  const filteredMissions = missions.filter(mission => {
    if (filter === 'all') return true
    return mission.status === filter
  })

  const sortedMissions = filteredMissions.sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return b.startTime.getTime() - a.startTime.getTime()
      case 'progress':
        return b.progress - a.progress
      case 'satellite':
        return a.satellite.localeCompare(b.satellite)
      default:
        return 0
    }
  })

  return (
    <div className="mission-analytics-panel">
      {/* Panel Header */}
      <div className="analytics-header">
        <h3 className="section-title">
          <BarChart3 className="w-4 h-4 mr-2" />
          Mission Analytics
        </h3>
        
        <div className="header-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="control-select"
          >
            <option value="all">All Missions</option>
            <option value="executing">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="failed">Failed</option>
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="control-select"
          >
            <option value="recent">Recent First</option>
            <option value="progress">By Progress</option>
            <option value="satellite">By Satellite</option>
          </select>
        </div>
      </div>

      {/* Mission Statistics */}
      <div className="mission-stats">
        <div className="stat-card">
          <div className="stat-value">{missions.length}</div>
          <div className="stat-label">Total Missions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-mission-warning">
            {missions.filter(m => m.status === 'executing').length}
          </div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-mission-success">
            {missions.filter(m => m.status === 'completed').length}
          </div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-mission-accent">
            {Math.round(missions.reduce((sum, m) => sum + m.progress, 0) / missions.length)}%
          </div>
          <div className="stat-label">Avg Progress</div>
        </div>
      </div>

      {/* Mission List */}
      <div className="mission-list">
        <AnimatePresence>
          {sortedMissions.map((mission, index) => (
            <motion.div
              key={mission.id}
              className="mission-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Mission Header */}
              <div className="mission-header">
                <div className="mission-info">
                  <div className="mission-icon">
                    {getMissionIcon(mission.type)}
                  </div>
                  <div className="mission-details">
                    <div className="mission-id">{mission.id}</div>
                    <div className="mission-type-label">{mission.type.toUpperCase()}</div>
                  </div>
                </div>
                <div className="mission-status">
                  {getStatusIcon(mission.status)}
                </div>
              </div>

              {/* Mission Body */}
              <div className="mission-body">
                <div className="mission-target">
                  <span className="target-label">Target:</span>
                  <span className="target-value">{mission.target}</span>
                </div>
                
                <div className="mission-satellite">
                  <span className="satellite-label">Satellite:</span>
                  <span className="satellite-value">{mission.satellite}</span>
                </div>

                {/* Progress Bar */}
                <div className="progress-section">
                  <div className="progress-header">
                    <span className="progress-label">Progress</span>
                    <span className="progress-percentage">{mission.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className={`progress-fill ${getProgressColor(mission.progress)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${mission.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>

                {/* Timing Information */}
                <div className="timing-info">
                  <div className="time-item">
                    <Calendar className="w-3 h-3" />
                    <span className="time-label">Started:</span>
                    <span className="time-value">
                      {mission.startTime.toLocaleDateString()} {mission.startTime.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="time-item">
                    <Clock className="w-3 h-3" />
                    <span className="time-label">Duration:</span>
                    <span className="time-value">
                      {formatDuration(mission.startTime, mission.estimatedCompletion)}
                    </span>
                  </div>

                  {mission.estimatedCompletion && (
                    <div className="time-item">
                      <TrendingUp className="w-3 h-3" />
                      <span className="time-label">ETA:</span>
                      <span className="time-value">
                        {mission.estimatedCompletion.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mission Actions */}
              <div className="mission-actions">
                <button className="action-button view">
                  <Target className="w-3 h-3" />
                  View on Globe
                </button>
                {mission.status === 'executing' && (
                  <button className="action-button pause">
                    <PauseCircle className="w-3 h-3" />
                    Pause
                  </button>
                )}
              </div>

              {/* Status Indicator */}
              <div className={`status-stripe ${mission.status}`}></div>
            </motion.div>
          ))}
        </AnimatePresence>

        {sortedMissions.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <BarChart3 className="w-12 h-12 opacity-50" />
            </div>
            <div className="empty-title">No Missions Found</div>
            <div className="empty-description">
              {filter === 'all' 
                ? 'No missions have been created yet.'
                : `No ${filter} missions found.`
              }
            </div>
          </div>
        )}
      </div>

      {/* Mission Insights */}
      {missions.length > 0 && (
        <div className="mission-insights">
          <h4 className="insights-title">Mission Insights</h4>
          <div className="insights-grid">
            <div className="insight-item">
              <div className="insight-label">Most Active Satellite</div>
              <div className="insight-value">
                {Object.entries(
                  missions.reduce((acc, mission) => {
                    acc[mission.satellite] = (acc[mission.satellite] || 0) + 1
                    return acc
                  }, {})
                ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
              </div>
            </div>
            
            <div className="insight-item">
              <div className="insight-label">Average Mission Time</div>
              <div className="insight-value">
                {Math.round(
                  missions
                    .filter(m => m.estimatedCompletion)
                    .reduce((sum, m) => sum + (m.estimatedCompletion.getTime() - m.startTime.getTime()), 0) 
                    / missions.filter(m => m.estimatedCompletion).length / 3600000
                )} hours
              </div>
            </div>
            
            <div className="insight-item">
              <div className="insight-label">Success Rate</div>
              <div className="insight-value text-mission-success">
                {Math.round(
                  missions.filter(m => m.status === 'completed').length / missions.length * 100
                )}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MissionAnalyticsPanel
