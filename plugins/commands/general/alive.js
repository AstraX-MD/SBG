export default {
  name: 'alive',
  alias: ['bot'],
  category: 'general',
  emoji: '✨',
  desc: 'Bot status',
  async execute(sock, m, args, db) {
    const text = `╭❖『 ✨ ALIVE 』
│
├❖ *${db.botname}* is Online
├❖ *Mode:* ${db.mode}
├❖ *Prefix:* ${db.prefix}
├⊸ *Ready* ✅
│
╰❖ *${db.botname} ${db.presents}* 🦚`
    
    await sock.sendMessage(m.key.remoteJid, { text })
  }
}