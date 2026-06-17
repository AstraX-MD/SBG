export default {
  name: 'delsudo',
  alias: ['sudo-'],
  category: 'owner',
  emoji: '🗑️',
  desc: 'Remove sudo user',
  isOwner: true,
  async execute(sock, m, args, db, { isOwner }) {
    if (!isOwner) return

    let number = args[0]?.replace(/[^0-9]/g, '')
    if (!number) {
      if (m.message?.extendedTextMessage?.contextInfo?.participant) {
        number = m.message.extendedTextMessage.contextInfo.participant.split('@')[0]
      } else {
        if (db.data.confirmMsg) {
          await sock.sendMessage(m.key.remoteJid, {
            text: `╭❖『 🗑️ DELSUDO 』
│
├❖ *Usage:* ${db.data.prefix}delsudo 255xxx
│
╰❖ *${db.data.botname}* 🦚`
          })
        }
        return
      }
    }

    if (!db.data.sudo.includes(number)) {
      if (db.data.confirmMsg) {
        await sock.sendMessage(m.key.remoteJid, {
          text: `╭❖『 🗑️ DELSUDO 』
│
├❖ *Number:* ${number}
├⊸ *Not* Sudo
│
╰❖ *${db.data.botname}* 🦚`
        })
      }
      return
    }

    await db.delSudo(number)

    if (db.data.confirmMsg) {
      await sock.sendMessage(m.key.remoteJid, {
        text: `╭❖『 🗑️ DELSUDO 』
│
├❖ *Number:* ${number}
├⊸ *Removed* ✅
│
╰❖ *${db.data.botname}* 🦚`
      })
    }
  }
}