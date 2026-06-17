export const desc = 'Change group description'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  if (!db.isSudo((m.key.participant || m.key.remoteJid).split('@')[0]) || !from.endsWith('@g.us')) return

  const descText = args.join(' ')
  if (!descText) return
  
  try {
    await sock.groupUpdateDescription(from, descText)
    await sock.sendMessage(from, { text: `✅ Group description updated` })
  } catch (e) {
    await sock.sendMessage(from, { text: `❌ Failed` })
  }
}