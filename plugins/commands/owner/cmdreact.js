export default {
  name: 'cmdreact',
  alias: ['react'],
  category: 'owner',
  emoji: '💫',
  desc: 'Toggle command reactions',
  isOwner: true,
  async execute(sock, m, args, db, { isOwner }) {
    logger.cmd('cmdreact', 'Triggered', { args })
    if (!isOwner) return

    const option = args[0]?.toLowerCase()

    if (option === 'on' || option === 'true') {
      db.data.cmdreact = true
      await db.write()
      logger.info('cmdreact', 'Status set to ON')
      if (db.data.confirmMsg) {
        await sock.sendMessage(m.key.remoteJid, {
          text: `╭❖『 💫 CMDREACT 』
│
├❖ *Status:* ON
├❖ *Note:* Commands react
├⊸ *Enabled* ✅
│
╰❖ *${db.data.botname}* 🦚`
        })
        logger.success('cmdreact', 'Confirmation sent')
      }
    } else if (option === 'off' || option === 'false') {
      db.data.cmdreact = false
      await db.write()
      logger.info('cmdreact', 'Status set to OFF')
      if (db.data.confirmMsg) {
        await sock.sendMessage(m.key.remoteJid, {
          text: `╭❖『 💫 CMDREACT 』
│
├❖ *Status:* OFF
├❖ *Note:* No reactions
├⊸ *Disabled* ✅
│
╰❖ *${db.data.botname}* 🦚`
        })
        logger.success('cmdreact', 'Confirmation sent')
      }
    } else {
      logger.warn('cmdreact', 'Invalid input')
      await sock.sendMessage(m.key.remoteJid, {
        text: `╭❖『 💫 CMDREACT 』
│
├❖ *Current:* ${db.data.cmdreact ? 'ON' : 'OFF'}
├❖ *Usage:* ${db.data.prefix}cmdreact on/off
│
╰❖ *${db.data.botname}* 🦚`
      })
    }
  }
}