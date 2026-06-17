import fs from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const categoriesConfig = {
  'general': { name: 'General', emoji: '🦚' },
  'group-management': { name: 'Group Management', emoji: '🌼' },
  'owner': { name: 'Technical Prestige', emoji: '👑' },
  'ai': { name: 'AI Power', emoji: '🧠' },
  'download': { name: 'Download', emoji: '📥' }
}

export async function initLoader() {
  try {
    global.commands = new Map()
    global.categories = {}
    
    const commandsPath = join(__dirname, '../plugins/commands')
    if (!fs.existsSync(commandsPath)) {
      logger.error('LOADER', 'Commands folder not found')
      return
    }

    // RECURSIVE SCAN FUNCTION
    const scanFolder = async (dir, category = null) => {
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const fullPath = join(dir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          const currentCatName = categoriesConfig[item]?.name || item.charAt(0).toUpperCase() + item.slice(1).replace('-', ' ')
          const currentEmoji = categoriesConfig[item]?.emoji || '🧩'
          
          if (!global.categories[currentCatName]) {
            global.categories[currentCatName] = { emoji: currentEmoji, commands: [] }
          }
          await scanFolder(fullPath, currentCatName)
        } else if (item.endsWith('.js')) {
          try {
            const relativePath = fullPath.replace(join(__dirname, '..'), '..').replace(/\\/g, '/')
            const cmdModule = await import(relativePath)
            const cmdName = item.replace('.js', '')
            
            const commandData = { 
              ...cmdModule.default, 
              name: cmdName, 
              category: category || 'General',
              emoji: global.categories[category]?.emoji || '🧩'
            }
            
            global.commands.set(cmdName, commandData)
            if (cmdModule.default?.alias) {
              cmdModule.default.alias.forEach(a => global.commands.set(a, commandData))
            }
            
            const catToUse = category || 'General'
            if (!global.categories[catToUse]) {
               global.categories[catToUse] = { emoji: '🦚', commands: [] }
            }
            global.categories[catToUse].commands.push(commandData)
            
            logger.pluginLoaded(cmdName, (category || 'GENERAL').toUpperCase(), 1)
          } catch (e) {
            logger.error('LOADER', `Failed to load ${item}`, e.message)
          }
        }
      }
    }

    await scanFolder(commandsPath)

    if (global.commands.size === 0) {
      logger.error('LOADER', 'CRITICAL: NO COMMANDS LOADED')
    } else {
      logger.success('LOADER', `Total ${global.commands.size} plugins loaded successfully across ${Object.keys(global.categories).length} categories`)
    }
  } catch (e) {
    logger.error('LOADER', 'Fatal loader error', e.message)
  }
}