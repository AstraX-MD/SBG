export const category = 'group management'
export const desc = 'Make member an admin'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  const sender = m.key.participant || m.key.remoteJid
  const isSudo = db.data.sudo.includes(sender.split('@')[0]) || sender.split('@')[0] === db.data.owner?.split('@')[0]

  if (!isSudo || !from.endsWith('@g.us')) return

  let target = null
  if (m.message?.extendedTextMessage?.contextInfo?.participant) target = m.message.extendedTextMessage.contextInfo.participant
  else if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) target = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  else if (args[0]?.match(/^\d+$/)) target = args[0] + '@s.whatsapp.net'

  if (!target) {
    const helpBox = `╭─⌈ 📊 *PROMOTE* ⌋\n├─⊷ *Usage:*\n├─⊷ ${db.data.prefix}promote reply/tag/number\n╰⊷`
    return await sock.sendMessage(from, { text: helpBox })
  }

  try {
    await sock.groupParticipantsUpdate(from, [target], 'promote')
    const successBox = `╭─⌈ ✅ *PROMOTE SUCCESS* ⌋\n├─⊷ *Admin:* @${target.split('@')[0]}\n├─⊷ *By:* @${sender.split('@')[0]}\n╰❖ *${db.data.botname} ${db.data.presents}* 🦚`
    await sock.sendMessage(from, { text: successBox, mentions: [target, sender] })
  } catch (e) {
    const errorBox = `╭─⌈ ❌ *PROMOTE FAILED* ⌋\n├─⊷ *Reason:* ${e.message.includes('401') ? 'Bot lacks permission' : 'Operation failed'}\n╰⊷`
    await sock.sendMessage(from, { text: errorBox })
  }
}