export default {
  name: 'cmdreact',
  alias: ['react'],
  category: 'owner',
  emoji: '💫',
  desc: 'Toggle command reactions',
  isOwner: true,
  async execute(sock, m, args, db, { isOwner }) {
    if (!isOwner) return

    const option = args[0]?.toLowerCase()

    if (option === 'on' || option === 'true') {
      db.data.cmdreact = true
      await db.write()
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
      }
    } else if (option === 'off' || option === 'false') {
      db.data.cmdreact = false
      await db.write()
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
      }
    } else {
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