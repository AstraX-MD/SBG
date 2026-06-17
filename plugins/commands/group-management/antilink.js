export const desc = 'Toggle Anti-Link protection'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  if (!db.isSudo((m.key.participant || m.key.remoteJid).split('@')[0]) || !from.endsWith('@g.us')) return

  if (db.data.antilink.includes(from)) {
    db.data.antilink = db.data.antilink.filter(id => id !== from)
    await db.write()
    await sock.sendMessage(from, { text: `❌ Anti-Link Disabled` })
  } else {
    db.data.antilink.push(from)
    await db.write()
    await sock.sendMessage(from, { text: `✅ Anti-Link Enabled` })
  }
}