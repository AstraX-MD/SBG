export default {
  name: 'addsudo',
  alias: ['sudo+'],
  category: 'owner',
  emoji: '👑',
  desc: 'Add sudo user',
  isOwner: true,
  async execute(sock, m, args, db, { isOwner }) {
    logger.cmd('addsudo', 'Triggered', { args })
    if (!isOwner) return

    let number = args[0]?.replace(/[^0-9]/g, '')
    if (!number) {
      if (m.message?.extendedTextMessage?.contextInfo?.participant) {
        number = m.message.extendedTextMessage.contextInfo.participant.split('@')[0]
      } else {
        logger.warn('addsudo', 'No number provided')
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
      logger.info('addsudo', 'Number already exists in sudo list')
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
    logger.success('addsudo', `Sudo added: ${number}`)

    if (db.data.confirmMsg) {
      await sock.sendMessage(m.key.remoteJid, {
        text: `╭❖『 👑 SUDO 』
│
├❖ *Number:* ${number}
├⊸ *Added* ✅
│
╰❖ *${db.data.botname}* 🦚`
      })
      logger.success('addsudo', 'Response sent')
    }
  }
}