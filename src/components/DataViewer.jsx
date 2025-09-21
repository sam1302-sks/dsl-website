import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Image, 
  BarChart3, 
  Download, 
  Eye, 
  Layers,
  MapPin,
  Calendar,
  Database,
  Zap
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

const DataViewer = ({ analyticsData, selectedSatellite }) => {
  if (!analyticsData) {
    return (
      <div className="data-viewer empty">
        <div className="empty-state">
          <Database className="w-16 h-16 opacity-50" />
          <h3>No Data Available</h3>
          <p>Execute a <code>getData</code> or <code>getPowerStatus</code> command to view results</p>
        </div>
      </div>
    )
  }

  const renderSatelliteImage = (data) => (
    <motion.div
      className="satellite-image-viewer"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Image Header */}
      <div className="data-header">
        <div className="header-info">
          <Image className="w-5 h-5" />
          <div className="header-content">
            <h3>Satellite Imagery</h3>
            <p>{data.satellite} • {data.timestamp.toLocaleString()}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="action-btn">
            <Eye className="w-4 h-4" />
            Full View
          </button>
        </div>
      </div>

      {/* Simulated Satellite Image */}
      <div className="image-container">
        <div className="satellite-image">
          <div className="image-placeholder">
            <div className="terrain-layer"></div>
            <div className="cloud-layer"></div>
            <div className="urban-areas"></div>
            <div className="water-bodies"></div>
          </div>
          <div className="image-overlay">
            <div className="coordinate-grid"></div>
            <div className="target-marker">
              <MapPin className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Image Metadata */}
      <div className="image-metadata">
        <div className="metadata-grid">
          <div className="metadata-item">
            <span className="metadata-label">Resolution:</span>
            <span className="metadata-value">{data.resolution}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Coverage:</span>
            <span className="metadata-value">{data.coverage}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Cloud Cover:</span>
            <span className="metadata-value">{data.cloudCover}%</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Quality:</span>
            <span className="metadata-value text-mission-success">{data.quality}</span>
          </div>
        </div>

        {/* Spectral Bands */}
        <div className="spectral-bands">
          <h4>Spectral Bands</h4>
          <div className="bands-list">
            {data.bands.map((band, index) => (
              <div key={index} className="band-item">
                <div className={`band-color band-${index}`}></div>
                <span>{band}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderPowerChart = (data) => (
    <motion.div
      className="power-chart-viewer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Chart Header */}
      <div className="data-header">
        <div className="header-info">
          <Zap className="w-5 h-5" />
          <div className="header-content">
            <h3>Power Analysis</h3>
            <p>{data.satellite} • 24-Hour Prediction</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button className="action-btn">
            <BarChart3 className="w-4 h-4" />
            Advanced
          </button>
        </div>
      </div>

      {/* Power Chart */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.data}>
            <defs>
              <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00d9ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="hour" 
              stroke="#b3c5d1"
              fontSize={12}
              tickFormatter={(hour) => `${hour}:00`}
            />
            <YAxis 
              stroke="#b3c5d1"
              fontSize={12}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(26, 27, 58, 0.95)',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                borderRadius: '8px',
                color: '#ffffff'
              }}
              formatter={(value, name) => [`${value.toFixed(1)}%`, 'Battery Level']}
              labelFormatter={(hour) => `Time: ${hour}:00 UTC`}
            />
            <Area
              type="monotone"
              dataKey="power"
              stroke="#00d9ff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#powerGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Power Insights */}
      <div className="power-insights">
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">
              <Zap className="w-4 h-4 text-mission-success" />
            </div>
            <div className="insight-content">
              <div className="insight-value">
                {Math.max(...data.data.map(d => d.power)).toFixed(1)}%
              </div>
              <div className="insight-label">Peak Power</div>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">
              <BarChart3 className="w-4 h-4 text-mission-warning" />
            </div>
            <div className="insight-content">
              <div className="insight-value">
                {(data.data.reduce((sum, d) => sum + d.power, 0) / data.data.length).toFixed(1)}%
              </div>
              <div className="insight-label">Average</div>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">
              <Calendar className="w-4 h-4 text-mission-accent" />
            </div>
            <div className="insight-content">
              <div className="insight-value">
                {data.data.filter(d => d.eclipse).length}
              </div>
              <div className="insight-label">Eclipse Periods</div>
            </div>
          </div>
        </div>

        {/* Eclipse Schedule */}
        <div className="eclipse-schedule">
          <h4>Eclipse Schedule</h4>
          <div className="eclipse-periods">
            {data.data.map((period, index) => (
              period.eclipse && (
                <div key={index} className="eclipse-period">
                  <div className="eclipse-time">{period.hour}:00 - {period.hour + 1}:00</div>
                  <div className="eclipse-impact">
                    Power drop: ~{(100 - period.power).toFixed(0)}%
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="data-viewer">
      <AnimatePresence mode="wait">
        {analyticsData.type === 'satellite-image' && renderSatelliteImage(analyticsData)}
        {analyticsData.type === 'power-chart' && renderPowerChart(analyticsData)}
      </AnimatePresence>
    </div>
  )
}

export default DataViewer
