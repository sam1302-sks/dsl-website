import { useState, useCallback } from 'react'

export const useDSLProcessor = () => {
  const [commandHistory, setCommandHistory] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  const dslCommands = {
    track: {
      syntax: 'track <satellite>',
      description: 'Focus camera on specified satellite',
      execute: async (args, { satellites, setSelectedSatellite, earthViewerRef }) => {
        const satelliteId = args[0]?.toLowerCase()
        const satellite = satellites.find(s => s.id.toLowerCase() === satelliteId)
        
        if (!satellite) {
          throw new Error(`Satellite '${args[0]}' not found`)
        }
        
        setSelectedSatellite(satellite)
        earthViewerRef.current?.focusOnSatellite(satellite)
        
        return `Now tracking ${satellite.name} (${satellite.id})`
      }
    },
    
    taskImaging: {
      syntax: 'taskImaging <satellite> [target]',
      description: 'Start imaging mission for satellite',
      execute: async (args, { satellites, setActiveMissions }) => {
        const satelliteId = args[0]?.toLowerCase()
        const target = args.slice(1).join(' ') || 'User Defined Target'
        
        const satellite = satellites.find(s => s.id.toLowerCase() === satelliteId)
        
        if (!satellite) {
          throw new Error(`Satellite '${args[0]}' not found`)
        }
        
        if (!['earth-observation', 'custom'].includes(satellite.type)) {
          throw new Error(`Satellite '${satellite.id}' is not capable of imaging missions`)
        }
        
        const mission = {
          id: `IMG_${Date.now()}`,
          type: 'imaging',
          satellite: satellite.id,
          target: target,
          status: 'executing',
          progress: 0,
          startTime: new Date(),
          estimatedCompletion: new Date(Date.now() + 1800000) // 30 minutes
        }
        
        setActiveMissions(prev => [...prev, mission])
        
        return `Imaging mission started for ${satellite.name}. Target: ${target}`
      }
    },
    
    getData: {
      syntax: 'getData <satellite>',
      description: 'Retrieve latest data from satellite',
      execute: async (args, { satellites, setAnalyticsData }) => {
        const satelliteId = args[0]?.toLowerCase()
        const satellite = satellites.find(s => s.id.toLowerCase() === satelliteId)
        
        if (!satellite) {
          throw new Error(`Satellite '${args[0]}' not found`)
        }
        
        // Simulate data retrieval delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const mockData = {
          type: 'satellite-image',
          satellite: satellite.name,
          timestamp: new Date(),
          resolution: satellite.type === 'earth-observation' ? '10m/pixel' : '30m/pixel',
          coverage: '185km x 185km',
          bands: ['Visible', 'NIR', 'SWIR'],
          cloudCover: Math.round(Math.random() * 30),
          quality: satellite.health > 90 ? 'Excellent' : 'Good'
        }
        
        setAnalyticsData(mockData)
        
        return `Data retrieved from ${satellite.name}. Quality: ${mockData.quality}`
      }
    },
    
    getPowerStatus: {
      syntax: 'getPowerStatus <satellite>',
      description: 'Get power analysis and predictions',
      execute: async (args, { satellites, setAnalyticsData }) => {
        const satelliteId = args[0]?.toLowerCase()
        const satellite = satellites.find(s => s.id.toLowerCase() === satelliteId)
        
        if (!satellite) {
          throw new Error(`Satellite '${args[0]}' not found`)
        }
        
        // Simulate analysis delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Generate realistic power prediction
        const powerPrediction = Array.from({ length: 24 }, (_, i) => {
          const baselinePower = 80
          const solarVariation = Math.sin((i - 6) * Math.PI / 12) * 15
          const randomNoise = (Math.random() - 0.5) * 5
          const eclipsePenalty = (i < 6 || i > 18) ? -20 : 0
          
          return {
            hour: i,
            power: Math.max(40, Math.min(100, 
              baselinePower + solarVariation + randomNoise + eclipsePenalty
            )),
            eclipse: i < 6 || i > 18
          }
        })
        
        const analysisData = {
          type: 'power-chart',
          data: powerPrediction,
          satellite: satellite.name,
          currentPower: satellite.power,
          batteryHealth: satellite.health,
          solarPanelEfficiency: 85 + Math.random() * 10
        }
        
        setAnalyticsData(analysisData)
        
        return `Power analysis completed for ${satellite.name}. Current: ${satellite.power.toFixed(1)}%`
      }
    },
    
    status: {
      syntax: 'status',
      description: 'Show system status',
      execute: async (args, { satellites, activeMissions }) => {
        const activeSats = satellites.filter(s => s.status === 'active').length
        const totalPower = satellites.reduce((sum, sat) => sum + sat.power, 0)
        const avgPower = satellites.length > 0 ? totalPower / satellites.length : 0
        const activeMissionsCount = activeMissions.filter(m => m.status === 'executing').length
        
        return `System Status: OPERATIONAL
Active Satellites: ${activeSats}/${satellites.length}
Average Power: ${avgPower.toFixed(1)}%
Active Missions: ${activeMissionsCount}
Last Update: ${new Date().toLocaleTimeString()}`
      }
    },
    
    help: {
      syntax: 'help [command]',
      description: 'Show available commands or help for specific command',
      execute: async (args) => {
        if (args[0]) {
          const command = dslCommands[args[0]]
          if (command) {
            return `${command.syntax}
${command.description}

Example: ${command.syntax.replace(/<(\w+)>/g, (match, param) => {
              if (param === 'satellite') return 'ISS'
              if (param === 'target') return 'amazon_forest'
              return param
            })}`
          } else {
            throw new Error(`Unknown command: ${args[0]}`)
          }
        }
        
        return `Available DSL Commands:
${Object.entries(dslCommands).map(([cmd, info]) => 
          `  ${info.syntax.padEnd(25)} - ${info.description}`
        ).join('\n')}

Type 'help <command>' for detailed information about a specific command.`
      }
    }
  }

  const processCommand = useCallback(async (commandString, context) => {
    const timestamp = new Date()
    const commandEntry = {
      id: Date.now(),
      command: commandString,
      timestamp,
      status: 'executing',
      result: null
    }

    setCommandHistory(prev => [...prev, commandEntry])
    setIsProcessing(true)

    try {
      const parts = commandString.trim().split(/\s+/)
      const command = parts[0]
      const args = parts.slice(1)

      const dslCommand = dslCommands[command]
      
      if (!dslCommand) {
        throw new Error(`Unknown command: ${command}. Type 'help' for available commands.`)
      }

      const result = await dslCommand.execute(args, context)

      setCommandHistory(prev => 
        prev.map(cmd => 
          cmd.id === commandEntry.id 
            ? { ...cmd, status: 'success', result }
            : cmd
        )
      )

      return result
    } catch (error) {
      const errorMessage = error.message || 'Command execution failed'
      
      setCommandHistory(prev => 
        prev.map(cmd => 
          cmd.id === commandEntry.id 
            ? { ...cmd, status: 'error', result: errorMessage }
            : cmd
        )
      )

      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const clearHistory = useCallback(() => {
    setCommandHistory([])
  }, [])

  const getCommandSuggestions = useCallback((input) => {
    const inputLower = input.toLowerCase()
    return Object.entries(dslCommands)
      .filter(([cmd, info]) => 
        cmd.toLowerCase().includes(inputLower) ||
        info.description.toLowerCase().includes(inputLower)
      )
      .map(([cmd, info]) => ({
        command: info.syntax,
        description: info.description,
        example: info.syntax.replace(/<(\w+)>/g, (match, param) => {
          if (param === 'satellite') return 'ISS'
          if (param === 'target') return 'amazon_forest'
          return param
        })
      }))
  }, [])

  return {
    commandHistory,
    isProcessing,
    processCommand,
    clearHistory,
    getCommandSuggestions,
    availableCommands: Object.keys(dslCommands)
  }
}

export default useDSLProcessor
