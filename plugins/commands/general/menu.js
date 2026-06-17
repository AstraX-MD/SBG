import os from 'os'

export default {
  name: 'menu',
  alias: ['help', 'list'],
  category: 'general',
  emoji: '☀️',
  desc: 'Show commands',
  async execute(sock, m, args, db) {
    logger.cmd('menu', 'Triggered', { from: m.key.remoteJid, sender: m.pushName })
    try {
      const uptime = process.uptime()
      const h = Math.floor(uptime / 3600)
      const min = Math.floor((uptime % 3600) / 60)
      const sec = Math.floor(uptime % 60)
      
      const mem = process.memoryUsage()
      const used = (mem.rss / 1024 / 1024).toFixed(1)
      const total = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1)
      const ramP = ((mem.rss / os.totalmem()) * 100).toFixed(0)
      const ramBar = '█'.repeat(Math.min(Math.floor(ramP/10), 10)) + '░'.repeat(Math.max(10-Math.floor(ramP/10), 0))

      const modes = {
        'public': '🌍 Public',
        'private': '🔒 Private',
        'groups': '👥 Groups',
        'dms': '📩 DMs',
        'channel': '📢 Channel',
        'silent': '🔕 Silent',
        'onlytag': '🏷️ OnlyTag',
        'onlynum': '📱 OnlyNum',
        'onlyjid': '🎯 OnlyJID'
      }
      
      let text = `╭⊷『 ☀️ ${db.data.botname} MENU 』
│
├⊷ Status: ONLINE
├⊷ User: ${m.pushName || 'User'}
├⊷ Mode: ${modes[db.data.mode] || '🌍 Public'}
├⊷ Prefix: ${db.data.prefix}
├⊷ Uptime: ${h}h ${min}m ${sec}s
├⊷ Platform: 🚀 ${db.data.platform}
├⊷ RAM: ${ramBar} ${ramP}%
├⊷ Memory: ${used}MB / ${total}GB
│
❖\n\n`
      
      for (const [catName, catData] of Object.entries(global.categories)) {
        if (catData.commands.length === 0) continue
        text += `╭⊷『 ${catData.emoji} ${catName.toUpperCase()} 』\n`
        text += `│ ${catData.commands.map(c => c.name).join('\n│ ')}\n`
        text += `╰❖\n\n`
      }
      
      text += `╰❖ *${db.data.botname} ${db.data.presents}* 🦚`
      
      await sock.sendMessage(m.key.remoteJid, { text })
      logger.success('menu', 'Response sent', { to: m.key.remoteJid })
    } catch (e) {
      logger.error('menu', 'Failed', e.message)
    }
  }
}