// import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
// import * as Cesium from 'cesium'

// // Set your Cesium token - GET YOUR OWN FROM cesium.com
// Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyNzg0NTE4Mn0.XcKpgANiY19MC4bdFUPB2qOxs_Up8kRmq5EvRbZz_mI'

// const PhotorealisticEarthViewer = forwardRef(({ satellites, selectedSatellite, activeMissions, onSatelliteSelect }, ref) => {
//   const cesiumContainer = useRef()
//   const viewer = useRef()

//   useImperativeHandle(ref, () => ({
//     focusOnSatellite: (satellite) => {
//       if (viewer.current && satellite) {
//         const position = Cesium.Cartesian3.fromDegrees(
//           satellite.position.lon,
//           satellite.position.lat,
//           satellite.position.alt * 1000
//         )
//         viewer.current.camera.flyTo({
//           destination: position,
//           orientation: {
//             heading: 0.0,
//             pitch: Cesium.Math.toRadians(-45.0),
//           },
//           duration: 2.0
//         })
//       }
//     }
//   }))

//   useEffect(() => {
//     if (!cesiumContainer.current || viewer.current) return

//     try {
//       // Initialize photorealistic Cesium viewer
//       viewer.current = new Cesium.Viewer(cesiumContainer.current, {
//         // High-quality imagery with day/night
//         imageryProvider: new Cesium.IonImageryProvider({ 
//           assetId: 3845 // Bing Maps Aerial with Labels
//         }),
        
//         // High-resolution terrain
//         terrainProvider: Cesium.createWorldTerrain({
//           requestWaterMask: true,
//           requestVertexNormals: true
//         }),
        
//         // Clean professional interface
//         baseLayerPicker: false,
//         geocoder: false,
//         homeButton: false,
//         sceneModePicker: false,
//         navigationHelpButton: false,
//         animation: false,
//         timeline: false,
//         fullscreenButton: false,
//         infoBox: false,
//         selectionIndicator: false,
//         creditContainer: document.createElement('div')
//       })

//       // Enable realistic lighting and atmosphere
//       viewer.current.scene.globe.enableLighting = true
//       viewer.current.scene.globe.atmosphereHueShift = 0.1
//       viewer.current.scene.globe.atmosphereSaturationShift = 0.1
//       viewer.current.scene.globe.atmosphereAlphaShift = 0.1

//       // Set initial camera position - view from ISS altitude
//       viewer.current.camera.setView({
//         destination: Cesium.Cartesian3.fromDegrees(-95.0, 40.0, 15000000),
//         orientation: {
//           heading: 0.0,
//           pitch: Cesium.Math.toRadians(-90),
//           roll: 0.0
//         }
//       })

//       // Clear existing entities
//       viewer.current.entities.removeAll()

//       // Add realistic satellite models
//       satellites.forEach(satellite => {
//         const entity = viewer.current.entities.add({
//           id: satellite.id,
//           name: satellite.name,
//           position: Cesium.Cartesian3.fromDegrees(
//             satellite.position.lon,
//             satellite.position.lat,
//             satellite.position.alt * 1000
//           ),
//           // High-quality 3D satellite representation
//           point: {
//             pixelSize: selectedSatellite?.id === satellite.id ? 18 : 12,
//             color: getSatelliteColor(satellite),
//             outlineColor: Cesium.Color.WHITE,
//             outlineWidth: selectedSatellite?.id === satellite.id ? 3 : 2,
//             scaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.8),
//             heightReference: Cesium.HeightReference.NONE
//           },
//           label: {
//             text: satellite.id,
//             font: '16pt Inter, sans-serif',
//             pixelOffset: new Cesium.Cartesian2(0, -60),
//             fillColor: getSatelliteColor(satellite),
//             outlineColor: Cesium.Color.BLACK,
//             outlineWidth: 2,
//             style: Cesium.LabelStyle.FILL_AND_OUTLINE,
//             scale: selectedSatellite?.id === satellite.id ? 1.3 : 1.0,
//             scaleByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5)
//           }
//         })

//         // Store satellite data for click handling
//         entity.satellite = satellite

//         // Add orbital path for selected satellite
//         if (selectedSatellite?.id === satellite.id) {
//           addOrbitalPath(satellite)
//         }

//         // Add sensor footprint for active missions
//         if (satellite.mission && satellite.target) {
//           addSensorFootprint(satellite)
//         }
//       })

//       // Add ground stations
//       addGroundStations()

//       // Handle satellite clicks
//       viewer.current.cesiumWidget.screenSpaceEventHandler.setInputAction((event) => {
//         const pickedObject = viewer.current.scene.pick(event.position)
//         if (pickedObject?.id?.satellite) {
//           onSatelliteSelect(pickedObject.id.satellite)
//         }
//       }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

