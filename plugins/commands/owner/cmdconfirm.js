export default {
  name: 'cmdconfirm',
  alias: ['confirm', 'confirmmsg'],
  category: 'owner',
  emoji: '📢',
  desc: 'Toggle confirmation messages',
  isOwner: true,
  async execute(sock, m, args, db, { isOwner }) {
    logger.cmd('cmdconfirm', 'Triggered', { args })
    if (!isOwner) return

    const option = args[0]?.toLowerCase()

    if (option === 'on' || option === 'true') {
      db.data.confirmMsg = true
      await db.write()
      logger.info('cmdconfirm', 'Status set to ON')
      await sock.sendMessage(m.key.remoteJid, {
        text: `╭❖『 📢 CONFIRM 』
│
├❖ *Status:* ON
├❖ *Note:* Show messages
├⊸ *Enabled* ✅
│
╰❖ *${db.data.botname}* 🦚`
      })
      logger.success('cmdconfirm', 'Confirmation sent')
    } else if (option === 'off' || option === 'false') {
      db.data.confirmMsg = false
      await db.write()
      logger.info('cmdconfirm', 'Status set to OFF')
    } else {
      logger.warn('cmdconfirm', 'Invalid input')
      await sock.sendMessage(m.key.remoteJid, {
        text: `╭❖『 📢 CONFIRM 』
│
├❖ *Current:* ${db.data.confirmMsg ? 'ON' : 'OFF'}
├❖ *Usage:* ${db.data.prefix}cmdconfirm on/off
│
╰❖ *${db.data.botname}* 🦚`
      })
    }
  }
}