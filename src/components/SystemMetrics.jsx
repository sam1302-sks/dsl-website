import React from 'react'
import { Activity, Satellite, Radio, Database } from 'lucide-react'

const SystemMetrics = ({ systemStatus }) => {
  const metrics = [
    {
      icon: Activity,
      label: 'System Status',
      value: systemStatus.operational ? 'OPERATIONAL' : 'DEGRADED',
      color: systemStatus.operational ? 'text-mission-success' : 'text-mission-error'
    },
    {
      icon: Satellite,
      label: 'Active Satellites',
      value: systemStatus.activeSatellites,
      color: 'text-mission-accent'
    },
    {
      icon: Radio,
      label: 'Ground Stations',
      value: systemStatus.groundStations,
      color: 'text-mission-accent'
    },
    {
      icon: Database,
      label: 'Data Rate',
      value: `${systemStatus.dataRate.toFixed(1)} Mbps`,
      color: 'text-mission-accent'
    }
  ]

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-mission-accent mb-3">SYSTEM METRICS</h3>
      {metrics.map((metric, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <metric.icon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">{metric.label}</span>
          </div>
          <span className={`text-sm font-mono ${metric.color}`}>
            {metric.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default SystemMetrics
