export const desc = 'Remove all members from group'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  const sender = m.key.participant || m.key.remoteJid
  const isSudo = db.isSudo(sender.split('@')[0])
  const prefix = db.data.prefix

  if (!isSudo || !from.endsWith('@g.us')) return

  if (db.data.confirmMsg && args[0] !== 'confirm') {
    return await sock.sendMessage(from, { text: `⚠️ *DANGER:* This will kick everyone.\nReply with *${prefix}kickall confirm* to proceed.` })
  }

  try {
    const meta = await sock.groupMetadata(from)
    const targets = meta.participants.map(p => p.id).filter(id => id !== sock.user.id && !db.isSudo(id.split('@')[0]))
    
    await sock.groupParticipantsUpdate(from, targets, 'remove')
    await sock.sendMessage(from, { text: `✅ Cleaned ${targets.length} members` })
  } catch (e) {
    await sock.sendMessage(from, { text: `❌ Failed: ${e.message}` })
  }
}