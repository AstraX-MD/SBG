export default {
  name: 'setpresents',
  alias: ['presents'],
  category: 'owner',
  emoji: '✨',
  desc: 'Change presents text',
  isOwner: true,
  async execute(sock, m, args, db, { isOwner }) {
    logger.cmd('setpresents', 'Triggered', { args })
    if (!isOwner) return

    const newPresents = args.join(' ')
    if (!newPresents) {
      logger.warn('setpresents', 'No text provided')
      await sock.sendMessage(m.key.remoteJid, {
        text: `╭❖『 ✨ PRESENTS 』
│
├❖ *Current:* ${db.data.presents}
├❖ *Usage:* ${db.data.prefix}setpresents TEXT
│
╰❖ *${db.data.botname}* 🦚`
      })
      return
    }

    const oldPresents = db.data.presents
    db.data.presents = newPresents
    await db.write()
    logger.success('setpresents', `Presents updated from ${oldPresents} to ${newPresents}`)

    if (db.data.confirmMsg) {
      await sock.sendMessage(m.key.remoteJid, {
        text: `╭❖『 ✨ PRESENTS 』
│
├❖ *From:* ${oldPresents}
├❖ *To:* ${newPresents}
├⊸ *Updated* ✅
│
╰❖ *${db.data.botname}* 🦚`
      })
      logger.success('setpresents', 'Response sent')
    }
  }
}