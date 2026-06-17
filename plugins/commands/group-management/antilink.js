export const category = 'group management'
export const desc = 'Toggle Anti-Link protection'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  const sender = m.key.participant || m.key.remoteJid
  const isSudo = db.data.sudo.includes(sender.split('@')[0]) || sender.split('@')[0] === db.data.owner?.split('@')[0]

  if (!isSudo || !from.endsWith('@g.us')) return

  if (db.data.antilink.includes(from)) {
    db.data.antilink = db.data.antilink.filter(id => id !== from)
    await db.write()
    const box = `╭─⌈ ❌ *ANTILINK* ⌋\n├─⊷ *Status:* DISABLED\n╰❖ *${db.data.botname} ${db.data.presents}* 🦚`
    await sock.sendMessage(from, { text: box })
  } else {
    db.data.antilink.push(from)
    await db.write()
    const box = `╭─⌈ ✅ *ANTILINK* ⌋\n├─⊷ *Status:* ENABLED\n╰❖ *${db.data.botname} ${db.data.presents}* 🦚`
    await sock.sendMessage(from, { text: box })
  }
}