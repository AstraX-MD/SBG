export const desc = 'Reset group invite link'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  if (!db.isSudo((m.key.participant || m.key.remoteJid).split('@')[0]) || !from.endsWith('@g.us')) return

  try {
    await sock.groupRevokeInvite(from)
    await sock.sendMessage(from, { text: `✅ Group link revoked and reset` })
  } catch (e) {
    await sock.sendMessage(from, { text: `❌ Failed` })
  }
}