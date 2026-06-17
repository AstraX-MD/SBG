import fs from 'fs'
import path from 'path'

const categoryMap = {
  'general': { name: 'General', emoji: '🦚' },
  'group management': { name: 'Group Management', emoji: '🌼' },
  'ai': { name: 'AI Power', emoji: '🧠' },
  'download': { name: 'Download', emoji: '📥' }
}

export async function loadPlugins() {
  const pluginsDir = path.join(process.cwd(), 'plugins', 'commands')
  global.commands = new Map()
  global.aliases = new Map()
  global.categories = {}

  if (!fs.existsSync(pluginsDir)) return

  const folders = fs.readdirSync(pluginsDir)

  for (const folder of folders) {
    const folderPath = path.join(pluginsDir, folder)
    if (!fs.statSync(folderPath).isDirectory()) continue

    const catKey = folder.toLowerCase()
    const catInfo = categoryMap[catKey] || { name: folder.charAt(0).toUpperCase() + folder.slice(1), emoji: '🧩' }
    
    if (!global.categories[catInfo.name]) {
      global.categories[catInfo.name] = { emoji: catInfo.emoji, commands: [] }
    }

    const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'))

    for (const file of files) {
      try {
        const commandModule = await import(`../plugins/commands/${folder}/${file}`)
        const cmd = commandModule.default
        if (cmd && cmd.name) {
          cmd.category = catInfo.name
          cmd.emoji = cmd.emoji || catInfo.emoji
          global.commands.set(cmd.name, cmd)
          if (cmd.alias && Array.isArray(cmd.alias)) {
            cmd.alias.forEach(a => {
              global.aliases.set(a, cmd.name)
              global.commands.set(a, cmd)
            })
          }
          global.categories[catInfo.name].commands.push(cmd)
        }
      } catch (e) {
        console.error(`Error loading plugin ${file}:`, e)
      }
    }
  }
  console.log('SBG: Plugins loaded successfully')
}
