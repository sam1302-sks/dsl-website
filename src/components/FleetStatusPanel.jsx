import React from 'react'
import { motion } from 'framer-motion'
import { 
  Satellite, 
  Activity, 
  Battery, 
  Zap, 
  Radio,
  Clock,
  MapPin,
  Gauge
} from 'lucide-react'

const FleetStatusPanel = ({ satellites, selectedSatellite, onSelectSatellite, systemMetrics }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-mission-success'
      case 'deploying': return 'text-mission-warning'
      case 'inactive': return 'text-mission-error'
      default: return 'text-gray-400'
    }
  }

  const getTypeIcon = (type) => {
    const iconClass = "w-4 h-4"
    switch (type) {
      case 'crewed': return <Activity className={iconClass} />
      case 'weather': return <Radio className={iconClass} />
      case 'earth-observation': return <MapPin className={iconClass} />
      case 'navigation': return <Satellite className={iconClass} />
      case 'communication': return <Zap className={iconClass} />
      default: return <Satellite className={iconClass} />
    }
  }

  const getHealthStatus = (health) => {
    if (health >= 95) return { color: 'text-mission-success', status: 'Excellent' }
    if (health >= 85) return { color: 'text-mission-warning', status: 'Good' }
    if (health >= 75) return { color: 'text-orange-500', status: 'Fair' }
    return { color: 'text-mission-error', status: 'Poor' }
  }

  const formatUptime = (lastContact) => {
    const diff = Date.now() - lastContact.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="fleet-status-panel">
      {/* System Overview */}
      <div className="system-overview">
        <h3 className="section-title">
          <Gauge className="w-4 h-4 mr-2" />
          Fleet Overview
        </h3>
        
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{systemMetrics.totalSatellites}</div>
            <div className="metric-label">Total Assets</div>
          </div>
          <div className="metric-card">
            <div className="metric-value text-mission-success">{satellites.filter(s => s.status === 'active').length}</div>
            <div className="metric-label">Active</div>
          </div>
          <div className="metric-card">
            <div className="metric-value text-mission-accent">{systemMetrics.dataRate.toFixed(1)}</div>
            <div className="metric-label">Mbps Total</div>
          </div>
          <div className="metric-card">
            <div className="metric-value text-mission-success">{systemMetrics.powerEfficiency.toFixed(1)}%</div>
            <div className="metric-label">Efficiency</div>
          </div>
        </div>
      </div>

      {/* Satellite List */}
      <div className="satellite-list">
        <h3 className="section-title">
          <Satellite className="w-4 h-4 mr-2" />
          Active Satellites ({satellites.filter(s => s.status === 'active').length})
        </h3>
        
        <div className="satellite-cards">
          {satellites.map((satellite) => {
            const healthStatus = getHealthStatus(satellite.health)
            return (
              <motion.div
                key={satellite.id}
                className={`satellite-card ${
                  selectedSatellite?.id === satellite.id ? 'selected' : ''
                }`}
                onClick={() => onSelectSatellite(satellite)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                layout
              >
                {/* Card Header */}
                <div className="card-header">
                  <div className="satellite-info">
                    <div className="satellite-icon">
                      {getTypeIcon(satellite.type)}
                    </div>
                    <div className="satellite-details">
                      <div className="satellite-id">{satellite.id}</div>
                      <div className="satellite-type">{satellite.type.replace('-', ' ')}</div>
                    </div>
                  </div>
                  <div className={`status-indicator ${satellite.status}`}>
                    <span className={`status-dot ${getStatusColor(satellite.status)}`}></span>
                    <span className={`status-text ${getStatusColor(satellite.status)}`}>
                      {satellite.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="card-body">
                  {/* Primary Metrics */}
                  <div className="primary-metrics">
                    <div className="metric-row">
                      <div className="metric">
                        <Activity className="w-3 h-3" />
                        <span className="metric-label">Health:</span>
                        <span className={`metric-value ${healthStatus.color}`}>
                          {satellite.health}%
                        </span>
                      </div>
                      <div className="metric">
                        <Battery className="w-3 h-3" />
                        <span className="metric-label">Power:</span>
                        <span className={`metric-value ${satellite.power > 80 ? 'text-mission-success' : 'text-mission-warning'}`}>
                          {satellite.power.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="metric-row">
                      <div className="metric">
                        <MapPin className="w-3 h-3" />
                        <span className="metric-label">Alt:</span>
                        <span className="metric-value text-mission-accent">
                          {satellite.position.alt.toFixed(0)} km
                        </span>
                      </div>
                      <div className="metric">
                        <Zap className="w-3 h-3" />
                        <span className="metric-label">Rate:</span>
                        <span className="metric-value text-mission-accent">
                          {satellite.dataRate.toFixed(1)} Mbps
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Info */}
                  <div className="secondary-info">
                    <div className="info-row">
                      <span className="info-label">Velocity:</span>
                      <span className="info-value">{satellite.velocity.toLocaleString()} km/h</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Last Contact:</span>
                      <span className="info-value">{formatUptime(satellite.lastContact)}</span>
                    </div>
                    {satellite.mission && (
                      <div className="info-row">
                        <span className="info-label">Mission:</span>
                        <span className="info-value text-mission-warning">
                          {satellite.mission.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bars */}
                  <div className="progress-section">
                    <div className="progress-bar-container">
                      <div className="progress-label">
                        <span>Health</span>
                        <span>{satellite.health}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className={`progress-fill ${healthStatus.color.replace('text-', 'bg-')}`}
                          style={{ width: `${satellite.health}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="progress-bar-container">
                      <div className="progress-label">
                        <span>Power</span>
                        <span>{satellite.power.toFixed(1)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className={`progress-fill ${satellite.power > 80 ? 'bg-mission-success' : 'bg-mission-warning'}`}
                          style={{ width: `${satellite.power}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedSatellite?.id === satellite.id && (
                  <motion.div
                    className="selection-indicator"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <div className="selection-pulse"></div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Detailed View for Selected Satellite */}
      {selectedSatellite && (
        <motion.div
          className="detailed-view"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <h3 className="section-title">
            <Clock className="w-4 h-4 mr-2" />
            {selectedSatellite.name} - Details
          </h3>
          
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Latitude:</span>
              <span className="detail-value">{selectedSatellite.position.lat.toFixed(4)}°</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Longitude:</span>
              <span className="detail-value">{selectedSatellite.position.lon.toFixed(4)}°</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Altitude:</span>
              <span className="detail-value">{selectedSatellite.position.alt.toFixed(1)} km</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Velocity:</span>
              <span className="detail-value">{selectedSatellite.velocity.toLocaleString()} km/h</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Battery Life:</span>
              <span className="detail-value">{selectedSatellite.batteryLife?.toFixed(1) || 'N/A'} hrs</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Data Rate:</span>
              <span className="detail-value">{selectedSatellite.dataRate.toFixed(1)} Mbps</span>
            </div>
          </div>

          {selectedSatellite.target && (
            <div className="mission-details">
              <div className="mission-header">Current Mission</div>
              <div className="mission-info">
                <div className="mission-type">{selectedSatellite.mission?.toUpperCase()}</div>
                <div className="mission-target">{selectedSatellite.target.name}</div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default FleetStatusPanel
