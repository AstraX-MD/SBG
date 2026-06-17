export default {
  name: 'cmdconfirm',
  alias: ['confirm', 'confirmmsg'],
  category: 'owner',
  emoji: '📢',
  desc: 'Toggle confirmation messages',
  isOwner: true,
  async execute(sock, m, args, db, { isOwner }) {
    if (!isOwner) return

    const option = args[0]?.toLowerCase()

    if (option === 'on' || option === 'true') {
      db.data.confirmMsg = true
      await db.write()
      await sock.sendMessage(m.key.remoteJid, {
        text: `╭❖『 📢 CONFIRM 』
│
├❖ *Status:* ON
├❖ *Note:* Show messages
├⊸ *Enabled* ✅
│
╰❖ *${db.data.botname}* 🦚`
      })
    } else if (option === 'off' || option === 'false') {
      db.data.confirmMsg = false
      await db.write()
    } else {
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