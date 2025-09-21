import React, { useState, useRef, useEffect } from 'react'
import { Terminal } from 'lucide-react'

const CommandTerminal = ({ onCommand }) => {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef(null)
  const terminalRef = useRef(null)

  const commands = [
    { cmd: 'deploy <name> [orbit]', desc: 'Deploy a new satellite (leo/meo/geo)' },
    { cmd: 'status <satellite>', desc: 'Get satellite status information' },
    { cmd: 'track <satellite>', desc: 'Focus camera on satellite' },
    { cmd: 'list', desc: 'List all satellites' },
    { cmd: 'help', desc: 'Show available commands' },
    { cmd: 'clear', desc: 'Clear terminal output' }
  ]

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const newEntry = {
      type: 'command',
      content: input,
      timestamp: new Date()
    }

    setHistory(prev => [...prev, newEntry])
    
    const cmd = input.trim().toLowerCase()
    
    if (cmd === 'help') {
      setHistory(prev => [...prev, {
        type: 'output',
        content: commands.map(c => `${c.cmd.padEnd(20)} - ${c.desc}`).join('\n'),
        timestamp: new Date()
      }])
    } else if (cmd === 'clear') {
      setHistory([])
    } else if (cmd === 'list') {
      setHistory(prev => [...prev, {
        type: 'output',
        content: 'Use the satellite status panel on the left to view all satellites.',
        timestamp: new Date()
      }])
    } else {
      onCommand(input.trim())
      setHistory(prev => [...prev, {
        type: 'output',
        content: `Executing: ${input.trim()}`,
        timestamp: new Date()
      }])
    }

    setInput('')
    setHistoryIndex(-1)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1
        const commandHistory = history.filter(h => h.type === 'command')
        if (commandHistory[commandHistory.length - 1 - newIndex]) {
          setInput(commandHistory[commandHistory.length - 1 - newIndex].content)
          setHistoryIndex(newIndex)
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        const commandHistory = history.filter(h => h.type === 'command')
        setInput(commandHistory[commandHistory.length - 1 - newIndex].content)
        setHistoryIndex(newIndex)
      } else if (historyIndex === 0) {
        setInput('')
        setHistoryIndex(-1)
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-3">
        <Terminal className="w-4 h-4 text-mission-accent" />
        <span className="text-sm font-semibold text-mission-accent">COMMAND INTERFACE</span>
      </div>
      
      <div className="flex-1 terminal overflow-y-auto" ref={terminalRef}>
        <div className="space-y-1">
          {history.length === 0 && (
            <div className="terminal-output opacity-60">
              SatOps DSL v1.0 - Satellite Operations System{'\n'}
              Type 'help' for available commands
            </div>
          )}
          
          {history.map((entry, index) => (
            <div key={index} className="break-words">
              {entry.type === 'command' ? (
                <div className="flex">
                  <span className="terminal-prompt mr-2">$</span>
                  <span className="text-mission-text">{entry.content}</span>
                </div>
              ) : entry.type === 'output' ? (
                <div className="terminal-output whitespace-pre-line ml-3">
                  {entry.content}
                </div>
              ) : (
                <div className="terminal-error ml-3">
                  {entry.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-3">
        <div className="flex items-center">
          <span className="terminal-prompt mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-input"
            placeholder="Enter command..."
            autoFocus
          />
        </div>
      </form>
    </div>
  )
}

export default CommandTerminal
