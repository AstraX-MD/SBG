export const desc = 'Toggle Anti-Spam protection'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  if (!db.isSudo((m.key.participant || m.key.remoteJid).split('@')[0]) || !from.endsWith('@g.us')) return

  if (db.data.antispam.includes(from)) {
    db.data.antispam = db.data.antispam.filter(id => id !== from)
    await db.write()
    await sock.sendMessage(from, { text: `❌ Anti-Spam Disabled` })
  } else {
    db.data.antispam.push(from)
    await db.write()
    await sock.sendMessage(from, { text: `✅ Anti-Spam Enabled` })
  }
}