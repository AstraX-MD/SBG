export const category = 'group management'
export const desc = 'Remove all members from group'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  const sender = m.key.participant || m.key.remoteJid
  const isSudo = db.data.sudo.includes(sender.split('@')[0]) || sender.split('@')[0] === db.data.owner?.split('@')[0]

  if (!isSudo || !from.endsWith('@g.us')) return

  if (db.data.cmdConfirmation && args[0] !== 'confirm') {
    const confirmBox = `╭─⌈ ⚠️ *CONFIRM KICKALL* ⌋\n├─⊷ *Action:* Dangerous operation\n├─⊷ *Target:* All members\n├─⊷ Reply with *${db.data.prefix}kickall confirm*\n╰⊷`
    return await sock.sendMessage(from, { text: confirmBox })
  }

  try {
    const meta = await sock.groupMetadata(from)
    const targets = meta.participants.map(p => p.id).filter(id => id !== sock.user.id && !db.data.sudo.includes(id.split('@')[0]))
    
    await sock.groupParticipantsUpdate(from, targets, 'remove')
    const successBox = `╭─⌈ ✅ *KICKALL SUCCESS* ⌋\n├─⊷ *Removed:* ${targets.length} members\n├─⊷ *By:* @${sender.split('@')[0]}\n╰❖ *${db.data.botname} ${db.data.presents}* 🦚`
    await sock.sendMessage(from, { text: successBox, mentions: [sender] })
  } catch (e) {
    const errorBox = `╭─⌈ ❌ *KICKALL FAILED* ⌋\n├─⊷ *Reason:* ${e.message}\n╰⊷`
    await sock.sendMessage(from, { text: errorBox })
  }
}