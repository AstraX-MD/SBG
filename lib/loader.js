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
          // It's a category folder
          const currentCat = categoriesConfig[item] || { 
            name: item.charAt(0).toUpperCase() + item.slice(1).replace('-', ' '), 
            emoji: '🧩' 
          }
          if (!global.categories[currentCat.name]) {
            global.categories[currentCat.name] = { emoji: currentCat.emoji, commands: [] }
          }
          await scanFolder(fullPath, currentCat.name)
        } else if (item.endsWith('.js')) {
          try {
            // Import file with relative path logic
            const relativePath = fullPath.replace(join(__dirname, '..'), '..').replace(/\\/g, '/')
            const cmdModule = await import(relativePath)
            const cmdName = item.replace('.js', '')
            
            const commandData = { 
              ...cmdModule.default, 
              name: cmdName, 
              category: category || 'Uncategorized',
              emoji: global.categories[category]?.emoji || '🧩'
            }
            
            global.commands.set(cmdName, commandData)
            if (cmdModule.default.alias) {
              cmdModule.default.alias.forEach(a => global.commands.set(a, commandData))
            }
            
            if (category && global.categories[category]) {
              global.categories[category].commands.push(commandData)
            }
            
            logger.pluginLoaded(cmdName, (category || 'UNKNOWN').toUpperCase(), 1)
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
      logger.success('LOADER', `Total ${global.commands.size} plugins loaded across ${Object.keys(global.categories).length} categories`)
    }
  } catch (e) {
    logger.error('LOADER', 'Fatal loader error', e.message)
  }
}
