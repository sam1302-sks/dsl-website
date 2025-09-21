import React from 'react'
import { Satellite, Activity, Battery, Thermometer, Wifi } from 'lucide-react'

const SatelliteStatus = ({ satellites, selectedSatellite, onSelectSatellite }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-mission-success'
      case 'deploying': return 'text-mission-warning'
      case 'inactive': return 'text-mission-error'
      default: return 'text-gray-400'
    }
  }

  const getTypeIcon = (type) => {
    const iconClass = "w-3 h-3"
    switch (type) {
      case 'crewed': return <Activity className={iconClass} />
      case 'weather': return <Thermometer className={iconClass} />
      case 'navigation': return <Satellite className={iconClass} />
      case 'communication': return <Wifi className={iconClass} />
      default: return <Satellite className={iconClass} />
    }
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-mission-accent mb-3 flex items-center">
        <Satellite className="w-4 h-4 mr-2" />
        SATELLITE STATUS
      </h3>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {satellites.map((satellite) => (
          <div
            key={satellite.id}
            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
              selectedSatellite?.id === satellite.id
                ? 'bg-mission-accent bg-opacity-10 border-mission-accent'
                : 'bg-mission-panel bg-opacity-50 border-mission-border hover:border-mission-accent hover:border-opacity-50'
            }`}
            onClick={() => onSelectSatellite(satellite)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getTypeIcon(satellite.type)}
                <span className="text-sm font-medium text-mission-text">
                  {satellite.id}
                </span>
              </div>
              <span className={`text-xs font-mono uppercase ${getStatusColor(satellite.status)}`}>
                {satellite.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex items-center space-x-1">
                <Activity className="w-3 h-3 text-gray-400" />
                <span className="text-gray-300">Health:</span>
                <span className={satellite.health > 90 ? 'text-mission-success' : 'text-mission-warning'}>
                  {satellite.health}%
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Battery className="w-3 h-3 text-gray-400" />
                <span className="text-gray-300">Power:</span>
                <span className={satellite.power > 80 ? 'text-mission-success' : 'text-mission-warning'}>
                  {satellite.power}%
                </span>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-400">
              Alt: {satellite.position.alt.toFixed(0)} km | 
              Rate: {satellite.dataRate.toFixed(1)} Mbps
            </div>
          </div>
        ))}
      </div>
      
      {selectedSatellite && (
        <div className="mt-4 p-3 bg-mission-panel rounded-lg border border-mission-border">
          <h4 className="text-sm font-semibold text-mission-accent mb-2">
            {selectedSatellite.name}
          </h4>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-gray-300">Latitude:</span>
              <span className="text-mission-text">{selectedSatellite.position.lat.toFixed(4)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Longitude:</span>
              <span className="text-mission-text">{selectedSatellite.position.lon.toFixed(4)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Altitude:</span>
              <span className="text-mission-text">{selectedSatellite.position.alt.toFixed(1)} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Type:</span>
              <span className="text-mission-text capitalize">{selectedSatellite.type}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SatelliteStatus
