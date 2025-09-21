import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import * as Cesium from 'cesium'

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxYWZiNDJkNy0yZWEwLTQ5OWQtYjk0MS0xOThlMTIxMDg1YTgiLCJpZCI6MzMyOTY1LCJpYXQiOjE3NTU1MTcyNzR9.raBDIk08ACyJ5JbAiqca_PFRHh1MyGLi3Bqfej5sL9Q'

const EarthViewer = forwardRef(({ satellites, selectedSatellite, onSatelliteSelect }, ref) => {
  const cesiumContainer = useRef()
  const viewer = useRef()

  useImperativeHandle(ref, () => ({
    focusOnSatellite: (satellite) => {
      if (viewer.current && satellite) {
        const position = Cesium.Cartesian3.fromDegrees(
          satellite.position.lon,
          satellite.position.lat,
          satellite.position.alt * 1000
        )
        viewer.current.camera.flyTo({ destination: position, duration: 2.0 })
      }
    }
  }))

  useEffect(() => {
    if (!cesiumContainer.current) return

    try {
      viewer.current = new Cesium.Viewer(cesiumContainer.current, {
        imageryProvider: new Cesium.IonImageryProvider({ assetId: 3845 }),
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        infoBox: false,
        selectionIndicator: false,
        creditContainer: document.createElement('div')
      })

      // Add satellites
      satellites.forEach(satellite => {
        const color = satellite.status === 'active' ? Cesium.Color.CYAN : Cesium.Color.YELLOW
        
        viewer.current.entities.add({
          id: satellite.id,
          position: Cesium.Cartesian3.fromDegrees(
            satellite.position.lon,
            satellite.position.lat,
            satellite.position.alt * 1000
          ),
          point: {
            pixelSize: selectedSatellite?.id === satellite.id ? 12 : 8,
            color: color,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2
          },
          label: {
            text: satellite.id,
            font: '12pt Inter',
            pixelOffset: new Cesium.Cartesian2(0, -40),
            fillColor: color,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE
          }
        })
      })

      // Ground stations
      const groundStations = [
        { name: 'KSC', lon: -80.6041, lat: 28.5721 },
        { name: 'VSFB', lon: -120.5724, lat: 34.7420 }
      ]

      groundStations.forEach(gs => {
        viewer.current.entities.add({
          position: Cesium.Cartesian3.fromDegrees(gs.lon, gs.lat),
          point: {
            pixelSize: 10,
            color: Cesium.Color.LIME,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          },
          label: {
            text: gs.name,
            font: '10pt Inter',
            pixelOffset: new Cesium.Cartesian2(0, -30),
            fillColor: Cesium.Color.LIME
          }
        })
      })

    } catch (error) {
      console.error('Cesium initialization error:', error)
    }

    return () => {
      if (viewer.current) {
        viewer.current.destroy()
        viewer.current = null
      }
    }
  }, [satellites, selectedSatellite])

  return (
    <div className="w-full h-full">
      <div ref={cesiumContainer} className="w-full h-full" />
    </div>
  )
})

EarthViewer.displayName = 'EarthViewer'
export default EarthViewer