//     } catch (error) {
//       console.error('Cesium initialization error:', error)
//       // Fallback to simple earth view if Cesium fails
//       renderFallbackEarth()
//     }

//     return () => {
//       if (viewer.current) {
//         viewer.current.destroy()
//         viewer.current = null
//       }
//     }
//   }, [satellites, selectedSatellite, onSatelliteSelect])

//   const getSatelliteColor = (satellite) => {
//     if (satellite.status === 'deploying') return Cesium.Color.YELLOW
//     if (satellite.status === 'inactive') return Cesium.Color.RED
    
//     switch (satellite.type) {
//       case 'crewed': return Cesium.Color.CYAN
//       case 'weather': return Cesium.Color.LIGHTGREEN
//       case 'earth-observation': return Cesium.Color.ORANGE
//       case 'navigation': return Cesium.Color.LIGHTBLUE
//       case 'communication': return Cesium.Color.MAGENTA
//       default: return Cesium.Color.WHITE
//     }
//   }

//   const addOrbitalPath = (satellite) => {
//     if (!viewer.current) return

//     const positions = []
//     const steps = 128
//     const period = 90 // minutes for LEO
    
//     for (let i = 0; i <= steps; i++) {
//       const angle = (i / steps) * 2 * Math.PI
//       const lat = satellite.position.lat + Math.sin(angle) * 10
//       const lon = satellite.position.lon + Math.cos(angle) * 15
//       positions.push(Cesium.Cartesian3.fromDegrees(lon, lat, satellite.position.alt * 1000))
//     }

//     viewer.current.entities.add({
//       id: `orbit-${satellite.id}`,
//       polyline: {
//         positions: positions,
//         width: 3,
//         material: getSatelliteColor(satellite).withAlpha(0.7),
//         clampToGround: false
//       }
//     })
//   }

//   const addSensorFootprint = (satellite) => {
//     if (!viewer.current || !satellite.target) return

//     // Create sensor cone from satellite to target
//     const satPosition = Cesium.Cartesian3.fromDegrees(
//       satellite.position.lon,
//       satellite.position.lat,
//       satellite.position.alt * 1000
//     )
    
//     const targetPosition = Cesium.Cartesian3.fromDegrees(
//       satellite.target.lat,
//       satellite.target.lon,
//       0
//     )

//     // Add line from satellite to target
//     viewer.current.entities.add({
//       id: `sensor-${satellite.id}`,
//       polyline: {
//         positions: [satPosition, targetPosition],
//         width: 2,
//         material: Cesium.Color.RED.withAlpha(0.8),
//         arcType: Cesium.ArcType.NONE
//       }
//     })

//     // Add target highlight
//     viewer.current.entities.add({
//       id: `target-${satellite.id}`,
//       position: targetPosition,
//       ellipse: {
//         semiMinorAxis: 50000,
//         semiMajorAxis: 50000,
//         material: Cesium.Color.RED.withAlpha(0.3),
//         outline: true,
//         outlineColor: Cesium.Color.RED
//       },
//       label: {
//         text: satellite.target.name,
//         font: '14pt Inter, sans-serif',
//         pixelOffset: new Cesium.Cartesian2(0, -30),
//         fillColor: Cesium.Color.RED,
//         outlineColor: Cesium.Color.BLACK,
//         outlineWidth: 2,
//         style: Cesium.LabelStyle.FILL_AND_OUTLINE
//       }
//     })
//   }

//   const addGroundStations = () => {
//     if (!viewer.current) return

//     const groundStations = [
//       { name: 'Kennedy Space Center', lat: 28.5721, lon: -80.6041, code: 'KSC' },
//       { name: 'Vandenberg SFB', lat: 34.7420, lon: -120.5724, code: 'VSFB' },
//       { name: 'Wallops Flight Facility', lat: 37.9403, lon: -75.4714, code: 'WFF' },
//       { name: 'Baikonur Cosmodrome', lat: 45.9647, lon: 63.3056, code: 'BAIR' },
//       { name: 'European Spaceport', lat: 5.2362, lon: -52.7688, code: 'CSG' }
//     ]

//     groundStations.forEach(gs => {
//       viewer.current.entities.add({
//         position: Cesium.Cartesian3.fromDegrees(gs.lon, gs.lat),
//         point: {
//           pixelSize: 14,
//           color: Cesium.Color.LIME,
//           outlineColor: Cesium.Color.WHITE,
//           outlineWidth: 3,
//           heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
//         },
//         label: {
//           text: gs.code,
//           font: '12pt Inter, sans-serif',
//           pixelOffset: new Cesium.Cartesian2(0, -40),
//           fillColor: Cesium.Color.LIME,
//           outlineColor: Cesium.Color.BLACK,
//           outlineWidth: 2,
//           style: Cesium.LabelStyle.FILL_AND_OUTLINE
//         }
//       })
//     })
//   }

