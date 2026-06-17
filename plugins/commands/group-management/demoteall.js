export const desc = 'Remove all admins'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  const sender = m.key.participant || m.key.remoteJid
  const isSudo = db.isSudo(sender.split('@')[0])
  if (!isSudo || !from.endsWith('@g.us')) return

  try {
    const meta = await sock.groupMetadata(from)
    const targets = meta.participants.filter(p => p.admin && p.id !== sock.user.id).map(p => p.id)
    await sock.groupParticipantsUpdate(from, targets, 'demote')
    await sock.sendMessage(from, { text: `✅ Demoted ${targets.length} admins` })
  } catch (e) {
    await sock.sendMessage(from, { text: `❌ Failed: ${e.message}` })
  }
}