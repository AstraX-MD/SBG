export const desc = 'List active warnings'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  const entries = Object.entries(db.data.warnings).filter(([_, count]) => count > 0)
  
  if (entries.length === 0) return await sock.sendMessage(from, { text: '📋 No active warnings' })
  
  let text = `╭─⌈ ⚠️ *WARNING LIST* ⌋\n`
  entries.forEach(([num, count]) => text += `├─⊷ @${num}: ${count}/3\n`)
  text += `╰⊷`
  
  await sock.sendMessage(from, { text, mentions: entries.map(e => e[0] + '@s.whatsapp.net') })
}