export default {
  name: 'setbotname',
  alias: ['botname'],
  category: 'owner',
  emoji: '🏷️',
  desc: 'Change bot name',
  isOwner: true,
  async execute(sock, m, args, db, { isOwner }) {
    logger.cmd('setbotname', 'Triggered', { args })
    if (!isOwner) return

    const newName = args.join(' ')
    if (!newName) {
      logger.warn('setbotname', 'No name provided')
      await sock.sendMessage(m.key.remoteJid, {
        text: `╭❖『 🏷️ BOTNAME 』
│
├❖ *Current:* ${db.data.botname}
├❖ *Usage:* ${db.data.prefix}setbotname NAME
│
╰❖ *${db.data.botname}* 🦚`
      })
      return
    }

    const oldName = db.data.botname
    db.data.botname = newName
    await db.write()
    logger.success('setbotname', `Name updated from ${oldName} to ${newName}`)

    if (db.data.confirmMsg) {
      await sock.sendMessage(m.key.remoteJid, {
        text: `╭❖『 🏷️ BOTNAME 』
│
├❖ *From:* ${oldName}
├❖ *To:* ${newName}
├⊸ *Updated* ✅
│
╰❖ *${db.data.botname}* 🦚`
      })
      logger.success('setbotname', 'Response sent')
    }
  }
}