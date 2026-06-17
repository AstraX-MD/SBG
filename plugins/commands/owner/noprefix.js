export default {
  name: 'noprefix',
  alias: ['np'],
  category: 'owner',
  emoji: '🔧',
  desc: 'Toggle no prefix mode',
  isOwner: true,
  async execute(sock, m, args, db, { isOwner }) {
    if (!isOwner) return

    const option = args[0]?.toLowerCase()

    if (option === 'on' || option === 'true') {
      db.data.noprefix = true
      await db.write()
      if (db.data.confirmMsg) {
        await sock.sendMessage(m.key.remoteJid, {
          text: `╭❖『 🔧 NOPREFIX 』
│
├❖ *Status:* ON
├❖ *Note:* Both work
├⊸ *ping* ✅
├⊸ *${db.data.prefix}ping* ✅
│
╰❖ *${db.data.botname}* 🦚`
        })
      }
    } else if (option === 'off' || option === 'false') {
      db.data.noprefix = false
      await db.write()
      if (db.data.confirmMsg) {
        await sock.sendMessage(m.key.remoteJid, {
          text: `╭❖『 🔧 NOPREFIX 』
│
├❖ *Status:* OFF
├❖ *Note:* Prefix only
├⊸ *${db.data.prefix}ping* ✅
├⊸ *ping* ❌
│
╰❖ *${db.data.botname}* 🦚`
        })
      }
    } else {
      await sock.sendMessage(m.key.remoteJid, {
        text: `╭❖『 🔧 NOPREFIX 』
│
├❖ *Current:* ${db.data.noprefix ? 'ON' : 'OFF'}
├❖ *Usage:* ${db.data.prefix}noprefix on/off
│
╰❖ *${db.data.botname}* 🦚`
      })
    }
  }
}