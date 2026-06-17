export const desc = 'Remove member from group'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  const sender = m.key.participant || m.key.remoteJid
  const isSudo = db.isSudo(sender.split('@')[0])
  const prefix = db.data.prefix

  logger.cmd('KICK', 'Triggered', { from, sender, args })

  if (!isSudo) return await sock.sendMessage(from, { text: '❌ Owner only' })
  if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Group only' })

  let target = m.message?.extendedTextMessage?.contextInfo?.participant || 
               m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
               (args[0]?.match(/^\d+$/) ? args[0] + '@s.whatsapp.net' : null)

  if (!target) {
    const helpBox = `╭─⌈ 📊 *KICK* ⌋\n├─⊷ *Usage:*\n├─⊷ ${prefix}kick (reply)\n├─⊷ ${prefix}kick @tag\n├─⊷ ${prefix}kick 255xxx\n╰⊷`
    return await sock.sendMessage(from, { text: helpBox })
  }

  try {
    await sock.groupParticipantsUpdate(from, [target], 'remove')
    const successBox = `╭─⌈ ✅ *KICK SUCCESS* ⌋\n├─⊷ *Target:* @${target.split('@')[0]}\n├─⊷ *By:* @${sender.split('@')[0]}\n╰❖ *${db.data.botname} ${db.data.presents}* 🦚`
    await sock.sendMessage(from, { text: successBox, mentions: [target, sender] })
  } catch (e) {
    logger.error('KICK', 'Failed', e.message)
    const errorBox = `╭─⌈ ❌ *KICK FAILED* ⌋\n├─⊷ *Reason:* ${e.message.includes('401') ? 'Bot lacks permission' : 'Operation failed'}\n╰⊷`
    await sock.sendMessage(from, { text: errorBox })
  }
}