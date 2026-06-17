export const desc = 'List group admins'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  if (!from.endsWith('@g.us')) return

  const meta = await sock.groupMetadata(from)
  const admins = meta.participants.filter(p => p.admin).map(p => `@${p.id.split('@')[0]}`)
  
  const text = `╭─⌈ 🛡️ *ADMINS* ⌋\n│\n├─⊷ ${admins.join('\n├─⊷ ')}\n│\n╰⊷`
  await sock.sendMessage(from, { text, mentions: meta.participants.filter(p => p.admin).map(p => p.id) })
}