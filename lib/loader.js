import fs from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function initLoader() {
  global.commands = new Map()
  global.categories = {}
  
  const categoriesConfig = {
    'general': { name: 'General', emoji: '🦚' },
    'group-management': { name: 'Group Management', emoji: '🌼' },
    'owner': { name: 'Technical Prestige', emoji: '👑' },
    'ai': { name: 'AI Power', emoji: '🧠' },
    'download': { name: 'Download', emoji: '📥' }
  }

  const commandsPath = join(__dirname, '../plugins/commands')
  const folders = fs.readdirSync(commandsPath)

  for (const folder of folders) {
    const folderPath = join(commandsPath, folder)
    if (!fs.statSync(folderPath).isDirectory()) continue

    const conf = categoriesConfig[folder] || { name: folder.charAt(0).toUpperCase() + folder.slice(1), emoji: '🧩' }
    global.categories[conf.name] = { emoji: conf.emoji, commands: [] }

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'))
    for (const file of files) {
      try {
        const cmd = await import(`../plugins/commands/${folder}/${file}`)
        const cmdName = file.replace('.js', '')
        const commandData = { ...cmd.default, name: cmdName, category: conf.name, emoji: conf.emoji }
        
        global.commands.set(cmdName, commandData)
        if (cmd.default.alias) {
          cmd.default.alias.forEach(a => global.commands.set(a, commandData))
        }
        
        global.categories[conf.name].commands.push(commandData)
        logger.pluginLoaded(cmdName, conf.name.toUpperCase(), 1)
      } catch (e) {
        logger.error('LOADER', `Failed to load ${folder}/${file}`, e.message)
      }
    }
  }

  logger.success('LOADER', `Total ${global.commands.size} plugins loaded across ${Object.keys(global.categories).length} categories`)
}