export const desc = 'Change group name'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  if (!db.isSudo((m.key.participant || m.key.remoteJid).split('@')[0]) || !from.endsWith('@g.us')) return

  const name = args.join(' ')
  if (!name) return
  
  try {
    await sock.groupUpdateSubject(from, name)
    await sock.sendMessage(from, { text: `✅ Group name set to: ${name}` })
  } catch (e) {
    await sock.sendMessage(from, { text: `❌ Failed` })
  }
}