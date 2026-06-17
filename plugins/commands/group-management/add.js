export const desc = 'Add member by number'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  const isSudo = db.isSudo((m.key.participant || m.key.remoteJid).split('@')[0])
  if (!isSudo || !from.endsWith('@g.us')) return

  const num = args[0]?.replace(/[^0-9]/g, '')
  if (!num) return await sock.sendMessage(from, { text: `Usage: ${db.data.prefix}add 255xxx` })

  try {
    await sock.groupParticipantsUpdate(from, [num + '@s.whatsapp.net'], 'add')
    await sock.sendMessage(from, { text: `✅ Added ${num}` })
  } catch (e) {
    await sock.sendMessage(from, { text: `❌ Failed: User's privacy might block this.` })
  }
}