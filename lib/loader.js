import fs from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function initLoader() {
  global.commands = new Map()
  let totalCmd = 0

  // Load general commands
  const generalPath = join(__dirname, '../plugins/commands/general')
  if (fs.existsSync(generalPath)) {
    const generalFiles = fs.readdirSync(generalPath).filter(f => f.endsWith('.js'))
    for (const file of generalFiles) {
      try {
        const cmd = await import(`../plugins/commands/general/${file}`)
        const cmdName = file.replace('.js', '')
        global.commands.set(cmdName, cmd.default)
        totalCmd++
        logger.pluginLoaded(cmdName, 'GENERAL', 1)
      } catch (e) {
        logger.error('LOADER', `Failed to load ${file}`, e.message)
      }
    }
  }

  // Load owner commands
  const ownerPath = join(__dirname, '../plugins/commands/owner')
  if (fs.existsSync(ownerPath)) {
    const ownerFiles = fs.readdirSync(ownerPath).filter(f => f.endsWith('.js'))
    for (const file of ownerFiles) {
      try {
        const cmd = await import(`../plugins/commands/owner/${file}`)
        const cmdName = file.replace('.js', '')
        global.commands.set(cmdName, cmd.default)
        totalCmd++
        logger.pluginLoaded(cmdName, 'OWNER', 1)
      } catch (e) {
        logger.error('LOADER', `Failed to load ${file}`, e.message)
      }
    }
  }

  logger.success('LOADER', `Total ${totalCmd} plugins loaded successfully`)
}