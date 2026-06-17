export const desc = 'Mention all members'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  if (!db.isSudo((m.key.participant || m.key.remoteJid).split('@')[0]) || !from.endsWith('@g.us')) return

  const msg = args.join(' ') || 'Hello everyone!'
  const meta = await sock.groupMetadata(from)
  const jids = meta.participants.map(p => p.id)
  
  let text = `╭─⌈ 📣 *TAG ALL* ⌋\n├─⊷ *Msg:* ${msg}\n│\n`
  jids.forEach(j => text += `├─⊷ @${j.split('@')[0]}\n`)
  text += `╰⊷`

  await sock.sendMessage(from, { text, mentions: jids })
}