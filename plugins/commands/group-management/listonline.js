export const desc = 'List active participants'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  if (!from.endsWith('@g.us')) return

  try {
    const meta = await sock.groupMetadata(from)
    const members = meta.participants.map(p => `@${p.id.split('@')[0]}`)
    const text = `╭─⌈ 🟢 *GROUP MEMBERS* ⌋\n│\n├─⊷ ${members.join('\n├─⊷ ')}\n│\n╰⊷`
    await sock.sendMessage(from, { text, mentions: meta.participants.map(p => p.id) })
  } catch (e) {
    await sock.sendMessage(from, { text: `❌ Failed` })
  }
}