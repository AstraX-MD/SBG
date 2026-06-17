import pino from 'pino'

const logger = pino({ level: 'silent' })

export const cmdStats = {
  today: 0,
  total: 0,
  commands: {},
  history: []
}

export function logCommand(name) {
  cmdStats.today++
  cmdStats.total++
  cmdStats.commands[name] = (cmdStats.commands[name] || 0) + 1
  cmdStats.history.unshift({
    name,
    time: new Date().toLocaleTimeString()
  })
  if (cmdStats.history.length > 20) cmdStats.history.pop()
}

// Reset today count at midnight
setInterval(() => {
  const now = new Date()
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    cmdStats.today = 0
  }
}, 60000)

export default logger
