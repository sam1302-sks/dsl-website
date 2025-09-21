// Satellite orbital mechanics and calculations

export const EARTH_RADIUS = 6371 // km
export const GRAVITATIONAL_PARAMETER = 398600.4418 // km³/s²

/**
 * Convert degrees to radians
 */
export const toRadians = (degrees) => degrees * (Math.PI / 180)

/**
 * Convert radians to degrees
 */
export const toDegrees = (radians) => radians * (180 / Math.PI)

/**
 * Calculate orbital velocity for circular orbit
 * @param {number} altitude - Altitude in km
 * @returns {number} Velocity in km/s
 */
export const calculateOrbitalVelocity = (altitude) => {
  const radius = EARTH_RADIUS + altitude
  return Math.sqrt(GRAVITATIONAL_PARAMETER / radius)
}

/**
 * Calculate orbital period
 * @param {number} altitude - Altitude in km
 * @returns {number} Period in seconds
 */
export const calculateOrbitalPeriod = (altitude) => {
  const radius = EARTH_RADIUS + altitude
  return 2 * Math.PI * Math.sqrt((radius ** 3) / GRAVITATIONAL_PARAMETER)
}

/**
 * Calculate distance between two points on Earth
 * @param {Object} pos1 - {lat, lon} in degrees
 * @param {Object} pos2 - {lat, lon} in degrees
 * @returns {number} Distance in km
 */
export const calculateDistance = (pos1, pos2) => {
  const lat1 = toRadians(pos1.lat)
  const lon1 = toRadians(pos1.lon)
  const lat2 = toRadians(pos2.lat)
  const lon2 = toRadians(pos2.lon)

  const dlat = lat2 - lat1
  const dlon = lon2 - lon1

  const a = Math.sin(dlat / 2) ** 2 + 
           Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return EARTH_RADIUS * c
}

/**
 * Calculate satellite ground track
 * @param {Object} satellite - Satellite object with position and velocity
 * @param {number} duration - Duration in seconds
 * @param {number} steps - Number of calculation steps
 * @returns {Array} Array of {lat, lon, timestamp} positions
 */
export const calculateGroundTrack = (satellite, duration = 3600, steps = 100) => {
  const positions = []
  const timeStep = duration / steps
  const period = calculateOrbitalPeriod(satellite.position.alt)
  const angularVelocity = (2 * Math.PI) / period // rad/s

  for (let i = 0; i <= steps; i++) {
    const time = i * timeStep
    const deltaLon = toDegrees(angularVelocity * time)
    
    const lon = (satellite.position.lon + deltaLon + 540) % 360 - 180
    const lat = satellite.position.lat // Simplified - assumes circular orbit
    
    positions.push({
      lat,
      lon,
      timestamp: new Date(Date.now() + time * 1000),
      altitude: satellite.position.alt
    })
  }

  return positions
}

/**
 * Calculate when satellite will be visible from ground location
 * @param {Object} satellite - Satellite position
 * @param {Object} groundLocation - Ground station location
 * @param {number} minElevation - Minimum elevation angle in degrees
 * @returns {Object} Visibility information
 */
export const calculateVisibility = (satellite, groundLocation, minElevation = 10) => {
  const distance = calculateDistance(satellite.position, groundLocation)
  const satelliteHeight = satellite.position.alt
  
  // Calculate elevation angle
  const horizonDistance = Math.sqrt(
    (EARTH_RADIUS + satelliteHeight) ** 2 - EARTH_RADIUS ** 2
  )
  
  const elevation = toDegrees(Math.asin(
    (satelliteHeight - EARTH_RADIUS * (1 - Math.cos(distance / EARTH_RADIUS))) /
    Math.sqrt(distance ** 2 + satelliteHeight ** 2)
  ))

  const isVisible = elevation >= minElevation
  const maxElevation = toDegrees(Math.asin(satelliteHeight / (EARTH_RADIUS + satelliteHeight)))

  return {
    isVisible,
    elevation,
    maxElevation,
    distance,
    azimuth: calculateAzimuth(satellite.position, groundLocation)
  }
}

/**
 * Calculate azimuth angle from ground location to satellite
 * @param {Object} satellitePos - Satellite position
 * @param {Object} groundPos - Ground location
 * @returns {number} Azimuth in degrees (0-360)
 */
