import fs from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { setCommands, setObservers } from './router.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PLUGINS_DIR = join(process.cwd(), 'plugins')
const COMMANDS_DIR = join(PLUGINS_DIR, 'commands')

export async function initLoader() {
  try {
    const commands = new Map()
    const observers = new Map()

    const scanFolder = async (dir, category = null) => {
      if (!fs.existsSync(dir)) return
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const fullPath = join(dir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          const currentCat = item.replace('-', ' ')
          await scanFolder(fullPath, currentCat)
        } else if (item.endsWith('.js')) {
          try {
            const relativePath = 'file://' + fullPath
            const cmdModule = await import(relativePath)
            const cmdName = item.replace('.js', '')
            
            const commandData = { 
              ...cmdModule.default, 
              name: cmdName, 
              category: category || 'general'
            }
            
            commands.set(cmdName, commandData)
            logger.pluginLoaded(cmdName, (category || 'GENERAL').toUpperCase(), 1)
          } catch (e) {
            logger.error('LOADER', `Failed to load ${item}`, e.message)
          }
        }
      }
    }

    await scanFolder(COMMANDS_DIR)

    setCommands(commands)
    setObservers(observers)
    
    logger.success('LOADER', `Total ${commands.size} plugins loaded successfully and registered to router`)
    return true
  } catch (e) {
    logger.error('LOADER', 'Fatal loader error', e.message)
    return false
  }
}