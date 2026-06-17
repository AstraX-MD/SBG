export const desc = 'Open group for everyone'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  if (!db.isSudo((m.key.participant || m.key.remoteJid).split('@')[0]) || !from.endsWith('@g.us')) return

  try {
    await sock.groupSettingUpdate(from, 'not_announcement')
    await sock.sendMessage(from, { text: `🔓 Group Opened. Everyone can message.` })
  } catch (e) {
    await sock.sendMessage(from, { text: `❌ Failed` })
  }
}