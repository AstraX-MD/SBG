export default {
  name: 'alive',
  alias: ['bot'],
  category: 'general',
  emoji: '✨',
  desc: 'Bot status',
  async execute(sock, m, args, db) {
    logger.cmd('alive', 'Triggered', { from: m.key.remoteJid, sender: m.pushName })
    try {
      const prefixDisplay = db.data.noprefix ? 'Off' : db.data.prefix
      const text = `╭❖『 ✨ ALIVE 』
│
├❖ *${db.data.botname}* Online
├❖ *Mode:* ${db.data.mode}
├❖ *Prefix:* ${prefixDisplay}
│
╰❖ *${db.data.botname} ${db.data.presents}* 🦚`
      
      await sock.sendMessage(m.key.remoteJid, { text })
      logger.success('alive', 'Response sent', { to: m.key.remoteJid })
    } catch (e) {
      logger.error('alive', 'Failed', e.message)
    }
  }
}