//   const renderFallbackEarth = () => {
//     // Fallback 2D representation if Cesium fails
//     const fallbackContainer = cesiumContainer.current
//     fallbackContainer.innerHTML = `
//       <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #001122 0%, #003366 50%, #4a90e2 100%); 
//                   display: flex; align-items: center; justify-content: center; color: white; font-family: Inter;">
//         <div style="text-align: center;">
//           <div style="font-size: 4rem; margin-bottom: 1rem;">🌍</div>
//           <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">Earth View</div>
//           <div style="font-size: 1rem; opacity: 0.7;">Cesium loading...</div>
//         </div>
//       </div>
//     `
//   }

//   return (
//     <div className="w-full h-full relative">
//       <div 
//         ref={cesiumContainer}
//         className="w-full h-full"
//         style={{ background: '#000' }}
//       />
//     </div>
//   )
// })

// PhotorealisticEarthViewer.displayName = 'PhotorealisticEarthViewer'
// export default PhotorealisticEarthViewer
import React, { forwardRef, useImperativeHandle } from 'react'
import { motion } from 'framer-motion'

const PhotorealisticEarthViewer = forwardRef(({ satellites, selectedSatellite, activeMissions, onSatelliteSelect }, ref) => {
  useImperativeHandle(ref, () => ({
    focusOnSatellite: (satellite) => {
      console.log('Focusing on:', satellite.id)
    }
  }))

  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-900 via-blue-800 to-green-900 relative overflow-hidden">
      {/* Professional Earth Simulation */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Earth Globe */}
        <motion.div 
          className="earth-globe"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-96 h-96 rounded-full bg-gradient-to-br from-blue-400 via-green-500 to-blue-600 shadow-2xl relative overflow-hidden">
            {/* Continents */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-green-300 to-blue-400 opacity-70"></div>
            
            {/* Atmosphere Glow */}
            <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-blue-300 to-transparent opacity-30 animate-pulse"></div>
            
            {/* Cloud Layer */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-white to-transparent opacity-20"
              animate={{ rotate: -360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>
      </div>

      {/* Satellite Positions */}
      <div className="absolute inset-0">
        {satellites.map((satellite, index) => (
          <motion.div
            key={satellite.id}
            className={`absolute cursor-pointer transition-all duration-300 ${
              selectedSatellite?.id === satellite.id ? 'scale-150' : 'hover:scale-125'
            }`}
            style={{
              left: `${50 + Math.cos(index * 1.2 + Date.now() * 0.001) * 35}%`,
              top: `${50 + Math.sin(index * 1.2 + Date.now() * 0.001) * 35}%`,
            }}
            onClick={() => onSatelliteSelect(satellite)}
            animate={{
              x: [0, 5, 0, -5, 0],
              y: [0, -3, 0, 3, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Satellite Dot */}
            <div className={`w-4 h-4 rounded-full shadow-lg ${
              satellite.status === 'active' ? 'bg-cyan-400' : 'bg-yellow-400'
            } ${selectedSatellite?.id === satellite.id ? 'ring-4 ring-white' : ''}`}>
              <div className={`w-full h-full rounded-full animate-ping ${
                satellite.status === 'active' ? 'bg-cyan-400' : 'bg-yellow-400'
              } opacity-75`}></div>
            </div>
            
            {/* Satellite Label */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <div className="text-xs text-white bg-black bg-opacity-75 px-2 py-1 rounded whitespace-nowrap">
                {satellite.id}
              </div>
            </div>

            {/* Mission Target Line */}
            {satellite.mission && satellite.target && (
              <div className="absolute top-2 left-2 w-32 h-0.5 bg-red-400 opacity-60 animate-pulse"></div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Ground Stations */}
      <div className="absolute bottom-16 left-16">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-lime-400 rounded-full animate-pulse"></div>
          <span className="text-lime-400 text-sm font-mono">KSC</span>
        </div>
      </div>
      
      <div className="absolute top-24 left-24">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-lime-400 rounded-full animate-pulse"></div>
          <span className="text-lime-400 text-sm font-mono">VSFB</span>
        </div>
      </div>

      {/* Info Overlay */}
      <div className="absolute top-4 left-4 text-white text-sm font-mono bg-black bg-opacity-50 p-3 rounded">
        <div className="text-cyan-400 mb-2">🌍 EARTH VIEW</div>
        <div>Satellites: {satellites.length}</div>
        <div>Active: {satellites.filter(s => s.status === 'active').length}</div>
        <div>Selected: {selectedSatellite?.id || 'None'}</div>
      </div>

      {/* Navigation Hint */}
      <div className="absolute bottom-4 right-4 text-white text-xs bg-black bg-opacity-50 p-2 rounded">
        Click satellites to select • Real Cesium coming soon
      </div>
    </div>
  )
})

PhotorealisticEarthViewer.displayName = 'PhotorealisticEarthViewer'
export default PhotorealisticEarthViewer
