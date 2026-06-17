export const desc = 'Show group details'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  if (!from.endsWith('@g.us')) return

  try {
    const meta = await sock.groupMetadata(from)
    const text = `╭─⌈ 📊 *GROUP INFO* ⌋
├─⊷ *Name:* ${meta.subject}
├─⊷ *Owner:* @${meta.owner?.split('@')[0] || 'Unknown'}
├─⊷ *Members:* ${meta.participants.length}
├─⊷ *Admins:* ${meta.participants.filter(p => p.admin).length}
├─⊷ *Created:* ${new Date(meta.creation * 1000).toLocaleString()}
╰⊷`
    await sock.sendMessage(from, { text, mentions: [meta.owner].filter(Boolean) })
  } catch (e) {
    await sock.sendMessage(from, { text: `❌ Failed` })
  }
}