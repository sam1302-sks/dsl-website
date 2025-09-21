import { useState, useEffect, useRef } from 'react'

export const useRealTimeUpdates = (updateInterval = 1000) => {
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isConnected, setIsConnected] = useState(true)
  const [updateCount, setUpdateCount] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setLastUpdate(new Date())
      setUpdateCount(prev => prev + 1)
      
      // Simulate occasional connection issues
      if (Math.random() < 0.01) { // 1% chance of disconnection
        setIsConnected(false)
        setTimeout(() => setIsConnected(true), 5000) // Reconnect after 5 seconds
      }
    }, updateInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [updateInterval])

  const forceUpdate = () => {
    setLastUpdate(new Date())
    setUpdateCount(prev => prev + 1)
  }

  const getTimeSinceLastUpdate = () => {
    return Date.now() - lastUpdate.getTime()
  }

  return {
    lastUpdate,
    isConnected,
    updateCount,
    forceUpdate,
    getTimeSinceLastUpdate
  }
}

export default useRealTimeUpdates
