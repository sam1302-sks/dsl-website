import { useState, useEffect, useCallback } from 'react'

export const useSatelliteData = (initialSatellites = []) => {
  const [satellites, setSatellites] = useState(initialSatellites)
  const [selectedSatellite, setSelectedSatellite] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Simulate real-time satellite position updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSatellites(prevSatellites => 
        prevSatellites.map(satellite => {
          // Simple orbital mechanics simulation
          const orbitalSpeed = satellite.velocity / satellite.position.alt
          const lonIncrement = (orbitalSpeed * 0.001) % 360
          
          return {
            ...satellite,
            position: {
              ...satellite.position,
              lon: (satellite.position.lon + lonIncrement + 360) % 360 - 180
            },
            power: Math.max(70, Math.min(100, 
              satellite.power + (Math.random() - 0.5) * 2
            )),
            dataRate: Math.max(0, 
              satellite.dataRate + (Math.random() - 0.5) * 10
            ),
            lastContact: new Date()
          }
        })
      )
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [])

  const addSatellite = useCallback((satelliteData) => {
    const newSatellite = {
      id: `SAT_${Date.now()}`,
      name: satelliteData.name || `Satellite ${Date.now()}`,
      type: satelliteData.type || 'custom',
      position: satelliteData.position || { lat: 0, lon: 0, alt: 400 },
      velocity: satelliteData.velocity || 27600,
      status: 'deploying',
      health: 100,
      power: 95,
      batteryLife: 24,
      dataRate: 50 + Math.random() * 100,
      mission: null,
      lastContact: new Date(),
      ...satelliteData
    }

    setSatellites(prev => [...prev, newSatellite])
    
    // Simulate deployment completion
    setTimeout(() => {
      setSatellites(prev => 
        prev.map(sat => 
          sat.id === newSatellite.id 
            ? { ...sat, status: 'active' }
            : sat
        )
      )
    }, 3000)

    return newSatellite
  }, [])

  const removeSatellite = useCallback((satelliteId) => {
    setSatellites(prev => prev.filter(sat => sat.id !== satelliteId))
    if (selectedSatellite?.id === satelliteId) {
      setSelectedSatellite(null)
    }
  }, [selectedSatellite])

  const updateSatellite = useCallback((satelliteId, updates) => {
    setSatellites(prev => 
      prev.map(sat => 
        sat.id === satelliteId 
          ? { ...sat, ...updates, lastContact: new Date() }
          : sat
      )
    )
  }, [])

  const getSatelliteById = useCallback((satelliteId) => {
    return satellites.find(sat => sat.id === satelliteId)
  }, [satellites])

  const getSatellitesByType = useCallback((type) => {
    return satellites.filter(sat => sat.type === type)
  }, [satellites])

  const getActiveSatellites = useCallback(() => {
    return satellites.filter(sat => sat.status === 'active')
  }, [satellites])

  return {
    satellites,
    selectedSatellite,
    setSelectedSatellite,
    isLoading,
    error,
    addSatellite,
    removeSatellite,
    updateSatellite,
    getSatelliteById,
    getSatellitesByType,
    getActiveSatellites
  }
}

export default useSatelliteData
