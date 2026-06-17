import fs from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function initLoader() {
  global.commands = new Map()

  // Load general commands
  const generalDir = join(__dirname, '../plugins/commands/general')
  if (fs.existsSync(generalDir)) {
    const generalFiles = fs.readdirSync(generalDir).filter(file => file.endsWith('.js'))
    for (const file of generalFiles) {
      const cmd = await import(`../plugins/commands/general/${file}`)
      const cmdName = file.replace('.js', '')
      global.commands.set(cmdName, cmd.default)
      logger.pluginLoaded(cmdName, 'GENERAL', 1)
    }
  }

  // Load owner commands
  const ownerDir = join(__dirname, '../plugins/commands/owner')
  if (fs.existsSync(ownerDir)) {
    const ownerFiles = fs.readdirSync(ownerDir).filter(file => file.endsWith('.js'))
    for (const file of ownerFiles) {
      const cmd = await import(`../plugins/commands/owner/${file}`)
      const cmdName = file.replace('.js', '')
      global.commands.set(cmdName, cmd.default)
      logger.pluginLoaded(cmdName, 'OWNER', 1)
    }
  }

  logger.success('LOADER', `Total ${global.commands.size} plugins loaded successfully`)
}
