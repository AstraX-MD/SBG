export const category = 'group management'
export const desc = 'Mention all members'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  const sender = m.key.participant || m.key.remoteJid
  const isSudo = db.data.sudo.includes(sender.split('@')[0]) || sender.split('@')[0] === db.data.owner?.split('@')[0]

  if (!isSudo || !from.endsWith('@g.us')) return

  const msg = args.join(' ') || 'Hello everyone!'
  const meta = await sock.groupMetadata(from)
  const jids = meta.participants.map(p => p.id)
  
  let text = `╭─⌈ 📣 *TAG ALL* ⌋\n├─⊷ *Msg:* ${msg}\n│\n`
  jids.forEach(j => text += `├─⊷ @${j.split('@')[0]}\n`)
  text += `│\n╰❖ *${db.data.botname} ${db.data.presents}* 🦚`

  await sock.sendMessage(from, { text, mentions: jids })
}