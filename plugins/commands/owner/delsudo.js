export default {
  name: 'delsudo',
  alias: ['sudo-'],
  category: 'owner',
  emoji: '🗑️',
  desc: 'Remove sudo user',
  isOwner: true,
  async execute(sock, m, args, db, { isOwner }) {
    logger.cmd('delsudo', 'Triggered', { args })
    if (!isOwner) return

    let number = args[0]?.replace(/[^0-9]/g, '')
    if (!number) {
      if (m.message?.extendedTextMessage?.contextInfo?.participant) {
        number = m.message.extendedTextMessage.contextInfo.participant.split('@')[0]
      } else {
        logger.warn('delsudo', 'No number provided')
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
      logger.info('delsudo', 'Number not found in sudo list')
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
    logger.success('delsudo', `Sudo removed: ${number}`)

    if (db.data.confirmMsg) {
      await sock.sendMessage(m.key.remoteJid, {
        text: `╭❖『 🗑️ DELSUDO 』
│
├❖ *Number:* ${number}
├⊸ *Removed* ✅
│
╰❖ *${db.data.botname}* 🦚`
      })
      logger.success('delsudo', 'Response sent')
    }
  }
}