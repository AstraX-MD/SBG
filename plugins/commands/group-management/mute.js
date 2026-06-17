export const desc = 'Close group for members'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  if (!db.isSudo((m.key.participant || m.key.remoteJid).split('@')[0]) || !from.endsWith('@g.us')) return

  try {
    await sock.groupSettingUpdate(from, 'announcement')
    await sock.sendMessage(from, { text: `🔒 Group Closed. Admins only.` })
  } catch (e) {
    await sock.sendMessage(from, { text: `❌ Failed` })
  }
}