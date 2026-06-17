export default {
  name: 'alive',
  alias: ['bot'],
  category: 'general',
  emoji: '✨',
  desc: 'Bot status',
  async execute(sock, m, args, db) {
    const prefixDisplay = db.noprefix ? 'Off' : db.prefix
    const text = `╭❖『 ✨ ALIVE 』
│
├❖ *${db.botname}* Online
├❖ *Mode:* ${db.mode}
├❖ *Prefix:* ${prefixDisplay}
│
╰❖ *${db.botname} ${db.presents}* 🦚`
    
    await sock.sendMessage(m.key.remoteJid, { text })
  }
}
