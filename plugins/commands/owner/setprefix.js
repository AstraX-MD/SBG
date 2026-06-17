export default {
  name: 'setprefix',
  alias: ['prefix'],
  category: 'owner',
  emoji: '⚙️',
  desc: 'Change prefix',
  isOwner: true,
  async execute(sock, m, args, db, { isOwner }) {
    logger.cmd('setprefix', 'Triggered', { args })
    if (!isOwner) return

    const newPrefix = args[0]
    if (!newPrefix) {
      logger.warn('setprefix', 'No prefix provided')
      await sock.sendMessage(m.key.remoteJid, {
        text: `╭❖『 ⚙️ PREFIX 』
│
├❖ *Current:* ${db.data.prefix}
├❖ *Usage:* ${db.data.prefix}setprefix!
│
╰❖ *${db.data.botname}* 🦚`
      })
      return
    }

    const oldPrefix = db.data.prefix
    db.data.prefix = newPrefix
    await db.write()
    logger.success('setprefix', `Prefix updated from ${oldPrefix} to ${newPrefix}`)

    if (db.data.confirmMsg) {
      await sock.sendMessage(m.key.remoteJid, {
        text: `╭❖『 ⚙️ PREFIX 』
│
├❖ *From:* ${oldPrefix}
├❖ *To:* ${newPrefix}
├⊸ *Updated* ✅
│
╰❖ *${db.data.botname}* 🦚`
      })
      logger.success('setprefix', 'Response sent')
    }
  }
}