export const calculateAzimuth = (satellitePos, groundPos) => {
  const lat1 = toRadians(groundPos.lat)
  const lat2 = toRadians(satellitePos.lat)
  const dlon = toRadians(satellitePos.lon - groundPos.lon)

  const y = Math.sin(dlon) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - 
           Math.sin(lat1) * Math.cos(lat2) * Math.cos(dlon)

  let azimuth = toDegrees(Math.atan2(y, x))
  return (azimuth + 360) % 360
}

/**
 * Predict satellite eclipse periods
 * @param {Object} satellite - Satellite object
 * @param {Date} startTime - Start time for prediction
 * @param {number} duration - Duration in hours
 * @returns {Array} Array of eclipse periods
 */
export const predictEclipses = (satellite, startTime = new Date(), duration = 24) => {
  const eclipses = []
  const period = calculateOrbitalPeriod(satellite.position.alt) / 3600 // hours
  const orbitsInDuration = duration / period

  for (let orbit = 0; orbit < orbitsInDuration; orbit++) {
    const orbitStart = new Date(startTime.getTime() + orbit * period * 3600000)
    
    // Simplified eclipse calculation
    // In reality, this would consider Earth's shadow geometry
    const eclipseStart = new Date(orbitStart.getTime() + period * 0.3 * 3600000)
    const eclipseEnd = new Date(orbitStart.getTime() + period * 0.7 * 3600000)

    eclipses.push({
      start: eclipseStart,
      end: eclipseEnd,
      duration: eclipseEnd.getTime() - eclipseStart.getTime(),
      orbit: orbit + 1
    })
  }

  return eclipses
}

/**
 * Calculate power generation profile for satellite
 * @param {Object} satellite - Satellite object
 * @param {Array} eclipses - Eclipse periods
 * @param {number} hours - Number of hours to calculate
 * @returns {Array} Power data points
 */
export const calculatePowerProfile = (satellite, eclipses = [], hours = 24) => {
  const powerData = []
  const baselinePower = satellite.power || 80
  
  for (let hour = 0; hour < hours; hour++) {
    const currentTime = new Date(Date.now() + hour * 3600000)
    
    // Check if in eclipse
    const inEclipse = eclipses.some(eclipse => 
      currentTime >= eclipse.start && currentTime <= eclipse.end
    )
    
    let power = baselinePower
    
    if (inEclipse) {
      power = Math.max(40, baselinePower - 30) // Battery power only
    } else {
      // Solar power generation varies with sun angle
      const sunAngle = Math.sin(hour * Math.PI / 12) // Simplified
      power = Math.min(100, baselinePower + sunAngle * 15)
    }
    
    // Add some realistic noise
    power += (Math.random() - 0.5) * 5
    
    powerData.push({
      hour,
      power: Math.max(0, Math.min(100, power)),
      eclipse: inEclipse,
      timestamp: new Date(Date.now() + hour * 3600000)
    })
  }
  
  return powerData
}

/**
 * Calculate satellite sensor footprint
 * @param {Object} satellite - Satellite object
 * @param {number} sensorAngle - Sensor field of view in degrees
 * @returns {Object} Footprint geometry
 */
export const calculateSensorFootprint = (satellite, sensorAngle = 45) => {
  const altitude = satellite.position.alt
  const halfAngle = toRadians(sensorAngle / 2)
  
  // Calculate footprint radius on ground
  const footprintRadius = altitude * Math.tan(halfAngle)
  
  // Calculate swath width
  const swathWidth = 2 * footprintRadius
  
  return {
    radius: footprintRadius,
    diameter: footprintRadius * 2,
    swathWidth,
    area: Math.PI * footprintRadius ** 2,
    groundSampleDistance: (altitude * 1000) / 1000 // Simplified GSD calculation
  }
}

export default {
  EARTH_RADIUS,
  GRAVITATIONAL_PARAMETER,
  toRadians,
  toDegrees,
  calculateOrbitalVelocity,
  calculateOrbitalPeriod,
  calculateDistance,
  calculateGroundTrack,
  calculateVisibility,
  calculateAzimuth,
  predictEclipses,
  calculatePowerProfile,
  calculateSensorFootprint
}
