export default {
  name: 'addsudo',
  alias: ['sudo+'],
  category: 'owner',
  emoji: '👑',
  desc: 'Add sudo user',
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
            text: `╭❖『 👑 SUDO 』
│
├❖ *Usage:* ${db.data.prefix}addsudo 255xxx
├⊸ *Reply/Tag* user
│
╰❖ *${db.data.botname}* 🦚`
          })
        }
        return
      }
    }

    if (db.data.sudo.includes(number)) {
      if (db.data.confirmMsg) {
        await sock.sendMessage(m.key.remoteJid, {
          text: `╭❖『 👑 SUDO 』
│
├❖ *Number:* ${number}
├⊸ *Already* Sudo
│
╰❖ *${db.data.botname}* 🦚`
        })
      }
      return
    }

    await db.addSudo(number)

    if (db.data.confirmMsg) {
      await sock.sendMessage(m.key.remoteJid, {
        text: `╭❖『 👑 SUDO 』
│
├❖ *Number:* ${number}
├⊸ *Added* ✅
│
╰❖ *${db.data.botname}* 🦚`
      })
    }
  }
}