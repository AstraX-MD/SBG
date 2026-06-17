export const category = 'group management'
export const desc = 'Remove member from group'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  const sender = m.key.participant || m.key.remoteJid
  const isSudo = db.data.sudo.includes(sender.split('@')[0]) || sender.split(':')[0].split('@')[0] === sock.user.id.split(':')[0].split('@')[0] || sender.split('@')[0] === db.data.owner?.split('@')[0]

  logger.cmd('KICK', 'Triggered', { from, sender, args })

  if (!isSudo) {
    const errorBox = `╭─⌈ ❌ *UNAUTHORIZED* ⌋\n├─⊷ *Reason:* Owner only\n╰⊷`
    return await sock.sendMessage(from, { text: errorBox })
  }

  if (!from.endsWith('@g.us')) {
    const errorBox = `╭─⌈ ❌ *INVALID CHAT* ⌋\n├─⊷ *Reason:* Group command only\n╰⊷`
    return await sock.sendMessage(from, { text: errorBox })
  }

  let target = null
  let targetName = 'Unknown'

  if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    target = m.message.extendedTextMessage.contextInfo.participant
    targetName = target.split('@')[0]
  }
  else if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    target = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
    targetName = target.split('@')[0]
  }
  else if (args[0]?.match(/^\d+$/)) {
    target = args[0] + '@s.whatsapp.net'
    targetName = args[0]
  }

  if (!target) {
    const helpBox = `╭─⌈ 📊 *KICK* ⌋\n├─⊷ *Usage:*\n├─⊷ ${db.data.prefix}kick reply (message)\n├─⊷ ${db.data.prefix}kick tag (@tag someone)\n├─⊷ ${db.data.prefix}kick <number>\n╰⊷`
    return await sock.sendMessage(from, { text: helpBox })
  }

  try {
    await sock.groupParticipantsUpdate(from, [target], 'remove')
    logger.success('KICK', `Kicked ${targetName}`, { from })
    const successBox = `╭─⌈ ✅ *KICK SUCCESS* ⌋\n├─⊷ *Removed:* @${targetName}\n├─⊷ *By:* @${sender.split('@')[0]}\n╰❖ *${db.data.botname} ${db.data.presents}* 🦚`
    await sock.sendMessage(from, { text: successBox, mentions: [target, sender] })
  } catch (e) {
    logger.error('KICK', 'Failed', e.message)
    let errorMsg = 'Unknown error'
    if (e.message.includes('404')) errorMsg = 'Person not found'
    else if (e.message.includes('403')) errorMsg = 'Cannot kick this user'
    else if (e.message.includes('401')) errorMsg = 'Bot lacks permission'
    
    const errorBox = `╭─⌈ ❌ *KICK FAILED* ⌋\n├─⊷ *Target:* @${targetName}\n├─⊷ *Reason:* ${errorMsg}\n╰⊷`
    await sock.sendMessage(from, { text: errorBox, mentions: [target] })
  }
}