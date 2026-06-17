export const desc = 'Make everyone an admin'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  const sender = m.key.participant || m.key.remoteJid
  const isSudo = db.isSudo(sender.split('@')[0])
  if (!isSudo || !from.endsWith('@g.us')) return

  try {
    const meta = await sock.groupMetadata(from)
    const targets = meta.participants.filter(p => !p.admin).map(p => p.id)
    await sock.groupParticipantsUpdate(from, targets, 'promote')
    await sock.sendMessage(from, { text: `✅ Promoted ${targets.length} members` })
  } catch (e) {
    await sock.sendMessage(from, { text: `❌ Failed: ${e.message}` })
  }
}