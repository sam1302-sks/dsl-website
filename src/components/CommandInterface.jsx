import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Send, History, HelpCircle } from 'lucide-react'

const CommandInterface = ({ onCommand, commandHistory }) => {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showHelp, setShowHelp] = useState(false)
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef(null)
  const terminalRef = useRef(null)

  const dslCommands = [
    {
      command: 'track <satellite>',
      description: 'Focus camera on specified satellite',
      example: 'track ISS',
      params: ['ISS', 'LANDSAT8', 'GOES16', 'SENTINEL2A']
    },
    {
      command: 'taskImaging <satellite> <target>',
      description: 'Start imaging mission for satellite',
      example: 'taskImaging LANDSAT8 amazon',
      params: ['LANDSAT8', 'SENTINEL2A']
    },
    {
      command: 'getData <satellite>',
      description: 'Retrieve latest data from satellite',
      example: 'getData LANDSAT8',
      params: ['ISS', 'LANDSAT8', 'GOES16', 'SENTINEL2A']
    },
    {
      command: 'getPowerStatus <satellite>',
      description: 'Get power analysis and predictions',
      example: 'getPowerStatus ISS',
      params: ['ISS', 'LANDSAT8', 'GOES16', 'SENTINEL2A']
    },
    {
      command: 'status',
      description: 'Show system status',
      example: 'status',
      params: []
    },
    {
      command: 'help',
      description: 'Show available commands',
      example: 'help',
      params: []
    }
  ]

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [commandHistory])

  useEffect(() => {
    // Generate suggestions based on input
    if (input.trim()) {
      const matchingCommands = dslCommands.filter(cmd =>
        cmd.command.toLowerCase().includes(input.toLowerCase()) ||
        cmd.description.toLowerCase().includes(input.toLowerCase())
      )
      setSuggestions(matchingCommands.slice(0, 4))
    } else {
      setSuggestions([])
    }
  }, [input])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    onCommand(input.trim())
    setInput('')
    setHistoryIndex(-1)
    setSuggestions([])
  }

  const handleKeyDown = (e) => {
    const commandsOnly = commandHistory.filter(h => h.command)
    
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < commandsOnly.length - 1) {
        const newIndex = historyIndex + 1
        setInput(commandsOnly[commandsOnly.length - 1 - newIndex].command)
        setHistoryIndex(newIndex)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setInput(commandsOnly[commandsOnly.length - 1 - newIndex].command)
        setHistoryIndex(newIndex)
      } else if (historyIndex === 0) {
        setInput('')
        setHistoryIndex(-1)
      }
    } else if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault()
      setInput(suggestions[0].example)
      setSuggestions([])
    }
  }

  const applySuggestion = (suggestion) => {
    setInput(suggestion.example)
    setSuggestions([])
    inputRef.current?.focus()
  }

  return (
    <div className="command-interface">
      {/* Terminal Output */}
      <div className="terminal-output" ref={terminalRef}>
        {commandHistory.length === 0 ? (
          <div className="welcome-message">
            <div className="system-banner">
              <div className="banner-text">
                🛰️ <span className="text-mission-accent">DSL SatOps</span> Command Interface v2.0
              </div>
              <div className="banner-subtext">
                Professional Satellite Operations System
              </div>
            </div>
            <div className="quick-start">
              <div className="quick-start-title">Quick Start:</div>
              <div className="quick-commands">
                <code onClick={() => setInput('track ISS')}>track ISS</code>
                <code onClick={() => setInput('status')}>status</code>
                <code onClick={() => setInput('help')}>help</code>
              </div>
            </div>
          </div>
        ) : (
          <div className="command-log">
            {commandHistory.map((entry, index) => (
              <motion.div
                key={entry.id}
                className="command-entry"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Command Input */}
                <div className="command-line">
                  <span className="prompt">DSL&gt;</span>
                  <span className="command-text">{entry.command}</span>
                  <span className="timestamp">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                {/* Command Result */}
                <div className={`command-result ${entry.status}`}>
                  {entry.status === 'executing' && (
                    <div className="executing-indicator">
                      <div className="spinner"></div>
                      <span>Executing...</span>
                    </div>
                  )}
                  {entry.status === 'success' && (
                    <div className="success-result">
                      <span className="status-icon">✓</span>
                      <span>{entry.result}</span>
                    </div>
                  )}
                  {entry.status === 'error' && (
                    <div className="error-result">
                      <span className="status-icon">✗</span>
                      <span>{entry.result}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Command Suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          className="suggestions-panel"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => applySuggestion(suggestion)}
            >
              <div className="suggestion-command">{suggestion.command}</div>
              <div className="suggestion-description">{suggestion.description}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Command Input */}
      <form onSubmit={handleSubmit} className="command-input-form">
        <div className="input-container">
          <span className="input-prompt">DSL&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="command-input"
            placeholder="Enter DSL command... (TAB for autocomplete)"
            autoComplete="off"
            autoFocus
          />
          <div className="input-actions">
            <button
              type="button"
              className="help-button"
              onClick={() => setShowHelp(!showHelp)}
              title="Show Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              type="submit"
              className="send-button"
              disabled={!input.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Help Panel */}
      {showHelp && (
        <motion.div
          className="help-panel"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="help-header">
            <h3>DSL Commands Reference</h3>
          </div>
          <div className="help-commands">
            {dslCommands.map((cmd, index) => (
              <div key={index} className="help-command">
                <div className="help-command-syntax">
                  <code>{cmd.command}</code>
                </div>
                <div className="help-command-description">
                  {cmd.description}
                </div>
                <div className="help-command-example">
                  Example: <code onClick={() => setInput(cmd.example)}>
                    {cmd.example}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default CommandInterface
